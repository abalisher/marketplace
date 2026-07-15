import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { startOrderAssemblyWorkflow } from "../../../../../../workflows/start-order-assembly"

// POST /admin/orders/:id/lifecycle/start-assembly — кладовщик начал
// комплектацию (confirmed → assembling). Этап ТЗ, которого нет в ядре.
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { result } = await startOrderAssemblyWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      actor_type: "admin",
      actor_id: req.auth_context.actor_id,
    },
    throwOnError: true,
  })

  res.json({ order_id: req.params.id, status: result.to })
}
