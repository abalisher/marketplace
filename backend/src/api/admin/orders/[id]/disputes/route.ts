import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEWS_MODULE } from "../../../../../modules/reviews"
import ReviewsModuleService from "../../../../../modules/reviews/service"
import { serializeDisputeForAdmin } from "../../../../utils/serialize-review"

// GET /admin/orders/:id/disputes — диспуты заказа для админа/продавца
// (на странице заказа, подзадача 3).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const reviewsService =
    req.scope.resolve<ReviewsModuleService>(REVIEWS_MODULE)
  const disputes = await reviewsService.listDisputes(
    { order_id: req.params.id },
    { order: { created_at: "DESC" } }
  )
  res.json({ disputes: disputes.map(serializeDisputeForAdmin) })
}
