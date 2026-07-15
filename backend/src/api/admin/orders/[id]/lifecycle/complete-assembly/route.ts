import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { completeOrderAssemblyWorkflow } from "../../../../../../workflows/complete-order-assembly"
import { AdminCompleteAssemblyType } from "../../../validators"

// POST /admin/orders/:id/lifecycle/complete-assembly — сборка (в т.ч.
// частичная): ядровый createOrderFulfillment фиксирует физику, наш статус
// синхронизируется (полная → assembled, частичная → partially_assembled).
// items — позиции к сборке (полная сборка = все позиции заказа).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminCompleteAssemblyType>,
  res: MedusaResponse
) {
  const { result: fulfillment } = await completeOrderAssemblyWorkflow(
    req.scope
  ).run({
    input: {
      order_id: req.params.id,
      items: req.validatedBody.items,
      location_id: req.validatedBody.location_id,
      actor_type: "admin",
      actor_id: req.auth_context.actor_id,
    },
    throwOnError: true,
  })

  res.json({ order_id: req.params.id, fulfillment })
}
