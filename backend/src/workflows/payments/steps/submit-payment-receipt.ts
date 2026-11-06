import { createHash } from "crypto"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { orderLabel } from "../../../lib/orders/order-number"
import { numericAmount } from "../../../lib/payments/amount"
import { outstandingAmount } from "../../../lib/payments/order-payment-state"
import { recognizeReceipt, RecognizedReceipt } from "../../../lib/payments/receipt-ai"
import {
  checkReceipt,
  receiptPaidAt,
  receiptVerdict,
} from "../../../lib/payments/receipt-checks"
import { loadPaymentSettings } from "../../../lib/payments/settings"
import { resolveStoreTenant } from "../../../lib/tenants/storefront"
import {
  factsOf,
  requireOrderPayment,
  resolveOrderPaymentService,
} from "./order-payment-row"

export type SubmitPaymentReceiptStepInput = {
  order_id: string
  file: { name: string | null; mime_type: string; data: string }
}

// Чек принимаем, пока по заказу есть что платить способом «вне банка»:
// перевод ждёт денег, долг просят или гасят.
const RECEIVABLE = ["awaiting", "debt_requested", "debt"]

// Покупатель прислал чек Kaspi: файл — в файловое хранилище, чек — в
// распознавание, распознанное — в проверки (receipt-checks.ts). Итог
// сохраняется чеком оплаты заказа: без нарушений — ждёт продавца (pending),
// с нарушением — помечен (flagged). Деньги чек не двигает: засчитывает
// продавец. Тот же чек к тому же заказу второй раз — возвращается прежний.
// Не прочиталось (сбой модели) — чек всё равно сохраняется, на ручную проверку.
export const submitPaymentReceiptStep = createStep(
  "submit-payment-receipt",
  async (input: SubmitPaymentReceiptStepInput, { container }) => {
    const service = resolveOrderPaymentService(container)
    const row = await requireOrderPayment(service, input.order_id)
    const facts = factsOf(row)
    const outstanding = outstandingAmount(facts)
    if (
      (row.method !== "kaspi_transfer" && row.method !== "debt" && row.method !== "kaspi_qr") ||
      !RECEIVABLE.includes(row.status) ||
      outstanding <= 0
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "По этому заказу чек не нужен: он уже оплачен или отменён"
      )
    }

    const fileHash = createHash("sha256").update(input.file.data).digest("hex")
    const sameFile = await service.listPaymentReceipts(
      { file_hash: fileHash },
      { relations: ["order_payment"], take: 20 }
    )
    const ownCopy = sameFile.find(
      (receipt) =>
        (receipt as unknown as { order_payment: { id: string } }).order_payment.id === row.id &&
        receipt.status !== "rejected"
    )
    if (ownCopy) {
      return new StepResponse({ receipt_id: ownCopy.id, created: false }, null)
    }

    let recognized: RecognizedReceipt | null = null
    try {
      recognized = await recognizeReceipt({
        mimeType: input.file.mime_type,
        data: input.file.data,
      })
    } catch (e) {
      container
        .resolve(ContainerRegistrationKeys.LOGGER)
        .warn(`[payments] receipt recognition failed for order ${input.order_id}: ${(e as Error).message}`)
    }

    const displayOf = (receipt: unknown) => {
      const op = (
        receipt as {
          order_payment?: { order_display_id?: number | null; order_number?: string | null }
        }
      ).order_payment
      return orderLabel(op?.order_number, op?.order_display_id) || null
    }
    const otherFile = sameFile.find(
      (receipt) => (receipt as unknown as { order_payment: { id: string } }).order_payment.id !== row.id
    )
    let numberReusedBy: string | null | undefined
    if (recognized?.receipt_number) {
      const sameNumber = await service.listPaymentReceipts(
        { receipt_number: recognized.receipt_number },
        { relations: ["order_payment"], take: 20 }
      )
      const ownNumber = sameNumber.find(
        (receipt) =>
          (receipt as unknown as { order_payment: { id: string } }).order_payment.id === row.id &&
          receipt.status !== "rejected"
      )
      if (ownNumber) {
        return new StepResponse({ receipt_id: ownNumber.id, created: false }, null)
      }
      const other = sameNumber.find(
        (receipt) => (receipt as unknown as { order_payment: { id: string } }).order_payment.id !== row.id
      )
      numberReusedBy = other ? displayOf(other) : undefined
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "created_at"],
      filters: { id: input.order_id },
    })
    const createdAt = new Date((data[0] as { created_at: string | Date }).created_at)
    const settings = await loadPaymentSettings(container, row.sales_channel_id)
    // БИН компании заказа: чек оплаты по Kaspi QR сверяется по нему.
    const tenant = await resolveStoreTenant(container, row.sales_channel_id ?? undefined)
    const checks = checkReceipt(recognized, {
      outstanding,
      order_display_id: (row as unknown as { order_display_id: number | null }).order_display_id,
      order_number: (row as unknown as { order_number?: string | null }).order_number ?? null,
      order_created_at: createdAt,
      seller_phone: settings.transfer_phone,
      seller_recipient: settings.transfer_recipient,
      seller_bin: tenant?.bin ?? null,
      number_reused_by: numberReusedBy,
      file_reused_by: otherFile ? displayOf(otherFile) : undefined,
      now: new Date(),
    })
    const verdict = receiptVerdict(checks)

    const fileService = container.resolve(Modules.FILE)
    const extension = input.file.mime_type === "application/pdf" ? "pdf" : input.file.mime_type.split("/")[1] ?? "bin"
    const [file] = await fileService.createFiles([
      {
        filename: `receipt-${input.order_id}-${fileHash.slice(0, 12)}.${extension}`,
        mimeType: input.file.mime_type,
        content: input.file.data,
        access: "public",
      },
    ])

    const created = await service.createPaymentReceipts({
      order_payment_id: row.id,
      sales_channel_id: row.sales_channel_id,
      file_id: file.id,
      file_url: file.url,
      file_name: input.file.name,
      mime_type: input.file.mime_type,
      file_hash: fileHash,
      amount: recognized?.amount ?? null,
      paid_at: receiptPaidAt(recognized?.paid_at ?? null)?.at ?? null,
      receipt_number: recognized?.receipt_number ?? null,
      recipient_name: recognized?.recipient_name ?? null,
      recipient_phone: recognized?.recipient_phone ?? null,
      sender_name: recognized?.sender_name ?? null,
      comment: recognized?.comment ?? null,
      parsed: (recognized ?? null) as unknown as Record<string, unknown> | null,
      checks: checks as unknown as Record<string, unknown>,
      verdict,
      status: verdict === "fail" ? "flagged" : "pending",
    })
    await service.updateOrderPayments({ id: row.id, receipt_pending: true })

    return new StepResponse(
      { receipt_id: created.id, created: true },
      {
        receipt_id: created.id,
        file_id: file.id,
        order_payment_id: row.id,
        receipt_pending: !!(row as unknown as { receipt_pending?: boolean }).receipt_pending,
      }
    )
  },
  async (undo, { container }) => {
    if (!undo) {
      return
    }
    const service = resolveOrderPaymentService(container)
    await service.deletePaymentReceipts(undo.receipt_id)
    await service.updateOrderPayments({
      id: undo.order_payment_id,
      receipt_pending: undo.receipt_pending,
    })
    await container.resolve(Modules.FILE).deleteFiles(undo.file_id)
  }
)

// Сумма к засчитыванию по чеку: прочитанная, но не больше долга.
export const receiptAmountToRecord = (
  receiptAmount: unknown,
  outstanding: number
): number => {
  const amount = numericAmount(receiptAmount)
  return amount && amount > 0 ? Math.min(amount, outstanding) : outstanding
}
