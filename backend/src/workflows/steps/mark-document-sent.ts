import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { DOCUMENTS_MODULE } from "../../modules/documents"
import DocumentsModuleService from "../../modules/documents/service"

export type MarkDocumentSentStepInput = {
  document_id: string
}

// Отметка «документ отправлен покупателю». Компенсация возвращает прежний
// момент отправки (в т.ч. null — документ не был отправлен).
export const markDocumentSentStep = createStep(
  "mark-document-sent",
  async (input: MarkDocumentSentStepInput, { container }) => {
    const documentsService =
      container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
    const before = await documentsService.retrieveDocument(input.document_id)
    const updated = await documentsService.markDocumentSent(input.document_id)

    return new StepResponse(updated, {
      document_id: input.document_id,
      sent_to_buyer_at: before.sent_to_buyer_at ?? null,
    })
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    const documentsService =
      container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
    await documentsService.updateDocuments({
      id: compensation.document_id,
      sent_to_buyer_at: compensation.sent_to_buyer_at,
    })
  }
)
