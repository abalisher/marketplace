import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { deleteDeliveryTariffWorkflow } from "../../../../../workflows/delete-delivery-tariff"

// DELETE /admin/logistics/tariffs/:id — удалить тариф (workflow с компенсацией).
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await deleteDeliveryTariffWorkflow(req.scope).run({
    input: { id: req.params.id },
    throwOnError: true,
  })
  res.json({ id: req.params.id, object: "delivery_tariff", deleted: true })
}
