import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { deliverOrderWorkflow } from "../../../../../../workflows/deliver-order"
import { AdminDeliverOrderType } from "../../../validators"

// POST /admin/orders/:id/lifecycle/deliver — вручение: наш статус → delivered
// (для delivery — только с верным кодом получения от покупателя; для pickup —
// выдача у окна по накладной), затем ядровый markOrderFulfillmentAsDelivered.
// Дальше — окно возврата, затем закрытие (close).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminDeliverOrderType>,
  res: MedusaResponse
) {
  const { result } = await deliverOrderWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      fulfillment_id: req.validatedBody.fulfillment_id,
      delivery_code: req.validatedBody.delivery_code,
      actor_type: "admin",
      actor_id: req.auth_context.actor_id,
    },
    throwOnError: true,
  })

  res.json({ order_id: req.params.id, status: result.to })
}
