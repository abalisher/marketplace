import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { REVIEWS_MODULE } from "../../modules/reviews"
import ReviewsModuleService from "../../modules/reviews/service"
import { ReviewTarget } from "../../modules/reviews/models/constants"

export type CreateReviewStepInput = {
  order_id: string
  customer_id: string
  target: ReviewTarget
  rating: number
  comment?: string | null
}

// Создание отзыва через сервис (границы оценки + уникальность на
// (заказ,покупатель,target) — внутри сервиса). Компенсация удаляет созданную
// строку при откате workflow.
export const createReviewStep = createStep(
  "create-review",
  async (input: CreateReviewStepInput, { container }) => {
    const reviewsService =
      container.resolve<ReviewsModuleService>(REVIEWS_MODULE)
    const review = await reviewsService.createReview(input)
    return new StepResponse(review, review.id)
  },
  async (reviewId, { container }) => {
    if (!reviewId) {
      return
    }
    const reviewsService =
      container.resolve<ReviewsModuleService>(REVIEWS_MODULE)
    await reviewsService.deleteReviews(reviewId)
  }
)
