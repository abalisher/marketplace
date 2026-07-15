import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { shipOrderWorkflow } from "../../../../../../workflows/ship-order"
import { AdminShipOrderType } from "../../../validators"

// POST /admin/orders/:id/lifecycle/ship — отгрузка: ядровый createOrderShipment
// (fulfillment → shipped), наш статус → in_delivery. Отгрузить можно и частично
// собранный заказ (стейт-машина разрешает partially_assembled → in_delivery).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminShipOrderType>,
  res: MedusaResponse
) {
  const { result } = await shipOrderWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      fulfillment_id: req.validatedBody.fulfillment_id,
      items: req.validatedBody.items,
      actor_type: "admin",
      actor_id: req.auth_context.actor_id,
    },
    throwOnError: true,
  })

  res.json({ order_id: req.params.id, status: result.to })
}
