import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  moderateReviewStep,
  ModerateReviewStepInput,
} from "./steps/moderate-review"

export type ModerateReviewWorkflowInput = ModerateReviewStepInput

// Модерация видимости отзыва админом/продавцом (скрыть/опубликовать). Один шаг
// с компенсацией — workflow ради единообразия «роут → workflow».
export const moderateReviewWorkflow = createWorkflow(
  "moderate-review",
  (input: WorkflowData<ModerateReviewWorkflowInput>) => {
    const review = moderateReviewStep(input)
    return new WorkflowResponse(review)
  }
)
