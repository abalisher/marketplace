import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

// Хелперы авторизации store-роутов заказа: заказ принадлежит текущему
// покупателю. Читают через query.graph, бизнес-логики не содержат.

// Заказ по id строго текущего покупателя; чужой/несуществующий — 404
// (не раскрываем существование чужих заказов). Возвращает order с полем
// жизненного цикла (link order ↔ orderLifecycle).
export async function requireOwnOrder(
  scope: MedusaContainer,
  orderId: string,
  customerId: string
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "customer_id",
      "order_lifecycle.id",
      "order_lifecycle.number",
      "order_lifecycle.status",
      "order_lifecycle.previous_status",
      "order_lifecycle.note",
      "order_lifecycle.delivery_method",
      "order_lifecycle.delivery_code",
      "order_lifecycle.delivery_date",
      "order_lifecycle.delivery_window",
    ],
    filters: { id: orderId, customer_id: customerId },
  })

  if (!orders.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order ${orderId} not found`
    )
  }
  return orders[0]
}
