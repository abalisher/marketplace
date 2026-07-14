import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  approveCompanyStep,
  ApproveCompanyStepInput,
} from "./steps/approve-company"

// Модерация: одобрение компании админом маркетплейса.
export const approveCompanyWorkflow = createWorkflow(
  "approve-company",
  (input: WorkflowData<ApproveCompanyStepInput>) => {
    const company = approveCompanyStep(input)

    return new WorkflowResponse(company)
  }
)
