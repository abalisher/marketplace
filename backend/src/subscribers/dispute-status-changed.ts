import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DISPUTE_STATUS_CHANGED_EVENT } from "../modules/reviews/events"

type DisputeStatusChangedPayload = {
  dispute_id: string
  order_id: string
  from: string
  to: string
}

// Уведомление покупателя о движении по его диспуту (взят в работу / решён /
// отклонён). Пока notification-провайдера нет — заглушка логирует событие
// (идиома order-status-changed). Контракт dispute.status_changed неизменен.
export default async function notifyDisputeStatusChanged({
  event: { data },
  container,
}: SubscriberArgs<DisputeStatusChangedPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info(
    `[dispute-notification stub] order ${data.order_id}: dispute ${data.dispute_id} ` +
      `${data.from} → ${data.to} — notify buyer`
  )
}

export const config: SubscriberConfig = {
  event: DISPUTE_STATUS_CHANGED_EVENT,
}
