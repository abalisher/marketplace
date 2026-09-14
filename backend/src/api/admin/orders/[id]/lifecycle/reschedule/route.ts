import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { listDeliverySlots } from "../../../../../../lib/logistics/delivery-slots"
import { OrderStatusValue } from "../../../../../../modules/order-lifecycle/models/statuses"
import { SLOT_RESCHEDULE_STATUSES } from "../../../../../../modules/order-lifecycle/service"
import { rescheduleOrderDeliveryWorkflow } from "../../../../../../workflows/reschedule-order-delivery"
import { AdminRescheduleOrderType } from "../../../validators"
import { loadLifecycleDetail } from "../lifecycle-detail"

// GET /admin/orders/:id/lifecycle/reschedule — какие окна ещё можно поставить
// этому заказу и можно ли его вообще двигать. Список считает БЭКЕНД, а не
// панель: доступность окна (запас на сборку, горизонт недели) — правило домена
// слота, одно на чат покупателя и на панель продавца. Панель получает коды и
// подписывает их сама (та же идиома, что у слота в карточке заказа).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  // Тот же загрузчик, что у карточки: «заказа нет» → 404, «заказ без цикла» →
  // статус null (двигать нечего, но экран не падает).
  const detail = await loadLifecycleDetail(req.scope, req.params.id)

  const canReschedule =
    detail.delivery_method === "delivery" &&
    SLOT_RESCHEDULE_STATUSES.includes(detail.status as OrderStatusValue)

  res.json({
    order_id: detail.order_id,
    status: detail.status,
    can_reschedule: canReschedule,
    current: {
      date: detail.delivery_date,
      window: detail.delivery_window,
    },
    // Подписи домена (они по-русски) наружу не отдаём — панель локализована.
    slots: listDeliverySlots(new Date()).map((slot) => ({
      date: slot.date,
      window: slot.window,
    })),
  })
}

// POST /admin/orders/:id/lifecycle/reschedule — перенести доставку на другое
// окно: продавец двигает слот по звонку покупателя («объект не готов, привезите
// в четверг утром»). Причина обязательна — лог заказа должен отвечать, кто и
// почему подвинул доставку, иначе через день никто не вспомнит.
// Статус заказа при этом не меняется, поэтому роут не под .../lifecycle/<переход>,
// а отдельным действием.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminRescheduleOrderType>,
  res: MedusaResponse
) {
  const { result } = await rescheduleOrderDeliveryWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      date: req.validatedBody.slot_date,
      window: req.validatedBody.slot_window,
      actor_type: "admin",
      actor_id: req.auth_context.actor_id,
      reason: req.validatedBody.reason,
    },
    throwOnError: true,
  })

  res.json({
    order_id: req.params.id,
    delivery_date: result.to.date,
    delivery_window: result.to.window,
  })
}
