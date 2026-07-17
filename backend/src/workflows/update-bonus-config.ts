import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateBonusConfigStep,
  UpdateBonusConfigStepInput,
} from "./steps/update-bonus-config"

export type UpdateBonusConfigWorkflowInput = UpdateBonusConfigStepInput

// Правка настроек бонусной программы из админки (проценты начисления,
// потолок списания, сгорание, окно возврата). Один шаг с компенсацией —
// workflow ради единообразия «роут → workflow» (бизнес-логики в роутах нет).
export const updateBonusConfigWorkflow = createWorkflow(
  "update-bonus-config",
  (input: WorkflowData<UpdateBonusConfigWorkflowInput>) => {
    const config = updateBonusConfigStep(input)
    return new WorkflowResponse(config)
  }
)
