import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  upsertMaterialNormStep,
  UpsertMaterialNormStepInput,
} from "./steps/upsert-material-norm"

export type UpsertMaterialNormWorkflowInput = UpsertMaterialNormStepInput

// Создание/правка норматива расхода из админки (справочник ТЗ 7). Один шаг с
// компенсацией — workflow ради единообразия «роут → workflow».
export const upsertMaterialNormWorkflow = createWorkflow(
  "upsert-material-norm",
  (input: WorkflowData<UpsertMaterialNormWorkflowInput>) => {
    const norm = upsertMaterialNormStep(input)
    return new WorkflowResponse(norm)
  }
)
