import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import Supplier from "./models/supplier"
import Receipt from "./models/receipt"
import ReceiptLine from "./models/receipt-line"
import Batch from "./models/batch"
import {
  assertReceiptTransition,
  consumeFifo,
  inventoryCostValue,
  lineCost,
  ReceiptSource,
  ReceiptStatus,
} from "./models/constants"

type ReceiptLineInput = {
  variant_id?: string | null
  recognized_title?: string | null
  material_kind?: string | null
  quantity: number
  unit: string
  unit_cost: number
  expires_at?: Date | null
}

// Сервис закупа: поставщики, приходы, FIFO-партии себестоимости. CRUD генерируется
// MedusaService; здесь — инварианты: пересчёт стоимости строк/прихода, стейт-машина
// прихода, порождение партий при проводке, FIFO-списание. Увеличение остатка в
// inventory ЯДРА при проводке — слой workflow post-receipt (подзадача 1b), не
// модуль (модули не импортируют ядро). См. docs/modules/procurement.md.
class ProcurementModuleService extends MedusaService({
  Supplier,
  Receipt,
  ReceiptLine,
  Batch,
}) {
  // Завести поставщика (по умолчанию активен).
  async createSupplier(input: {
    name: string
    bin?: string | null
    contact_phone?: string | null
    contact_email?: string | null
    note?: string | null
  }) {
    return await this.createSuppliers({
      name: input.name,
      bin: input.bin ?? null,
      contact_phone: input.contact_phone ?? null,
      contact_email: input.contact_email ?? null,
      note: input.note ?? null,
      active: true,
    })
  }

  // Создать черновик прихода со строками. Считает line_cost по каждой строке и
  // total_cost прихода. Строки могут быть без variant_id (ИИ-черновик до
  // сопоставления с SKU) — проводка их не пропустит.
  async createDraftReceipt(input: {
    location_id: string
    supplier_id?: string | null
    reference?: string | null
    source?: ReceiptSource
    note?: string | null
    document_file_id?: string | null
    received_at?: Date | null
    lines: ReceiptLineInput[]
  }) {
    const lines = input.lines.map((l) => ({
      variant_id: l.variant_id ?? null,
      recognized_title: l.recognized_title ?? null,
      material_kind: l.material_kind ?? null,
      quantity: l.quantity,
      unit: l.unit,
      unit_cost: l.unit_cost,
      line_cost: lineCost(l.quantity, l.unit_cost),
      expires_at: l.expires_at ?? null,
    }))
    const total_cost = lines.reduce((sum, l) => sum + l.line_cost, 0)
    // Родитель + строки создаются раздельно (createReceipts не принимает вложенные
    // create-объекты — только id-связи); идиома estimator.createManualEstimate.
    const receipt = await this.createReceipts({
      location_id: input.location_id,
      supplier_id: input.supplier_id ?? null,
      reference: input.reference ?? null,
      source: input.source ?? "manual",
      note: input.note ?? null,
      document_file_id: input.document_file_id ?? null,
      received_at: input.received_at ?? null,
      status: "draft",
      total_cost,
    })
    if (lines.length > 0) {
      await this.createReceiptLines(
        lines.map((l) => ({ ...l, receipt_id: receipt.id }))
      )
    }
    return await this.retrieveReceipt(receipt.id, { relations: ["lines"] })
  }

  // Провести приход: draft → posted + породить партию (Batch) на каждую строку.
  // Строки без variant_id блокируют проводку (сначала сопоставить с SKU).
  // Возвращает созданные партии. Увеличение остатка ядра и компенсация — workflow
  // post-receipt (подзадача 1b); повторная проводка отсекается стейт-машиной.
  async postReceipt(receiptId: string) {
    const receipt = await this.retrieveReceipt(receiptId, {
      relations: ["lines"],
    })
    assertReceiptTransition(receipt.status as ReceiptStatus, "posted")

    const lines = receipt.lines ?? []
    if (lines.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cannot post a receipt without lines"
      )
    }
    const unmapped = lines.filter((l) => !l.variant_id)
    if (unmapped.length > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot post receipt: ${unmapped.length} line(s) not mapped to a SKU (variant_id)`
      )
    }

    const receivedAt = receipt.received_at ?? new Date()
    const batches = await this.createBatches(
      lines.map((l) => ({
        variant_id: l.variant_id as string,
        receipt_line_id: l.id,
        quantity_received: Number(l.quantity),
        quantity_remaining: Number(l.quantity),
        unit_cost: Number(l.unit_cost),
        received_at: receivedAt,
        expires_at: l.expires_at ?? null,
      }))
    )
    await this.updateReceipts({
      id: receiptId,
      status: "posted",
      received_at: receivedAt,
    })
    return batches
  }

  // Удалить ЧЕРНОВИК прихода вместе со строками. Проведённый приход удалить
  // нельзя: он уже увеличил остаток склада и породил партии себестоимости —
  // такой приход исправляют новым документом, а не удалением (Ф-прогон T4.6:
  // закупщику некуда девать черновики после неудачной проводки).
  async deleteDraftReceipt(receiptId: string) {
    const receipt = await this.retrieveReceipt(receiptId, {
      relations: ["lines"],
    })
    if ((receipt.status as ReceiptStatus) !== "draft") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot delete a ${receipt.status} receipt: only drafts can be deleted`
      )
    }
    const lineIds = (receipt.lines ?? []).map((l) => l.id)
    if (lineIds.length > 0) {
      await this.deleteReceiptLines(lineIds)
    }
    await this.deleteReceipts(receiptId)
    return { id: receiptId }
  }

  // Открытые партии варианта, ранние сверху (для FIFO/оценки остатка).
  async listOpenBatches(variantId: string) {
    return await this.listBatches(
      { variant_id: variantId },
      { order: { received_at: "ASC" } }
    )
  }

  // Себестоимость текущего остатка варианта = Σ(остаток × закуп-цена) по партиям.
  async getInventoryCostValue(variantId: string): Promise<number> {
    const batches = await this.listBatches({ variant_id: variantId })
    return inventoryCostValue(
      batches.map((b) => ({
        id: b.id,
        unit_cost: Number(b.unit_cost),
        quantity_remaining: Number(b.quantity_remaining),
        received_at: b.received_at as Date,
      }))
    )
  }

  // Списать количество варианта по FIFO (от самой ранней партии) и уменьшить
  // остатки партий. Возвращает списанные слои и COGS. Недостача (партий меньше
  // спроса) → ошибка. Привязка к реальной продаже (когда звать) — отдельная
  // подзадача; механизм и учёт себестоимости здесь.
  async consumeVariantStock(variantId: string, quantity: number) {
    const batches = await this.listBatches(
      { variant_id: variantId },
      { order: { received_at: "ASC" } }
    )
    const layers = batches.map((b) => ({
      id: b.id,
      unit_cost: Number(b.unit_cost),
      quantity_remaining: Number(b.quantity_remaining),
      received_at: b.received_at as Date,
    }))
    const result = consumeFifo(layers, quantity)
    if (result.shortfall > 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Insufficient stock for variant ${variantId}: short by ${result.shortfall}`
      )
    }
    if (result.draws.length > 0) {
      await this.updateBatches(
        result.draws.map((d) => {
          const layer = layers.find((l) => l.id === d.batch_id)!
          return {
            id: d.batch_id,
            quantity_remaining: layer.quantity_remaining - d.quantity,
          }
        })
      )
    }
    return result
  }
}

export default ProcurementModuleService
