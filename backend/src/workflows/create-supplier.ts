import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createSupplierStep,
  CreateSupplierStepInput,
} from "./steps/create-supplier"

export type CreateSupplierWorkflowInput = CreateSupplierStepInput

// Создание поставщика закупа. Один шаг с компенсацией — workflow ради
// единообразия «роут → workflow».
export const createSupplierWorkflow = createWorkflow(
  "create-supplier",
  (input: WorkflowData<CreateSupplierWorkflowInput>) => {
    const supplier = createSupplierStep(input)
    return new WorkflowResponse(supplier)
  }
)
