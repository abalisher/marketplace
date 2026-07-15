import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { cancelOrderWorkflow } from "../../../../../workflows/cancel-order"
import { requireOwnOrder } from "../../helpers"
import { StoreCancelOrderType } from "../../validators"

// POST /store/orders/:id/cancel — покупатель отменяет свой заказ. Стейт-машина
// разрешает отмену только до отгрузки (new..assembled → canceled); ядро
// дополнительно откажет, если есть неотменённые fulfillment'ы. Чужой заказ — 404.
export async function POST(
  req: AuthenticatedMedusaRequest<StoreCancelOrderType>,
  res: MedusaResponse
) {
  await requireOwnOrder(req.scope, req.params.id, req.auth_context.actor_id)

  const { result } = await cancelOrderWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      actor_type: "buyer",
      actor_id: req.auth_context.actor_id,
      reason: req.validatedBody.reason ?? null,
    },
    throwOnError: true,
  })

  res.json({ order_id: req.params.id, status: result.to })
}
