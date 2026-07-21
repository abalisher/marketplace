import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  deleteMaterialNormStep,
  DeleteMaterialNormStepInput,
} from "./steps/delete-material-norm"

export type DeleteMaterialNormWorkflowInput = DeleteMaterialNormStepInput

// Удаление норматива из справочника (админка). Один шаг с компенсацией.
export const deleteMaterialNormWorkflow = createWorkflow(
  "delete-material-norm",
  (input: WorkflowData<DeleteMaterialNormWorkflowInput>) => {
    const result = deleteMaterialNormStep(input)
    return new WorkflowResponse(result)
  }
)
