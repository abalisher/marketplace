import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  deleteSpendLimitStep,
  DeleteSpendLimitStepInput,
} from "./steps/delete-spend-limit"

// Снятие лимита с сотрудника.
export const deleteSpendLimitWorkflow = createWorkflow(
  "delete-spend-limit",
  (input: WorkflowData<DeleteSpendLimitStepInput>) => {
    deleteSpendLimitStep(input)

    return new WorkflowResponse(input.id)
  }
)
