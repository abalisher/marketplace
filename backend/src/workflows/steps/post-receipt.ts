import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PROCUREMENT_MODULE } from "../../modules/procurement"
import ProcurementModuleService from "../../modules/procurement/service"

export type PostReceiptStepInput = {
  receipt_id: string
}

export type PostReceiptStepResult = {
  receipt_id: string
  location_id: string
  batches: { id: string; variant_id: string; quantity_received: number }[]
}

// Провести приход в модуле: стейт-машина draft→posted + порождение партий
// (сервис валидирует пустой приход / несопоставленные строки / повторную
// проводку — бросает до создания партий). Увеличение остатка ЯДРА — следующий
// шаг workflow (adjustInventoryLevelsStep). Компенсация: удалить партии и
// вернуть приход в прежний статус (снимок), чтобы откат ядрового шага не оставил
// приход «проведённым».
export const postReceiptStep = createStep(
  "post-receipt",
  async (input: PostReceiptStepInput, { container }) => {
    const service =
      container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    const prior = await service.retrieveReceipt(input.receipt_id)
    const batches = await service.postReceipt(input.receipt_id)
    const result: PostReceiptStepResult = {
      receipt_id: input.receipt_id,
      location_id: prior.location_id,
      batches: batches.map((b) => ({
        id: b.id,
        variant_id: b.variant_id,
        quantity_received: Number(b.quantity_received),
      })),
    }
    return new StepResponse(result, {
      receipt_id: input.receipt_id,
      prior_status: prior.status,
      prior_received_at: prior.received_at,
      batch_ids: batches.map((b) => b.id),
    })
  },
  async (ctx, { container }) => {
    if (!ctx) {
      return
    }
    const service =
      container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    if (ctx.batch_ids.length > 0) {
      await service.deleteBatches(ctx.batch_ids)
    }
    await service.updateReceipts({
      id: ctx.receipt_id,
      status: ctx.prior_status,
      received_at: ctx.prior_received_at,
    })
  }
)
