import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { REVIEW_CREATED_EVENT } from "../modules/reviews/events"
import { ReviewTarget } from "../modules/reviews/models/constants"
import { validateReviewEligibilityStep } from "./steps/validate-review-eligibility"
import { createReviewStep } from "./steps/create-review"

export type CreateReviewWorkflowInput = {
  order_id: string
  customer_id: string
  target: ReviewTarget
  rating: number
  comment?: string | null
}

// Отзыв покупателя по заказу: гейт права (свой доставленный/закрытый заказ;
// доставку — только delivery) → создание (границы оценки + уникальность в
// сервисе) → событие review.created. Цепочка закреплена зависимостью по данным
// (create зависит от результата валидации).
export const createReviewWorkflow = createWorkflow(
  "create-review",
  (input: WorkflowData<CreateReviewWorkflowInput>) => {
    const eligibility = validateReviewEligibilityStep({
      order_id: input.order_id,
      customer_id: input.customer_id,
      target: input.target,
    })

    const review = createReviewStep(
      transform({ input, eligibility }, (d) => ({
        order_id: d.input.order_id,
        customer_id: d.input.customer_id,
        target: d.input.target,
        rating: d.input.rating,
        comment: d.input.comment,
      }))
    )

    emitEventStep({
      eventName: REVIEW_CREATED_EVENT,
      data: transform({ review }, (d) => ({
        review_id: d.review.id,
        order_id: d.review.order_id,
        target: d.review.target,
        rating: d.review.rating,
      })),
    })

    return new WorkflowResponse(review)
  }
)
