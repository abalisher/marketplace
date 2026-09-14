import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { TRIP_CLAIMED_EVENT } from "../modules/logistics/events"

type TripClaimedPayload = {
  trip_id: string
  order_id: string
  driver_id: string
}

// Водитель взял заказ из пула (T5.2a). Продавцу это надо знать, не глядя в
// экран: назначение больше не проходит через диспетчера. Пока
// notification-провайдера нет — заглушка логирует событие (идиома
// trip-status-changed). Контракт trip.claimed неизменен.
export default async function notifyTripClaimed({
  event: { data },
  container,
}: SubscriberArgs<TripClaimedPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info(
    `[logistics stub] driver ${data.driver_id} claimed order ${data.order_id} (trip ${data.trip_id})`
  )
}

export const config: SubscriberConfig = {
  event: TRIP_CLAIMED_EVENT,
}
