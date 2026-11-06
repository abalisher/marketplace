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
        number?: string | null
        status: string
        previous_status: string | null
        note: string | null
        delivery_method: string
        delivery_code: string | null
        delivery_date: string | null
        delivery_window: string | null
      }
    }
  ).order_lifecycle

  // Заказ без жизненного цикла (теоретически невозможно — placeOrder заводит
  // его всегда) — отдаём пустую историю, а не падаем.
  if (!lifecycle) {
    res.json({
      order_id: req.params.id,
      number: null,
      status: null,
      previous_status: null,
      note: null,
      delivery_method: null,
      delivery_code: null,
      delivery_date: null,
      delivery_window: null,
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

  // delivery_code отдаём именно покупателю (владение проверено выше):
  // при доставке он называет код водителю при вручении. В admin-ответах кода нет.
  res.json({
    order_id: req.params.id,
    // Номер заказа для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
    number: lifecycle.number ?? null,
    status: lifecycle.status,
    previous_status: lifecycle.previous_status,
    note: lifecycle.note,
    delivery_method: lifecycle.delivery_method,
    delivery_code: lifecycle.delivery_code,
    // Слот доставки (T5.6): покупатель видит в кабинете, когда ждать машину.
    // Дата и окно — кодами; подпись собирает клиент на своём языке.
    delivery_date: lifecycle.delivery_date,
    delivery_window: lifecycle.delivery_window,
    // Лог — в форме контракта: служебных полей модели и id сотрудника, который
    // провёл переход, покупателю не отдаём (хватит роли — actor_type).
    history: history.map((event) => ({
      id: event.id,
      kind: event.kind,
      from_status: event.from_status,
      to_status: event.to_status,
      actor_type: event.actor_type,
      reason: event.reason,
      from_slot_date: event.from_slot_date,
      from_slot_window: event.from_slot_window,
      to_slot_date: event.to_slot_date,
      to_slot_window: event.to_slot_window,
      created_at: event.created_at,
    })),
  })
}
