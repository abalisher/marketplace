import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { TRIP_STATUS_CHANGED_EVENT } from "../modules/logistics/events"

type TripStatusChangedPayload = {
  trip_id: string
  status: string
}

// Уведомление покупателю/диспетчеру о смене статуса рейса (выезд/прибытие,
// ТЗ 4.8). Пока notification-провайдера нет — заглушка логирует событие (идиома
// order-lifecycle/scoring). Контракт trip.status_changed неизменен.
export default async function notifyTripStatusChanged({
  event: { data },
  container,
}: SubscriberArgs<TripStatusChangedPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info(
    `[logistics stub] trip ${data.trip_id} status → ${data.status}`
  )
}

export const config: SubscriberConfig = {
  event: TRIP_STATUS_CHANGED_EVENT,
}
