import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { OrderWorkflowEvents } from "@medusajs/framework/utils"
import { syncOrderLifecycleWorkflow } from "../workflows/sync-order-lifecycle"

type OrderCompletedPayload = {
  id: string
}

// Завершение через ядро двигает наш цикл в «Закрыт». Если ядро ушло вперёд на
// несколько этапов, догон проходит их по стейт-машине по очереди — каждый хоп
// отдельной строкой лога с актором «система».
export default async function syncLifecycleOnOrderCompleted({
  event: { data },
  container,
}: SubscriberArgs<OrderCompletedPayload>) {
  await syncOrderLifecycleWorkflow(container).run({
    input: {
      order_id: data.id,
      to: "closed",
      reason: "Синхронизация с ядром: заказ завершён в ядровом интерфейсе",
    },
  })
}

export const config: SubscriberConfig = {
  event: OrderWorkflowEvents.COMPLETED,
}
