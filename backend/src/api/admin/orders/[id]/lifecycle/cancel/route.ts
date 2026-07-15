import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { cancelOrderWorkflow } from "../../../../../../workflows/cancel-order"
import { AdminCancelOrderType } from "../../../validators"

// POST /admin/orders/:id/lifecycle/cancel — отмена админом: ядровый cancelOrder
// (order.status → canceled), наш статус → canceled. Под /lifecycle/, чтобы не
// перекрывать ядровый POST /admin/orders/:id/cancel. Причина логируется.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminCancelOrderType>,
  res: MedusaResponse
) {
  const { result } = await cancelOrderWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      actor_type: "admin",
      actor_id: req.auth_context.actor_id,
      reason: req.validatedBody.reason ?? null,
    },
    throwOnError: true,
  })

  res.json({ order_id: req.params.id, status: result.to })
}
