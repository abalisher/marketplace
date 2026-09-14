import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { LOGISTICS_MODULE } from "../../../../../../../../modules/logistics"
import LogisticsModuleService from "../../../../../../../../modules/logistics/service"
import { setTripStopStatusWorkflow } from "../../../../../../../../workflows/set-trip-stop-status"
import { AdminSetTripStopStatusType } from "../../../../../validators"
import { serializeStop } from "../../../../../serializers"

// POST /admin/logistics/trips/:id/stops/:stop_id/status — перевод точки по
// стейт-машине + proof/checklist. Для выдачи delivery-точки (done) с
// fulfillment_id — триггерит deliver-order (заказ → delivered по коду покупателя).
// Недопустимый переход / неверный код получения → 400.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminSetTripStopStatusType>,
  res: MedusaResponse
) {
  await setTripStopStatusWorkflow(req.scope).run({
    input: {
      id: req.params.stop_id,
      status: req.validatedBody.status,
      proof: req.validatedBody.proof,
      checklist: req.validatedBody.checklist,
      note: req.validatedBody.note,
      fulfillment_id: req.validatedBody.fulfillment_id,
      delivery_code: req.validatedBody.delivery_code,
      actor_id: req.auth_context.actor_id,
    },
    throwOnError: true,
  })
  const service = req.scope.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
  const stop = await service.retrieveTripStop(req.params.stop_id)
  res.json({ stop: serializeStop(stop) })
}
