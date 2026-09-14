import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { findOwnTrip } from "../../../../../lib/logistics/driver-trips"
import { recordGpsPingWorkflow } from "../../../../../workflows/record-gps-ping"
import { toDriverGpsPingView } from "../../../trip-view"
import { rejectTrip } from "../../rejections"
import { DriverRecordGpsPingType } from "../../validators"

// POST /driver/trips/:id/gps — приложение водителя льёт свои координаты по
// своему рейсу (T5.2b). Позицию отдаёт admin-роут диспетчеру
// (GET /admin/logistics/trips/:id/gps) — водителю трек не нужен.
//
// driver_id идёт из токена: подписать пинг чужим водителем нельзя. Чужой рейс —
// 404, иначе по кодам ответа можно было бы перебирать рейсы.
export async function POST(
  req: AuthenticatedMedusaRequest<DriverRecordGpsPingType>,
  res: MedusaResponse
) {
  const trip = await findOwnTrip(
    req.scope,
    req.auth_context.actor_id,
    req.params.id
  )
  if (!trip) {
    rejectTrip(res, "trip_not_found")
    return
  }

  const { result } = await recordGpsPingWorkflow(req.scope).run({
    input: {
      trip_id: trip.id,
      driver_id: req.auth_context.actor_id,
      lat: req.validatedBody.lat,
      lng: req.validatedBody.lng,
    },
    throwOnError: true,
  })

  res.status(201).json({ ping: toDriverGpsPingView(result) })
}
