import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { confirmOrderWorkflow } from "../../../../../../workflows/confirm-order"

// POST /admin/orders/:id/lifecycle/confirm — менеджер подтверждает заявку
// (new → confirmed). Под /lifecycle/, чтобы не конфликтовать с ядровыми
// операциями заказа (/admin/orders/:id/complete, /cancel и т.п.).
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { result } = await confirmOrderWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      actor_type: "admin",
      actor_id: req.auth_context.actor_id,
    },
    throwOnError: true,
  })

  res.json({ order_id: req.params.id, status: result.to })
}
