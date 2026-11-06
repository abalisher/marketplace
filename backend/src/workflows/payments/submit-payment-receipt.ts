import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  submitPaymentReceiptStep,
  SubmitPaymentReceiptStepInput,
} from "./steps/submit-payment-receipt"

// Покупатель прислал чек Kaspi по переводу или погашению долга (см. шаг).
export const submitPaymentReceiptWorkflow = createWorkflow(
  "submit-payment-receipt",
  (input: WorkflowData<SubmitPaymentReceiptStepInput>) =>
    new WorkflowResponse(submitPaymentReceiptStep(input))
)
