import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEWS_MODULE } from "../../../../../modules/reviews"
import ReviewsModuleService from "../../../../../modules/reviews/service"
import { openDisputeWorkflow } from "../../../../../workflows/open-dispute"
import { requireOwnOrder } from "../../helpers"
import { serializeDispute } from "../../../../utils/serialize-review"
import { StoreOpenDisputeType } from "../../validators"

// GET /store/orders/:id/disputes — свои диспуты покупателя по заказу. Чужой
// заказ → 404 (requireOwnOrder).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await requireOwnOrder(req.scope, req.params.id, req.auth_context.actor_id)

  const reviewsService =
    req.scope.resolve<ReviewsModuleService>(REVIEWS_MODULE)
  const disputes = await reviewsService.listDisputes(
    { order_id: req.params.id, customer_id: req.auth_context.actor_id },
    { order: { created_at: "DESC" } }
  )
  res.json({ disputes: disputes.map(serializeDispute) })
}

// POST /store/orders/:id/disputes — открыть диспут «проблема с заказом» (гейт
// принадлежности + блок второго активного — в openDisputeWorkflow).
export async function POST(
  req: AuthenticatedMedusaRequest<StoreOpenDisputeType>,
  res: MedusaResponse
) {
  const { result } = await openDisputeWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      customer_id: req.auth_context.actor_id,
      category: req.validatedBody.category,
      description: req.validatedBody.description,
    },
    throwOnError: true,
  })
  res.status(201).json({ dispute: serializeDispute(result) })
}
