import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { LOGISTICS_MODULE } from "../../../../../../modules/logistics"
import LogisticsModuleService from "../../../../../../modules/logistics/service"
import { setTripStatusWorkflow } from "../../../../../../workflows/set-trip-status"
import { AdminSetTripStatusType } from "../../../validators"
import { serializeTrip } from "../../../serializers"

// POST /admin/logistics/trips/:id/status — перевод рейса по стейт-машине.
// Недопустимый переход → 400 (assertTripTransition в шаге).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminSetTripStatusType>,
  res: MedusaResponse
) {
  await setTripStatusWorkflow(req.scope).run({
    input: { id: req.params.id, status: req.validatedBody.status },
    throwOnError: true,
  })
  const service = req.scope.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
  const trip = await service.retrieveTrip(req.params.id)
  res.json({ trip: serializeTrip(trip) })
}
