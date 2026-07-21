import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { DOCUMENTS_MODULE } from "../../modules/documents"
import DocumentsModuleService from "../../modules/documents/service"
import { DocumentType } from "../../modules/documents/models/constants"

export type IssueOrderDocumentStepInput = {
  order_id: string
  type: DocumentType
  snapshot: Record<string, unknown>
  total_money: number
  total_bonus: number
  currency_code: string
  visible_to_buyer?: boolean
  visible_to_seller?: boolean
  note?: string | null
}

// Выпуск строки документа через сервис (нумерация + версионность). Файл (PDF)
// прикрепляется следующим шагом после рендера. Компенсация удаляет созданную
// строку при падении дальнейших шагов workflow. Замечание: при переиздании
// (version>1) компенсация не восстанавливает is_latest у предыдущей версии —
// повторный выпуск случается только из подписчиков с защитой от дублей (см.
// subscribers/order-invoice, order-waybill), поэтому для MVP приемлемо.
export const issueOrderDocumentStep = createStep(
  "issue-order-document",
  async (input: IssueOrderDocumentStepInput, { container }) => {
    const documentsService =
      container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)

    const document = await documentsService.issueDocument({
      order_id: input.order_id,
      type: input.type,
      snapshot: input.snapshot,
      total_money: input.total_money,
      total_bonus: input.total_bonus,
      currency_code: input.currency_code,
      visible_to_buyer: input.visible_to_buyer,
      visible_to_seller: input.visible_to_seller,
      note: input.note,
    })

    return new StepResponse(
      {
        document_id: document.id,
        type: document.type as DocumentType,
        number: document.number,
        version: document.version,
      },
      { document_id: document.id }
    )
  },
  async (created, { container }) => {
    if (!created) {
      return
    }
    const documentsService =
      container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
    await documentsService.deleteDocuments(created.document_id)
  }
)
