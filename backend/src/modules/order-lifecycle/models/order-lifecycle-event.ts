import { model } from "@medusajs/framework/utils"
import OrderLifecycle from "./order-lifecycle"
import { ORDER_STATUSES, STATUS_ACTOR_TYPES } from "./statuses"

// Лог переходов статуса заказа. ТЗ: статусы заказов логируются бессрочно
// (кто, когда, из какого в какой). Одна запись на каждый переход.
const OrderLifecycleEvent = model.define("order_lifecycle_event", {
  id: model.id({ prefix: "ordlce" }).primaryKey(),
  // null у самой первой записи (заказ только создан — «откуда» нет).
  from_status: model.enum([...ORDER_STATUSES]).nullable(),
  to_status: model.enum([...ORDER_STATUSES]),
  // Кто инициировал переход (buyer/seller/admin/system).
  actor_type: model.enum([...STATUS_ACTOR_TYPES]),
  // Идентификатор актора (customer_id/user_id) — null для системы.
  actor_id: model.text().nullable(),
  // Причина/комментарий (обязателен, например, при отмене — валидация в workflow).
  reason: model.text().nullable(),
  order_lifecycle: model.belongsTo(() => OrderLifecycle, {
    mappedBy: "events",
  }),
})

export default OrderLifecycleEvent
