import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  issuePhoneOtpStep,
  IssuePhoneOtpStepInput,
} from "./steps/issue-phone-otp"

export type RequestPhoneOtpWorkflowInput = IssuePhoneOtpStepInput

// Запрос кода входа на номер телефона (T10.7). Один шаг — workflow ради
// единообразия «роут → workflow» и чтобы код запроса кода не жил в роуте.
export const requestPhoneOtpWorkflow = createWorkflow(
  "request-phone-otp",
  (input: WorkflowData<RequestPhoneOtpWorkflowInput>) => {
    const result = issuePhoneOtpStep(input)
    return new WorkflowResponse(result)
  }
)
