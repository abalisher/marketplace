import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { FulfillmentWorkflowEvents } from "@medusajs/framework/utils"
import { findOrderIdByFulfillment } from "../lib/orders/order-of-fulfillment"
import { syncOrderLifecycleWorkflow } from "../workflows/sync-order-lifecycle"

type ShipmentCreatedPayload = {
  // id fulfillment'а, а НЕ заказа — заказ достаём по ссылке.
  id: string
}

// Отгрузка через ядро («Отметить как отправленный») двигает наш цикл в
// «В доставке». Код получения при этом выдаётся тем же правилом, что и в
// shipOrderWorkflow (см. шаг sync-lifecycle-status).
export default async function syncLifecycleOnShipment({
  event: { data },
  container,
}: SubscriberArgs<ShipmentCreatedPayload>) {
  const orderId = await findOrderIdByFulfillment(container, data.id)
  if (!orderId) {
    return
  }

  await syncOrderLifecycleWorkflow(container).run({
    input: {
      order_id: orderId,
      to: "in_delivery",
      reason: "Синхронизация с ядром: отгрузка отмечена в ядровом интерфейсе",
    },
  })
}

export const config: SubscriberConfig = {
  event: FulfillmentWorkflowEvents.SHIPMENT_CREATED,
}
