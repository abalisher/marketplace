import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateScoringConfigStep,
  UpdateScoringConfigStepInput,
} from "./steps/update-scoring-config"

export type UpdateScoringConfigWorkflowInput = UpdateScoringConfigStepInput

// Правка настраиваемых правил скоринга из админки. Один шаг с компенсацией —
// workflow ради единообразия «роут → workflow» (идиома update-bonus-config).
export const updateScoringConfigWorkflow = createWorkflow(
  "update-scoring-config",
  (input: WorkflowData<UpdateScoringConfigWorkflowInput>) => {
    const config = updateScoringConfigStep(input)
    return new WorkflowResponse(config)
  }
)
