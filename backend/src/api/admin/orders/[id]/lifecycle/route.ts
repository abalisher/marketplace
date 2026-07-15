import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { ORDER_LIFECYCLE_MODULE } from "../../../../../modules/order-lifecycle"
import OrderLifecycleModuleService from "../../../../../modules/order-lifecycle/service"

// GET /admin/orders/:id/lifecycle — бизнес-статус заказа (ТЗ) и полный лог
// переходов для админа (виджет на странице заказа + очередь). Ограничений по
// принадлежности нет — админ видит любой заказ.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "order_lifecycle.id",
      "order_lifecycle.status",
      "order_lifecycle.previous_status",
      "order_lifecycle.note",
    ],
    filters: { id: req.params.id },
  })

  if (!orders.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order ${req.params.id} not found`
    )
  }

  const lifecycle = (
    orders[0] as {
      order_lifecycle?: {
        id: string
        status: string
        previous_status: string | null
        note: string | null
      }
    }
  ).order_lifecycle

  if (!lifecycle) {
    res.json({
      order_id: req.params.id,
      status: null,
      previous_status: null,
      note: null,
      history: [],
    })
    return
  }

  const service =
    req.scope.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
  const [history] = await service.listAndCountOrderLifecycleEvents(
    { order_lifecycle: lifecycle.id },
    { order: { created_at: "ASC" } }
  )

  res.json({
    order_id: req.params.id,
    status: lifecycle.status,
    previous_status: lifecycle.previous_status,
    note: lifecycle.note,
    history,
  })
}
