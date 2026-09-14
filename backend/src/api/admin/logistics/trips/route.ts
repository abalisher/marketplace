import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { LOGISTICS_MODULE } from "../../../../modules/logistics"
import LogisticsModuleService from "../../../../modules/logistics/service"
import { createTripWorkflow } from "../../../../workflows/create-trip"
import { AdminCreateTripType } from "../validators"
import { serializeTrip } from "../serializers"

// GET /admin/logistics/trips — список рейсов (новые сверху). Водитель работает
// из partner-app под admin-аутентификацией (см. validators.ts / DECISIONS).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
  const trips = await service.listTrips(
    {},
    { order: { created_at: "DESC" } }
  )
  res.json({ trips: trips.map(serializeTrip) })
}

// POST /admin/logistics/trips — создать рейс (planned).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateTripType>,
  res: MedusaResponse
) {
  const { result } = await createTripWorkflow(req.scope).run({
    input: req.validatedBody,
    throwOnError: true,
  })
  res.status(201).json({ trip: serializeTrip(result) })
}
