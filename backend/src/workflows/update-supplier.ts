import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateSupplierStep,
  UpdateSupplierStepInput,
} from "./steps/update-supplier"

export type UpdateSupplierWorkflowInput = UpdateSupplierStepInput

// Правка/деактивация поставщика закупа.
export const updateSupplierWorkflow = createWorkflow(
  "update-supplier",
  (input: WorkflowData<UpdateSupplierWorkflowInput>) => {
    const supplier = updateSupplierStep(input)
    return new WorkflowResponse(supplier)
  }
)
