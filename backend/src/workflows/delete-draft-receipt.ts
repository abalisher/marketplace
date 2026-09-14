import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  deleteDraftReceiptStep,
  DeleteDraftReceiptStepInput,
} from "./steps/delete-draft-receipt"

export type DeleteDraftReceiptWorkflowInput = DeleteDraftReceiptStepInput

// Удаление черновика прихода (T4.7): закупщику некуда было девать черновики
// после неудачной проводки — они висели дублями. Проведённый приход не
// удаляется (инвариант сервиса).
export const deleteDraftReceiptWorkflow = createWorkflow(
  "delete-draft-receipt",
  (input: WorkflowData<DeleteDraftReceiptWorkflowInput>) => {
    const deleted = deleteDraftReceiptStep(input)
    return new WorkflowResponse(deleted)
  }
)
