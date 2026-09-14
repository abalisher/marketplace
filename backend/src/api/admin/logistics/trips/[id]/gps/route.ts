import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { LOGISTICS_MODULE } from "../../../../../../modules/logistics"
import LogisticsModuleService from "../../../../../../modules/logistics/service"
import { recordGpsPingWorkflow } from "../../../../../../workflows/record-gps-ping"
import { AdminRecordGpsPingType } from "../../../validators"
import { serializePing } from "../../../serializers"

// POST /admin/logistics/trips/:id/gps — принять GPS-пинг водителя (append).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminRecordGpsPingType>,
  res: MedusaResponse
) {
  const { result } = await recordGpsPingWorkflow(req.scope).run({
    input: {
      trip_id: req.params.id,
      driver_id: req.validatedBody.driver_id,
      lat: req.validatedBody.lat,
      lng: req.validatedBody.lng,
    },
    throwOnError: true,
  })
  res.status(201).json({ ping: serializePing(result) })
}

// GET /admin/logistics/trips/:id/gps — последняя известная позиция по рейсу
// (polling диспетчера/покупателя; realtime отложен, см. logistics.md). Нет
// пингов → position: null.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
  const ping = await service.getLatestPosition(req.params.id)
  res.json({ position: ping ? serializePing(ping) : null })
}
