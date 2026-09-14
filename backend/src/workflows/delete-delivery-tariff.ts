import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  deleteDeliveryTariffStep,
  DeleteDeliveryTariffStepInput,
} from "./steps/delete-delivery-tariff"

export type DeleteDeliveryTariffWorkflowInput = DeleteDeliveryTariffStepInput

// Удаление тарифа доставки (workflow с компенсацией-восстановлением).
export const deleteDeliveryTariffWorkflow = createWorkflow(
  "delete-delivery-tariff",
  (input: WorkflowData<DeleteDeliveryTariffWorkflowInput>) => {
    const result = deleteDeliveryTariffStep(input)
    return new WorkflowResponse(result)
  }
)
