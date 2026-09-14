import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { TRIP_STOP_STATUS_CHANGED_EVENT } from "../modules/logistics/events"

type TripStopStatusChangedPayload = {
  trip_stop_id: string
  order_id: string
  type: string
  status: string
}

// Уведомление покупателю о статусе его точки (прибыл/выдано, ТЗ 4.8). Триггер
// deliver-order на выдаче делает сам workflow set-trip-stop-status (не подписчик)
// — здесь только уведомление. Пока notification-провайдера нет — заглушка
// логирует (идиома order-lifecycle). Контракт trip_stop.status_changed неизменен.
export default async function notifyTripStopStatusChanged({
  event: { data },
  container,
}: SubscriberArgs<TripStopStatusChangedPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info(
    `[logistics stub] stop ${data.trip_stop_id} (${data.type}, order ${data.order_id}) status → ${data.status}`
  )
}

export const config: SubscriberConfig = {
  event: TRIP_STOP_STATUS_CHANGED_EVENT,
}
