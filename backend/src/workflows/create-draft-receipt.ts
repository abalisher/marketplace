import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createDraftReceiptStep,
  CreateDraftReceiptStepInput,
} from "./steps/create-draft-receipt"

export type CreateDraftReceiptWorkflowInput = CreateDraftReceiptStepInput

// Создание черновика прихода (накладной закупа) со строками. Проводка (остаток
// ядра + партии) — отдельный workflow post-receipt.
export const createDraftReceiptWorkflow = createWorkflow(
  "create-draft-receipt",
  (input: WorkflowData<CreateDraftReceiptWorkflowInput>) => {
    const receipt = createDraftReceiptStep(input)
    return new WorkflowResponse(receipt)
  }
)
