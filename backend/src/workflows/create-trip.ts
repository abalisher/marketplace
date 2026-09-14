import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createTripStep,
  CreateTripStepInput,
} from "./steps/create-trip"

export type CreateTripWorkflowInput = CreateTripStepInput

// Создание рейса водителя (исполнительный слой доставки). Один шаг с
// компенсацией — workflow ради единообразия «роут → workflow».
export const createTripWorkflow = createWorkflow(
  "create-trip",
  (input: WorkflowData<CreateTripWorkflowInput>) => {
    const trip = createTripStep(input)
    return new WorkflowResponse(trip)
  }
)
