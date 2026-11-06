// Бизнес-статус заказа (ТЗ) + полный лог переходов — общая выборка для двух
// роутов: GET /admin/orders/:id/lifecycle (виджет на ядровой странице заказа) и
// GET /admin/orders/:id/lifecycle/card (карточка-drawer очереди, T4.2c).
// Держим в одном месте, чтобы у drawer'а и виджета не разъехались правила
// (например «нет lifecycle → статус null, а не 404»).

import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { ORDER_LIFECYCLE_MODULE } from "../../../../../modules/order-lifecycle"
import OrderLifecycleModuleService from "../../../../../modules/order-lifecycle/service"
import {
  StaffRole,
  loadStaffRoles,
  loadTransitionActorNames,
} from "./actor-names"

// Запись лога переходов в том виде, в каком её описывает контракт
// (AdminOrderLifecycleEvent): служебные поля модели (order_lifecycle_id,
// updated_at, deleted_at) наружу не отдаём — экраны их не читают.
export type LifecycleEvent = {
  id: string
  // Род записи: переход статуса или перенос слота доставки (T5.6b). Панель
  // рисует их по-разному — «Собран → Собран» вместо переноса читалось бы
  // как сбой.
  kind: string
  from_status: string | null
  to_status: string
  actor_type: string
  actor_id: string | null
  // Имя человека, сделавшего переход (T4.12): роль «администратор» на вопрос
  // «кто перевёл» не отвечает. null — переход системы или удалённая учётка,
  // тогда экран подписывает переход одной ролью.
  actor_name: string | null
  // Роль сотрудника для подписи (picker | seller | admin) — по учётке, а не по
  // actor_type записи (см. loadStaffRoles); null — актор не сотрудник.
  actor_role: string | null
  reason: string | null
  // Слот до и после переноса (kind = slot; у переходов статуса — null).
  // Кодами: подпись «6 сент., 13:00–17:00» собирает панель на своём языке.
  from_slot_date: string | null
  from_slot_window: string | null
  to_slot_date: string | null
  to_slot_window: string | null
  created_at: string | null
}

export type LifecycleDetail = {
  order_id: string
  // Номер заказа для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  number: string | null
  status: string | null
  previous_status: string | null
  note: string | null
  delivery_method: string | null
  // Слот доставки (T5.6): продавец планирует день по нему, а не по адресу.
  delivery_date: string | null
  delivery_window: string | null
  history: LifecycleEvent[]
}

type RawLifecycleEvent = {
  id: string
  kind?: string | null
  from_status: string | null
  to_status: string
  actor_type: string
  actor_id: string | null
  reason: string | null
  from_slot_date?: string | null
  from_slot_window?: string | null
  to_slot_date?: string | null
  to_slot_window?: string | null
  created_at?: string | Date | null
}

const toEvent = (
  event: RawLifecycleEvent,
  names: Map<string, string>,
  roles: Map<string, StaffRole>
): LifecycleEvent => ({
  id: event.id,
  // Записи, сделанные до T5.6b, kind не имеют — это переходы статуса.
  kind: event.kind ?? "status",
  from_status: event.from_status,
  to_status: event.to_status,
  actor_type: event.actor_type,
  actor_id: event.actor_id,
  actor_name: event.actor_id ? (names.get(event.actor_id) ?? null) : null,
  actor_role: event.actor_id ? (roles.get(event.actor_id) ?? null) : null,
  reason: event.reason,
  from_slot_date: event.from_slot_date ?? null,
  from_slot_window: event.from_slot_window ?? null,
  to_slot_date: event.to_slot_date ?? null,
  to_slot_window: event.to_slot_window ?? null,
  created_at:
    event.created_at instanceof Date
      ? event.created_at.toISOString()
      : (event.created_at ?? null),
})

// Заказа нет вовсе → 404. Заказ есть, а lifecycle нет (создан не нашим
// placeOrder) → статусы null и пустая история: экран покажет «цикла нет», а не
// упадёт.
export async function loadLifecycleDetail(
  scope: MedusaContainer,
  orderId: string
): Promise<LifecycleDetail> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "order_lifecycle.id",
      "order_lifecycle.number",
      "order_lifecycle.status",
      "order_lifecycle.previous_status",
      "order_lifecycle.note",
      "order_lifecycle.delivery_method",
      "order_lifecycle.delivery_date",
      "order_lifecycle.delivery_window",
    ],
    filters: { id: orderId },
  })

  if (!orders.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order ${orderId} not found`
    )
  }

  const lifecycle = (
    orders[0] as {
      order_lifecycle?: {
        id: string
        number?: string | null
        status: string
        previous_status: string | null
        note: string | null
        delivery_method: string
        delivery_date: string | null
        delivery_window: string | null
      }
    }
  ).order_lifecycle

  if (!lifecycle) {
    return {
      order_id: orderId,
      number: null,
      status: null,
      previous_status: null,
      note: null,
      delivery_method: null,
      delivery_date: null,
      delivery_window: null,
      history: [],
    }
  }

  const service =
    scope.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
  const [history] = await service.listAndCountOrderLifecycleEvents(
    { order_lifecycle: lifecycle.id },
    { order: { created_at: "ASC" } }
  )
  const [actorNames, staffRoles] = await Promise.all([
    loadTransitionActorNames(scope, history as RawLifecycleEvent[]),
    loadStaffRoles(scope, history as RawLifecycleEvent[]),
  ])

  // delivery_code админу НЕ отдаём: код — секрет покупателя, водитель узнаёт
  // его при вручении (в этом смысл приёмки по коду).
  return {
    order_id: orderId,
    number: lifecycle.number ?? null,
    status: lifecycle.status,
    previous_status: lifecycle.previous_status,
    note: lifecycle.note,
    delivery_method: lifecycle.delivery_method,
    delivery_date: lifecycle.delivery_date,
    delivery_window: lifecycle.delivery_window,
    history: (history as RawLifecycleEvent[]).map((event) =>
      toEvent(event, actorNames, staffRoles)
    ),
  }
}
