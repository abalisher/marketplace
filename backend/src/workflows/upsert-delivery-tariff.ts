import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  upsertDeliveryTariffStep,
  UpsertDeliveryTariffStepInput,
} from "./steps/upsert-delivery-tariff"

export type UpsertDeliveryTariffWorkflowInput = UpsertDeliveryTariffStepInput

// Создание/правка тарифа доставки из админки (администрируемая сетка зон).
// Один шаг с компенсацией (upsert по zone) — идиома upsert-material-norm.
export const upsertDeliveryTariffWorkflow = createWorkflow(
  "upsert-delivery-tariff",
  (input: WorkflowData<UpsertDeliveryTariffWorkflowInput>) => {
    const tariff = upsertDeliveryTariffStep(input)
    return new WorkflowResponse(tariff)
  }
)
