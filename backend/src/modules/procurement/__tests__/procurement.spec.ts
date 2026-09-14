import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { PROCUREMENT_MODULE } from ".."
import ProcurementModuleService from "../service"
import Supplier from "../models/supplier"
import Receipt from "../models/receipt"
import ReceiptLine from "../models/receipt-line"
import Batch from "../models/batch"
import {
  assertReceiptTransition,
  consumeFifo,
  inventoryCostValue,
  lineCost,
} from "../models/constants"

jest.setTimeout(120000)

// Интеграционный тест модуля procurement (подзадача 1a): чистые функции (FIFO-
// списание, стоимость остатка, переход прихода), сервис (поставщик, черновик
// прихода с пересчётом, проводка → партии, FIFO-списание по датам). Раннер
// поднимает модуль на временной БД (.env.test). Состояние НЕ переживает границу
// `it` — каждый тест самодостаточен.
moduleIntegrationTestRunner<ProcurementModuleService>({
  moduleName: PROCUREMENT_MODULE,
  moduleModels: [Supplier, Receipt, ReceiptLine, Batch],
  resolve: "./src/modules/procurement",
  testSuite: ({ service }) => {
    describe("procurement — чистые функции", () => {
      it("lineCost = кол-во × цена, округление к целому минору", () => {
        expect(lineCost(10, 500)).toEqual(5000)
        expect(lineCost(2.5, 333)).toEqual(833) // 832.5 → 833
        expect(lineCost(-1, 500)).toEqual(0)
      })

      it("consumeFifo списывает от самой ранней партии, считает COGS и недостачу", () => {
        const layers = [
          { id: "b_new", unit_cost: 600, quantity_remaining: 100, received_at: "2026-02-01" },
          { id: "b_old", unit_cost: 500, quantity_remaining: 30, received_at: "2026-01-01" },
        ]
        // Спрос 50: 30 из старой (×500) + 20 из новой (×600) = 15000 + 12000.
        const r = consumeFifo(layers, 50)
        expect(r.draws.map((d) => d.batch_id)).toEqual(["b_old", "b_new"])
        expect(r.draws[0].quantity).toEqual(30)
        expect(r.draws[1].quantity).toEqual(20)
        expect(r.cogs).toEqual(30 * 500 + 20 * 600)
        expect(r.shortfall).toEqual(0)
      })

      it("consumeFifo сообщает недостачу, когда партий меньше спроса", () => {
        const layers = [
          { id: "b1", unit_cost: 500, quantity_remaining: 10, received_at: "2026-01-01" },
        ]
        const r = consumeFifo(layers, 25)
        expect(r.draws).toHaveLength(1)
        expect(r.shortfall).toEqual(15)
      })

      it("inventoryCostValue = Σ(остаток × цена) по партиям", () => {
        expect(
          inventoryCostValue([
            { id: "b1", unit_cost: 500, quantity_remaining: 10, received_at: "2026-01-01" },
            { id: "b2", unit_cost: 600, quantity_remaining: 5, received_at: "2026-02-01" },
          ])
        ).toEqual(10 * 500 + 5 * 600)
      })

      it("assertReceiptTransition: draft→posted можно, posted→* нельзя", () => {
        expect(() => assertReceiptTransition("draft", "posted")).not.toThrow()
        expect(() => assertReceiptTransition("posted", "posted")).toThrow(
          /not allowed/
        )
      })
    })

    describe("ProcurementModuleService — поставщики и приходы", () => {
      it("создаёт поставщика (активного)", async () => {
        const sup = await service.createSupplier({ name: "ТОО СтройБаза", bin: "123456789012" })
        expect(sup.id).toMatch(/^sup_/)
        expect(sup.active).toBe(true)
      })

      it("создаёт черновик прихода с пересчётом line_cost/total_cost", async () => {
        const receipt = await service.createDraftReceipt({
          location_id: "sloc_1",
          reference: "НАКЛ-42",
          lines: [
            { variant_id: "variant_cement", quantity: 100, unit: "мешок", unit_cost: 50000 },
            { variant_id: "variant_sand", quantity: 3.5, unit: "м3", unit_cost: 80000 },
          ],
        })
        expect(receipt.id).toMatch(/^rcpt_/)
        expect(receipt.status).toEqual("draft")
        expect(Number(receipt.total_cost)).toEqual(100 * 50000 + Math.round(3.5 * 80000))
      })

      it("проводит приход: draft→posted и порождает партии", async () => {
        const receipt = await service.createDraftReceipt({
          location_id: "sloc_1",
          received_at: new Date("2026-01-10"),
          lines: [
            { variant_id: "variant_cement", quantity: 100, unit: "мешок", unit_cost: 50000 },
          ],
        })
        const batches = await service.postReceipt(receipt.id)
        expect(batches).toHaveLength(1)
        expect(batches[0].id).toMatch(/^batch_/)
        expect(Number(batches[0].quantity_remaining)).toEqual(100)

        const posted = await service.retrieveReceipt(receipt.id)
        expect(posted.status).toEqual("posted")

        // Повторная проводка отсекается стейт-машиной.
        await expect(service.postReceipt(receipt.id)).rejects.toThrow(/not allowed/)
      })

      it("не проводит приход со строкой без variant_id (не сопоставлена с SKU)", async () => {
        const receipt = await service.createDraftReceipt({
          location_id: "sloc_1",
          source: "invoice_ai",
          lines: [
            { recognized_title: "Цемент М400", quantity: 20, unit: "мешок", unit_cost: 50000 },
          ],
        })
        await expect(service.postReceipt(receipt.id)).rejects.toThrow(/not mapped/)
      })

      it("не проводит приход без строк", async () => {
        const receipt = await service.createDraftReceipt({
          location_id: "sloc_1",
          lines: [],
        })
        await expect(service.postReceipt(receipt.id)).rejects.toThrow(/without lines/)
      })

      it("удаляет черновик прихода вместе со строками", async () => {
        const receipt = await service.createDraftReceipt({
          location_id: "sloc_1",
          lines: [
            { variant_id: "variant_cement", quantity: 10, unit: "мешок", unit_cost: 50000 },
          ],
        })
        const lineIds = (receipt.lines ?? []).map((l) => l.id)
        expect(lineIds).toHaveLength(1)

        await service.deleteDraftReceipt(receipt.id)

        await expect(service.retrieveReceipt(receipt.id)).rejects.toThrow()
        expect(await service.listReceiptLines({ id: lineIds })).toHaveLength(0)
      })

      it("не удаляет проведённый приход (он уже изменил остаток и себестоимость)", async () => {
        const receipt = await service.createDraftReceipt({
          location_id: "sloc_1",
          lines: [
            { variant_id: "variant_cement", quantity: 5, unit: "мешок", unit_cost: 50000 },
          ],
        })
        await service.postReceipt(receipt.id)

        await expect(service.deleteDraftReceipt(receipt.id)).rejects.toThrow(
          /only drafts can be deleted/
        )
        expect((await service.retrieveReceipt(receipt.id)).status).toEqual("posted")
      })
    })

    describe("ProcurementModuleService — FIFO-себестоимость", () => {
      it("списывает остаток варианта по FIFO между двумя партиями и уменьшает остатки", async () => {
        const variantId = "variant_fifo"
        // Партия 1 (ранняя, дешевле): 30 по 500.
        const r1 = await service.createDraftReceipt({
          location_id: "sloc_1",
          received_at: new Date("2026-01-01"),
          lines: [{ variant_id: variantId, quantity: 30, unit: "шт", unit_cost: 500 }],
        })
        await service.postReceipt(r1.id)
        // Партия 2 (поздняя, дороже): 100 по 600.
        const r2 = await service.createDraftReceipt({
          location_id: "sloc_1",
          received_at: new Date("2026-02-01"),
          lines: [{ variant_id: variantId, quantity: 100, unit: "шт", unit_cost: 600 }],
        })
        await service.postReceipt(r2.id)

        expect(await service.getInventoryCostValue(variantId)).toEqual(30 * 500 + 100 * 600)

        // Списываем 50: 30×500 (старая) + 20×600 (новая).
        const consumed = await service.consumeVariantStock(variantId, 50)
        expect(consumed.cogs).toEqual(30 * 500 + 20 * 600)
        expect(consumed.shortfall).toEqual(0)

        // Остаток: старая партия исчерпана, у новой осталось 80.
        const open = await service.listOpenBatches(variantId)
        const remaining = open.reduce((s, b) => s + Number(b.quantity_remaining), 0)
        expect(remaining).toEqual(80)
        expect(await service.getInventoryCostValue(variantId)).toEqual(80 * 600)
      })

      it("бросает ошибку при нехватке остатка для списания", async () => {
        const variantId = "variant_short"
        const r = await service.createDraftReceipt({
          location_id: "sloc_1",
          received_at: new Date("2026-01-01"),
          lines: [{ variant_id: variantId, quantity: 10, unit: "шт", unit_cost: 500 }],
        })
        await service.postReceipt(r.id)
        await expect(service.consumeVariantStock(variantId, 25)).rejects.toThrow(
          /Insufficient stock/
        )
      })
    })
  },
})
