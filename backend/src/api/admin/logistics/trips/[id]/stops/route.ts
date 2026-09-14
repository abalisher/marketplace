import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { addTripStopWorkflow } from "../../../../../../workflows/add-trip-stop"
import { AdminAddTripStopType } from "../../../validators"
import { serializeStop } from "../../../serializers"

// POST /admin/logistics/trips/:id/stops — добавить точку рейса (выдача/возврат).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminAddTripStopType>,
  res: MedusaResponse
) {
  const { result } = await addTripStopWorkflow(req.scope).run({
    input: {
      trip_id: req.params.id,
      order_id: req.validatedBody.order_id,
      type: req.validatedBody.type,
      sequence: req.validatedBody.sequence,
      address_snapshot: req.validatedBody.address_snapshot,
    },
    throwOnError: true,
  })
  res.status(201).json({ stop: serializeStop(result) })
}
