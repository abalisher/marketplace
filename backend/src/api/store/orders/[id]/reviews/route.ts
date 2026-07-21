import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEWS_MODULE } from "../../../../../modules/reviews"
import ReviewsModuleService from "../../../../../modules/reviews/service"
import { createReviewWorkflow } from "../../../../../workflows/create-review"
import { requireOwnOrder } from "../../helpers"
import { serializeReview } from "../../../../utils/serialize-review"
import { StoreCreateReviewType } from "../../validators"

// GET /store/orders/:id/reviews — свои отзывы покупателя по заказу (оба объекта,
// если оставлены). Чужой заказ → 404 (requireOwnOrder).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await requireOwnOrder(req.scope, req.params.id, req.auth_context.actor_id)

  const reviewsService =
    req.scope.resolve<ReviewsModuleService>(REVIEWS_MODULE)
  const reviews = await reviewsService.listReviews(
    { order_id: req.params.id, customer_id: req.auth_context.actor_id },
    { order: { created_at: "ASC" } }
  )
  res.json({ reviews: reviews.map(serializeReview) })
}

// POST /store/orders/:id/reviews — оставить отзыв (гейт права + границы/
// уникальность — в createReviewWorkflow).
export async function POST(
  req: AuthenticatedMedusaRequest<StoreCreateReviewType>,
  res: MedusaResponse
) {
  const { result } = await createReviewWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      customer_id: req.auth_context.actor_id,
      target: req.validatedBody.target,
      rating: req.validatedBody.rating,
      comment: req.validatedBody.comment ?? null,
    },
    throwOnError: true,
  })
  res.status(201).json({ review: serializeReview(result) })
}
