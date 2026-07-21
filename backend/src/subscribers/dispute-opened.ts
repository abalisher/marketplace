import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DISPUTE_OPENED_EVENT } from "../modules/reviews/events"

type DisputeOpenedPayload = {
  dispute_id: string
  order_id: string
  category: string
}

// Уведомление оператора платформы о новом диспуте (ТЗ). Пока notification-
// провайдера нет — заглушка логирует событие. Событийный контракт dispute.opened
// останется прежним (для очереди диспутов подзадачи 3 и уведомлений).
export default async function notifyDisputeOpened({
  event: { data },
  container,
}: SubscriberArgs<DisputeOpenedPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info(
    `[dispute-notification stub] order ${data.order_id}: dispute opened ` +
      `(${data.category}, ${data.dispute_id}) — notify operator`
  )
}

export const config: SubscriberConfig = {
  event: DISPUTE_OPENED_EVENT,
}
