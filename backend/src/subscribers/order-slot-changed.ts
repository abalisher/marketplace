import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ORDER_SLOT_CHANGED_EVENT } from "../modules/order-lifecycle/events"

type SlotChangedPayload = {
  order_id: string
  order_lifecycle_id: string
  from: { date: string | null; window: string | null }
  to: { date: string; window: string }
  actor_type: string
  reason: string | null
}

// Уведомление покупателя о переносе доставки (T5.6b). Окно приезда покупатель
// планирует под бригаду и разгрузку — молчаливый перенос хуже отсутствия слота.
// Пока notification-провайдера (push/SMS/email) нет — заглушка логирует
// событие, как и уведомления о переходах статуса; покупатель видит новое окно
// в чате и в кабинете (слот приходит из lifecycle). Когда появится модуль
// уведомлений, здесь резолвится покупатель и шлётся сообщение — событийный
// контракт (from/to + причина) остаётся прежним.
export default async function notifyOrderSlotChanged({
  event: { data },
  container,
}: SubscriberArgs<SlotChangedPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const slot = (value: { date: string | null; window: string | null }) =>
    value.date ? `${value.date} ${value.window}` : "—"

  logger.info(
    `[order-notification stub] order ${data.order_id}: delivery slot ` +
      `${slot(data.from)} → ${slot(data.to)} (by ${data.actor_type}` +
      `${data.reason ? `, reason: ${data.reason}` : ""}) — notify buyer`
  )
}

export const config: SubscriberConfig = {
  event: ORDER_SLOT_CHANGED_EVENT,
}
