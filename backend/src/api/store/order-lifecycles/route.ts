import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Заказ с полями связанного жизненного цикла (link order ↔ orderLifecycle).
type OrderWithLifecycle = {
  id: string
  order_lifecycle?: {
    status: string
    previous_status: string | null
    delivery_method: string
    delivery_code: string | null
    delivery_date: string | null
    delivery_window: string | null
  } | null
}

// GET /store/order-lifecycles — бизнес-стадии ВСЕХ заказов текущего покупателя
// одним запросом (кабинет, T10.6). Ядровый GET /store/orders отдаёт номер, дату
// и сумму, но не знает про наш order-lifecycle; без этого роута список заказов
// дочитывал стадию по одному запросу на заказ (N+1 в обоих клиентах).
// Заказ без заведённого цикла в ответ не попадает — клиент показывает его без
// бейджа стадии, а не падает. delivery_code отдаём здесь же: выборка идёт
// строго по customer_id, значит все заказы — свои (правило /store/orders/:id/lifecycle).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "order_lifecycle.status",
      "order_lifecycle.previous_status",
      "order_lifecycle.delivery_method",
      "order_lifecycle.delivery_code",
      "order_lifecycle.delivery_date",
      "order_lifecycle.delivery_window",
    ],
    filters: { customer_id: req.auth_context.actor_id },
  })

  const lifecycles = (orders as OrderWithLifecycle[])
    .filter((order) => !!order.order_lifecycle)
    .map((order) => ({
      order_id: order.id,
      status: order.order_lifecycle!.status,
      previous_status: order.order_lifecycle!.previous_status ?? null,
      delivery_method: order.order_lifecycle!.delivery_method,
      delivery_code: order.order_lifecycle!.delivery_code ?? null,
      // Слот доставки (T5.6): в списке заказов кабинета покупатель видит, когда
      // ждать машину, не открывая заказ.
      delivery_date: order.order_lifecycle!.delivery_date ?? null,
      delivery_window: order.order_lifecycle!.delivery_window ?? null,
    }))

  res.json({ lifecycles })
}
