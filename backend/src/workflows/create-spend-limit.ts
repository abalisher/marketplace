import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createSpendLimitStep,
  CreateSpendLimitStepInput,
} from "./steps/create-spend-limit"

// Назначение лимита сотруднику (админом его компании — проверка прав на уровне API).
// У сотрудника может быть несколько лимитов с разными периодами.
export const createSpendLimitWorkflow = createWorkflow(
  "create-spend-limit",
  (input: WorkflowData<CreateSpendLimitStepInput>) => {
    const spendLimit = createSpendLimitStep(input)

    return new WorkflowResponse(spendLimit)
  }
)
