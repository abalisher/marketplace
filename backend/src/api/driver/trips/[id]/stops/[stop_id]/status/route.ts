import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  canMoveStop,
  findOwnTrip,
  findTripStop,
  loadOrderNumbers,
  resolveDeliveryTarget,
} from "../../../../../../../lib/logistics/driver-trips"
import { setTripStopStatusWorkflow } from "../../../../../../../workflows/set-trip-stop-status"
import { toDriverTripStopView } from "../../../../../trip-view"
import { rejectTrip } from "../../../../rejections"
import { DriverSetStopStatusType } from "../../../../validators"

// POST /driver/trips/:id/stops/:stop_id/status — водитель ведёт точку (T5.2b):
// приехал → выдал (фото/подпись + код получения от покупателя) или не смог
// (с причиной для продавца).
//
// Выдача delivery-точки ТРИГГЕРИТ deliver-order — заказ становится delivered
// именно здесь, отдельной кнопки «вручить» у водителя нет. Fulfillment для
// ядрового вручения резолвит сервер: водитель про fulfillment'ы не знает.
export async function POST(
  req: AuthenticatedMedusaRequest<DriverSetStopStatusType>,
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

  const stop = await findTripStop(req.scope, trip.id, req.params.stop_id)
  if (!stop) {
    rejectTrip(res, "stop_not_found")
    return
  }

  const { status, proof, note, delivery_code } = req.validatedBody
  if (!canMoveStop(stop.status, status)) {
    rejectTrip(res, "invalid_transition")
    return
  }

  // Выдача заказа: проверяем отгрузку и код ДО перевода точки — иначе водитель
  // получил бы технический отказ инварианта заказа вместо «заказ ещё не
  // отгружен» / «код неверный».
  let fulfillmentId: string | undefined
  if (status === "done" && stop.type === "delivery") {
    const target = await resolveDeliveryTarget(req.scope, {
      order_id: stop.order_id,
      delivery_code,
    })
    if (target.rejection) {
      rejectTrip(res, target.rejection)
      return
    }
    fulfillmentId = target.fulfillment_id
  }

  await setTripStopStatusWorkflow(req.scope).run({
    input: {
      id: stop.id,
      status,
      proof: proof ?? null,
      note: note ?? null,
      fulfillment_id: fulfillmentId,
      delivery_code,
      actor_type: "driver",
      actor_id: req.auth_context.actor_id,
    },
    throwOnError: true,
  })

  const updated = await findTripStop(req.scope, trip.id, stop.id)
  const numbers = await loadOrderNumbers(req.scope, [stop.order_id])
  res.json({
    stop: toDriverTripStopView(
      updated ?? stop,
      numbers.get(stop.order_id) ?? null
    ),
  })
}
