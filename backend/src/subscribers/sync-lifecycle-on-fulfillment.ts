import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { OrderWorkflowEvents } from "@medusajs/framework/utils"
import { determineAssemblyStatus } from "../lib/orders/assembly-status"
import { syncOrderLifecycleWorkflow } from "../workflows/sync-order-lifecycle"

type FulfillmentCreatedPayload = {
  order_id: string
  fulfillment_id: string
}

// Сборка через ядро («Выполнить заказ» на ядровой странице заказа) двигает наш
// цикл в «Собран» / «Частично собран» — по факту количеств во fulfillment'ах,
// тем же правилом, что и сценарная сборка. Собственная сборка тоже поднимает
// это событие, но к моменту доставки наш статус уже целевой и догон молчит.
export default async function syncLifecycleOnFulfillment({
  event: { data },
  container,
}: SubscriberArgs<FulfillmentCreatedPayload>) {
  const to = await determineAssemblyStatus(container, data.order_id)

  await syncOrderLifecycleWorkflow(container).run({
    input: {
      order_id: data.order_id,
      to,
      reason: "Синхронизация с ядром: заказ собран через ядровый интерфейс",
    },
  })
}

export const config: SubscriberConfig = {
  event: OrderWorkflowEvents.FULFILLMENT_CREATED,
}
