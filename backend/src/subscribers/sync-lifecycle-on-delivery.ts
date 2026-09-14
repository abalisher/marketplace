import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { FulfillmentWorkflowEvents } from "@medusajs/framework/utils"
import { findOrderIdByFulfillment } from "../lib/orders/order-of-fulfillment"
import { syncOrderLifecycleWorkflow } from "../workflows/sync-order-lifecycle"

type DeliveryCreatedPayload = {
  // id fulfillment'а, а НЕ заказа — заказ достаём по ссылке.
  id: string
}

// Вручение через ядро («Отметить как доставленный») двигает наш цикл в
// «Доставлен». Кода получения от покупателя в этом пути нет — физика уже
// зафиксирована ядром, и причина в логе прямо это фиксирует (разбор инварианта
// — в шаге sync-lifecycle-status и DECISIONS 2026-09-03).
export default async function syncLifecycleOnDelivery({
  event: { data },
  container,
}: SubscriberArgs<DeliveryCreatedPayload>) {
  const orderId = await findOrderIdByFulfillment(container, data.id)
  if (!orderId) {
    return
  }

  await syncOrderLifecycleWorkflow(container).run({
    input: {
      order_id: orderId,
      to: "delivered",
      reason:
        "Синхронизация с ядром: вручение отмечено в ядровом интерфейсе, без кода получения",
    },
  })
}

export const config: SubscriberConfig = {
  event: FulfillmentWorkflowEvents.DELIVERY_CREATED,
}
