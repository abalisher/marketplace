import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  rejectCompanyStep,
  RejectCompanyStepInput,
} from "./steps/reject-company"

// Модерация: отклонение компании админом маркетплейса с обязательным комментарием.
export const rejectCompanyWorkflow = createWorkflow(
  "reject-company",
  (input: WorkflowData<RejectCompanyStepInput>) => {
    const company = rejectCompanyStep(input)

    return new WorkflowResponse(company)
  }
)
