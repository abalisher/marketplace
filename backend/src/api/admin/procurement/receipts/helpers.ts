import { PROCUREMENT_MODULE } from "../../../../modules/procurement"
import ProcurementModuleService from "../../../../modules/procurement/service"
import { MedusaContainer } from "@medusajs/framework/types"

// Загрузить приход со строками и (для проведённого) партиями его строк. Партии
// привязаны опазной колонкой receipt_line_id (не belongsTo — см. batch.ts), потому
// подбираем их по id строк. Общий для GET-детали и ответа проводки.
export const loadReceiptWithBatches = async (
  scope: MedusaContainer,
  receiptId: string
) => {
  const service = scope.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
  const receipt = await service.retrieveReceipt(receiptId, {
    relations: ["lines"],
  })
  const lineIds = (receipt.lines ?? []).map((l) => l.id)
  const batches =
    lineIds.length > 0
      ? await service.listBatches({ receipt_line_id: lineIds })
      : []
  return { receipt, batches }
}
