import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { OrderWorkflowEvents } from "@medusajs/framework/utils"
import { syncOrderLifecycleWorkflow } from "../workflows/sync-order-lifecycle"

type OrderCanceledPayload = {
  id: string
}

// Отмена через ядро двигает наш цикл в «Отменён». Обязательную причину отмены
// (наш инвариант панели) ядро не спрашивает — в лог уходит причина-догон, из
// которой видно, что отменяли мимо панели.
export default async function syncLifecycleOnOrderCanceled({
  event: { data },
  container,
}: SubscriberArgs<OrderCanceledPayload>) {
  await syncOrderLifecycleWorkflow(container).run({
    input: {
      order_id: data.id,
      to: "canceled",
      reason: "Синхронизация с ядром: заказ отменён в ядровом интерфейсе",
    },
  })
}

export const config: SubscriberConfig = {
  event: OrderWorkflowEvents.CANCELED,
}
