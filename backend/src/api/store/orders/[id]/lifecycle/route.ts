import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ORDER_LIFECYCLE_MODULE } from "../../../../../modules/order-lifecycle"
import OrderLifecycleModuleService from "../../../../../modules/order-lifecycle/service"
import { requireOwnOrder } from "../../helpers"

// GET /store/orders/:id/lifecycle — бизнес-статус заказа (ТЗ) и лог переходов
// для текущего покупателя. Единое поле статуса, которое читает клиент, вместо
// склейки трёх ядровых (status/fulfillment_status/payment_status). Чужой заказ
// — 404 (см. requireOwnOrder).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const order = await requireOwnOrder(
    req.scope,
    req.params.id,
    req.auth_context.actor_id
  )

  const lifecycle = (
    order as {
      order_lifecycle?: {
        id: string
        status: string
        previous_status: string | null
        note: string | null
      }
    }
  ).order_lifecycle

  // Заказ без жизненного цикла (теоретически невозможно — placeOrder заводит
  // его всегда) — отдаём пустую историю, а не падаем.
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
