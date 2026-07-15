import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ORDER_STATUS_CHANGED_EVENT } from "../modules/order-lifecycle/events"

type StatusChangedPayload = {
  order_id: string
  order_lifecycle_id: string
  from: string
  to: string
  actor_type: string
}

// Уведомление обеих сторон о каждом переходе статуса заказа (ТЗ). Пока
// notification-провайдера (push/SMS/email) нет — заглушка логирует событие.
// Когда появится модуль уведомлений, здесь резолвится покупатель/продавец и
// шлётся сообщение; событийный контракт (order_lifecycle.status_changed с
// from/to) остаётся прежним.
export default async function notifyOrderStatusChanged({
  event: { data },
  container,
}: SubscriberArgs<StatusChangedPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info(
    `[order-notification stub] order ${data.order_id}: ${data.from} → ${data.to} ` +
      `(by ${data.actor_type}) — notify buyer & seller`
  )
}

export const config: SubscriberConfig = {
  event: ORDER_STATUS_CHANGED_EVENT,
}
