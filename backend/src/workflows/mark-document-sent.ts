import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { markDocumentSentStep } from "./steps/mark-document-sent"

export type MarkDocumentSentWorkflowInput = {
  document_id: string
}

// Пометить документ отправленным покупателю (T4.9). Канал отправки не выбран
// (развилка №0 владельцу: push/email/SMS), поэтому отметку ставит продавец
// руками с экрана заказа или из реестра документов — управляющему нужно
// видеть, ушёл ли счёт клиенту.
export const markDocumentSentWorkflow = createWorkflow(
  "mark-document-sent",
  (input: WorkflowData<MarkDocumentSentWorkflowInput>) => {
    const document = markDocumentSentStep({ document_id: input.document_id })
    return new WorkflowResponse(document)
  }
)
