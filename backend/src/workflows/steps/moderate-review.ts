import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { REVIEWS_MODULE } from "../../modules/reviews"
import ReviewsModuleService from "../../modules/reviews/service"
import { ReviewStatus } from "../../modules/reviews/models/constants"

export type ModerateReviewStepInput = {
  id: string
  status: ReviewStatus
}

// Модерация видимости отзыва (скрыть/опубликовать) через сервис. Компенсация —
// возврат прежнего статуса.
export const moderateReviewStep = createStep(
  "moderate-review",
  async (input: ModerateReviewStepInput, { container }) => {
    const reviewsService =
      container.resolve<ReviewsModuleService>(REVIEWS_MODULE)
    const previous = await reviewsService.retrieveReview(input.id)
    const updated = await reviewsService.setReviewStatus(input)
    return new StepResponse(updated, {
      id: input.id,
      status: previous.status as ReviewStatus,
    })
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const reviewsService =
      container.resolve<ReviewsModuleService>(REVIEWS_MODULE)
    await reviewsService.setReviewStatus(previous)
  }
)
