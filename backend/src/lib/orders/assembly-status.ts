import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { OrderStatusValue } from "../../modules/order-lifecycle/models/statuses"

// Наш статус сборки — производная от факта fulfillment'а: собрано всё
// заказанное → assembled, часть → partially_assembled.
// Вычисляемый order.fulfillment_status сервис/остальные пути не отдают надёжно
// (link-связь order ↔ fulfillment), поэтому считаем сами: суммарно заказано
// (сервис order, где доступно количество) против суммарно во fulfillment'ах
// (query.graph по link'у fulfillments; их количества — обычные int).
// Читают двое: шаг сценарной сборки (determine-assembly-status) и подписчик
// догона за ядром (sync-lifecycle-on-fulfillment) — правило одно на обоих.
export const determineAssemblyStatus = async (
  container: MedusaContainer,
  orderId: string
): Promise<OrderStatusValue> => {
  const orderService = container.resolve(Modules.ORDER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const order = await orderService.retrieveOrder(orderId, {
    relations: ["items"],
  })
  const totalOrdered = (order.items ?? []).reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  )

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "fulfillments.canceled_at", "fulfillments.items.quantity"],
    filters: { id: orderId },
  })
  const fulfillments =
    (
      orders[0] as {
        fulfillments?: {
          canceled_at: string | null
          items: { quantity: number }[]
        }[]
      }
    )?.fulfillments ?? []
  const totalFulfilled = fulfillments
    .filter((f) => !f.canceled_at)
    .reduce(
      (sum, f) => sum + f.items.reduce((s, it) => s + Number(it.quantity), 0),
      0
    )

  return totalFulfilled >= totalOrdered ? "assembled" : "partially_assembled"
}
