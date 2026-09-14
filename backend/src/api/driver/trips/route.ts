import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  listOwnTrips,
  listStopsOfTrips,
  loadOrderNumbers,
} from "../../../lib/logistics/driver-trips"
import { toDriverTripWithStopsView } from "../trip-view"

// GET /driver/trips — мои рейсы (T5.2b), новые сверху, вместе с точками.
// Точки идут в том же ответе намеренно: в gig-модели рейс это один заказ, и
// приложению на экране «мои рейсы» нужен адрес точки сразу — иначе список
// пришлось бы догружать по одному рейсу.
//
// Список ВСЕГДА только свой: driver_id берётся из токена, параметром его не
// передать (идиома GET /driver/me).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const trips = await listOwnTrips(req.scope, req.auth_context.actor_id)
  const stops = await listStopsOfTrips(
    req.scope,
    trips.map((trip) => trip.id)
  )
  const numbers = await loadOrderNumbers(
    req.scope,
    stops.map((stop) => stop.order_id)
  )

  res.json({
    trips: trips.map((trip) => toDriverTripWithStopsView(trip, stops, numbers)),
  })
}
