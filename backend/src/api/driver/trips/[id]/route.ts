import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  findOwnTrip,
  listStopsOfTrips,
  loadOrderNumbers,
} from "../../../../lib/logistics/driver-trips"
import { toDriverTripWithStopsView } from "../../trip-view"
import { rejectTrip } from "../rejections"

// GET /driver/trips/:id — один мой рейс с точками (экран рейса, T5.2b).
// Чужой рейс = 404: наличие чужого рейса водителя не касается (идиома
// require-own-order).
export async function GET(
  req: AuthenticatedMedusaRequest,
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

  const stops = await listStopsOfTrips(req.scope, [trip.id])
  const numbers = await loadOrderNumbers(
    req.scope,
    stops.map((stop) => stop.order_id)
  )

  // Форма ровно как в списке «мои рейсы» — точки внутри рейса.
  res.json({ trip: toDriverTripWithStopsView(trip, stops, numbers) })
}
