import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  addTripStopStep,
  AddTripStopStepInput,
} from "./steps/add-trip-stop"

export type AddTripStopWorkflowInput = AddTripStopStepInput

// Добавление точки рейса (выдача/возврат). Один шаг с компенсацией — workflow
// ради единообразия «роут → workflow».
export const addTripStopWorkflow = createWorkflow(
  "add-trip-stop",
  (input: WorkflowData<AddTripStopWorkflowInput>) => {
    const stop = addTripStopStep(input)
    return new WorkflowResponse(stop)
  }
)
