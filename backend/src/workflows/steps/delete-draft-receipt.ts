import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PROCUREMENT_MODULE } from "../../modules/procurement"
import ProcurementModuleService from "../../modules/procurement/service"

export type DeleteDraftReceiptStepInput = {
  receipt_id: string
}

// Удалить черновик прихода со строками. Инвариант «только черновик» проверяет
// сервис модуля: проведённый приход уже изменил остаток и себестоимость.
//
// Компенсации нет намеренно: восстанавливать удалённый черновик со строками
// нечем (новые id ломают ссылки), а шаг — последний и единственный в своём
// workflow, поэтому откатывать после него нечего.
export const deleteDraftReceiptStep = createStep(
  "delete-draft-receipt",
  async (input: DeleteDraftReceiptStepInput, { container }) => {
    const service =
      container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    const deleted = await service.deleteDraftReceipt(input.receipt_id)
    return new StepResponse(deleted)
  }
)
