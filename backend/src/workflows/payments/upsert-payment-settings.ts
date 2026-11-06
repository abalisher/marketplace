import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  upsertPaymentSettingsStep,
  UpsertPaymentSettingsStepInput,
} from "./steps/upsert-payment-settings"

// Сохранить способы оплаты продавца (Kaspi QR и его ключи, перевод по номеру
// Kaspi, в долг). Ключи шифруются в шаге и наружу не возвращаются.
export const upsertPaymentSettingsWorkflow = createWorkflow(
  "upsert-payment-settings",
  (input: WorkflowData<UpsertPaymentSettingsStepInput>) => {
    const settings = upsertPaymentSettingsStep(input)
    return new WorkflowResponse(settings)
  }
)
