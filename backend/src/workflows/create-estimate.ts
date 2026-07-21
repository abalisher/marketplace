import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createEstimateStep,
  CreateEstimateStepInput,
} from "./steps/create-estimate"

export type CreateEstimateWorkflowInput = CreateEstimateStepInput

// Расчёт материалов покупателем (MVP — ручные параметры). Один шаг с
// компенсацией — workflow ради единообразия «роут → workflow».
export const createEstimateWorkflow = createWorkflow(
  "create-estimate",
  (input: WorkflowData<CreateEstimateWorkflowInput>) => {
    const estimate = createEstimateStep(input)
    return new WorkflowResponse(estimate)
  }
)
