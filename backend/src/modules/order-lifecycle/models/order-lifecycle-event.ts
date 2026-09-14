import { model } from "@medusajs/framework/utils"
import OrderLifecycle from "./order-lifecycle"
import {
  DELIVERY_WINDOWS,
  ORDER_EVENT_KINDS,
  ORDER_STATUSES,
  STATUS_ACTOR_TYPES,
} from "./statuses"

// Лог заказа. ТЗ: статусы заказов логируются бессрочно (кто, когда, из какого
// в какой) — одна запись на каждый переход. С T5.6b тем же логом ведётся и
// перенос слота доставки: продавец двигает окно по звонку покупателя, и «кто и
// почему подвинул» должно остаться в истории заказа наравне с переходами.
// Род записи различает `kind`.
const OrderLifecycleEvent = model.define("order_lifecycle_event", {
  id: model.id({ prefix: "ordlce" }).primaryKey(),
  // Род записи: переход статуса или перенос слота доставки (T5.6b).
  kind: model.enum([...ORDER_EVENT_KINDS]).default("status"),
  // null у самой первой записи (заказ только создан — «откуда» нет).
  from_status: model.enum([...ORDER_STATUSES]).nullable(),
  // У записи о переносе слота (kind = slot) статус не меняется — в обоих
  // полях стоит текущий статус заказа, а не выдуманный переход: колонка
  // обязательная, а «переход в null» читался бы как потеря статуса.
  to_status: model.enum([...ORDER_STATUSES]),
  // Кто инициировал переход (buyer/seller/admin/system).
  actor_type: model.enum([...STATUS_ACTOR_TYPES]),
  // Идентификатор актора (customer_id/user_id) — null для системы.
  actor_id: model.text().nullable(),
  // Причина/комментарий (обязателен, например, при отмене — валидация в workflow).
  reason: model.text().nullable(),
  // Слот доставки до и после переноса (kind = slot; у переходов статуса — null).
  // Хранится кодами, как и у самого заказа: подпись «6 сент., 13:00–17:00»
  // собирает панель на своём языке. Обе стороны переноса лежат в самой записи —
  // строка лога должна читаться целиком, не поднимая предыдущие записи.
  from_slot_date: model.text().nullable(),
  from_slot_window: model.enum([...DELIVERY_WINDOWS]).nullable(),
  to_slot_date: model.text().nullable(),
  to_slot_window: model.enum([...DELIVERY_WINDOWS]).nullable(),
  order_lifecycle: model.belongsTo(() => OrderLifecycle, {
    mappedBy: "events",
  }),
})

export default OrderLifecycleEvent
