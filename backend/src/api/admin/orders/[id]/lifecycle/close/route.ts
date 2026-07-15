import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { closeOrderWorkflow } from "../../../../../../workflows/close-order"

// POST /admin/orders/:id/lifecycle/close — закрытие после окна возврата:
// ядровый completeOrder (order.status → completed), наш статус → closed.
// Обычно вызывается джобой; ручной вызов доступен админу.
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { result } = await closeOrderWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      actor_type: "admin",
      actor_id: req.auth_context.actor_id,
    },
    throwOnError: true,
  })

  res.json({ order_id: req.params.id, status: result.to })
}
