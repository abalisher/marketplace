import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { LOGISTICS_MODULE } from "../../../../../modules/logistics"
import LogisticsModuleService from "../../../../../modules/logistics/service"
import { serializeTrip, serializeStop } from "../../serializers"

// GET /admin/logistics/trips/:id — рейс + его точки (сортировка по sequence).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
  let trip
  try {
    trip = await service.retrieveTrip(req.params.id)
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Trip ${req.params.id} not found`
    )
  }
  const stops = await service.listTripStops(
    { trip_id: req.params.id },
    { order: { sequence: "ASC" } }
  )
  res.json({
    trip: serializeTrip(trip),
    stops: stops.map(serializeStop),
  })
}
