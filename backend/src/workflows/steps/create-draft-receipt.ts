import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PROCUREMENT_MODULE } from "../../modules/procurement"
import ProcurementModuleService from "../../modules/procurement/service"
import { ReceiptSource } from "../../modules/procurement/models/constants"

export type CreateDraftReceiptLineInput = {
  variant_id?: string | null
  recognized_title?: string | null
  material_kind?: string | null
  quantity: number
  unit: string
  unit_cost: number
  expires_at?: Date | null
}

export type CreateDraftReceiptStepInput = {
  location_id: string
  supplier_id?: string | null
  reference?: string | null
  source?: ReceiptSource
  note?: string | null
  received_at?: Date | null
  lines: CreateDraftReceiptLineInput[]
}

// Создать черновик прихода со строками. Пересчёт line_cost/total_cost — в
// сервисе. Компенсация: удалить строки и сам приход (родитель+строки создаются
// раздельно, откат — тем же порядком в обратную сторону).
export const createDraftReceiptStep = createStep(
  "create-draft-receipt",
  async (input: CreateDraftReceiptStepInput, { container }) => {
    const service =
      container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    const receipt = await service.createDraftReceipt(input)
    return new StepResponse(receipt, {
      receipt_id: receipt.id,
      line_ids: (receipt.lines ?? []).map((l) => l.id),
    })
  },
  async (ctx, { container }) => {
    if (!ctx) {
      return
    }
    const service =
      container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    if (ctx.line_ids.length > 0) {
      await service.deleteReceiptLines(ctx.line_ids)
    }
    await service.deleteReceipts(ctx.receipt_id)
  }
)
