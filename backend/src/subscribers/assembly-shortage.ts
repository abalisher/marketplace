import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  ASSEMBLY_SHORTAGE_EVENT,
  AssemblyShortagePayload,
} from "../modules/assembly/events"

// Нехватка при сборке — сигнал отвечающему за отгрузку (требование владельца:
// нехватка не блокирует заказ молча). Канал уведомлений в MVP не заводим
// (развилка №0 закрыта: покупателю — только чат, сотруднику — экран отгрузки),
// поэтому подписчик пока логирует, а флаг живёт в данных заказа
// (GET /admin/orders/:id/assembly). Идиома — order-status-changed.
export default async function notifyAssemblyShortage({
  event: { data },
  container,
}: SubscriberArgs<AssemblyShortagePayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.warn(
    `[assembly-shortage] заказ ${data.order_id}: задание ${data.task_id} ` +
      `(${data.category_name}) закрыто с нехваткой — решает отгрузка`
  )
}

export const config: SubscriberConfig = {
  event: ASSEMBLY_SHORTAGE_EVENT,
}
