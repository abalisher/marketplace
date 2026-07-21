import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEWS_MODULE } from "../../../../../modules/reviews"
import ReviewsModuleService from "../../../../../modules/reviews/service"
import { serializeReviewForAdmin } from "../../../../utils/serialize-review"

// GET /admin/orders/:id/reviews — все отзывы заказа для админа/продавца (включая
// скрытые — для модерации). Namespace /reviews не конфликтует с ядровыми
// /admin/orders/:id/{cancel,complete} (как /lifecycle, /documents).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const reviewsService =
    req.scope.resolve<ReviewsModuleService>(REVIEWS_MODULE)
  const reviews = await reviewsService.listReviews(
    { order_id: req.params.id },
    { order: { created_at: "DESC" } }
  )
  res.json({ reviews: reviews.map(serializeReviewForAdmin) })
}
