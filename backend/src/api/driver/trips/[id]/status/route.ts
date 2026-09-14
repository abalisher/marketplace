import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  canMoveTrip,
  findOwnTrip,
  hasOpenStops,
} from "../../../../../lib/logistics/driver-trips"
import { setTripStatusWorkflow } from "../../../../../workflows/set-trip-status"
import { toDriverTripView } from "../../../trip-view"
import { rejectTrip } from "../../rejections"
import { DriverSetTripStatusType } from "../../validators"

// POST /driver/trips/:id/status — водитель ведёт свой рейс: погрузка → в пути →
// завершён (T5.2b). Отмена рейса водителю недоступна (валидатор) — заказ,
// который передумали везти, переназначает продавец (T5.2c).
export async function POST(
  req: AuthenticatedMedusaRequest<DriverSetTripStatusType>,
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

  const status = req.validatedBody.status
  if (!canMoveTrip(trip.status, status)) {
    rejectTrip(res, "invalid_transition")
    return
  }

  // Рейс закрывается, когда по каждой точке есть исход: выдал или не смог.
  // Иначе заказ остался бы «в доставке» без живого рейса, и продавец не узнал
  // бы, что его не увезли.
  if (status === "completed" && (await hasOpenStops(req.scope, trip.id))) {
    rejectTrip(res, "stops_open")
    return
  }

  const { result } = await setTripStatusWorkflow(req.scope).run({
    input: { id: trip.id, status },
    throwOnError: true,
  })

  res.json({ trip: toDriverTripView(result) })
}
