import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import OrderLifecycle from "./models/order-lifecycle"
import OrderLifecycleEvent from "./models/order-lifecycle-event"
import {
  DeliveryMethod,
  DeliveryWindow,
  OrderStatusValue,
  StatusActorType,
} from "./models/statuses"

// Разрешённые переходы жизненного цикла заказа (стейт-машина ТЗ,
// см. docs/modules/order.md). После пивота 2026-07-22 остался единственный
// способ получения — delivery (полный путь). Терминальные статусы (canceled,
// returned) целей не имеют; closed → returned оставлен для возврата в окне
// 14 дней после закрытия. Карта сохранена per-method как точка расширения.
export const ORDER_STATUS_TRANSITIONS: Record<
  DeliveryMethod,
  Record<OrderStatusValue, OrderStatusValue[]>
> = {
  delivery: {
    new: ["confirmed", "canceled"],
    confirmed: ["assembling", "canceled"],
    assembling: ["partially_assembled", "assembled", "canceled"],
    partially_assembled: ["assembled", "in_delivery", "canceled"],
    assembled: ["in_delivery", "canceled"],
    in_delivery: ["delivered"],
    delivered: ["closed", "returned"],
    closed: ["returned"],
    canceled: [],
    returned: [],
  },
}

// Инвариант стейт-машины: бросает, если переход из from в to не разрешён для
// данного способа получения. Чистая функция (не метод сервиса) — тестируется
// без БД и переиспользуется в workflow-шагах до применения перехода.
export function assertOrderStatusTransition(
  from: OrderStatusValue,
  to: OrderStatusValue,
  method: DeliveryMethod = "delivery"
) {
  const allowed = ORDER_STATUS_TRANSITIONS[method]?.[from] ?? []
  if (!allowed.includes(to)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Order status transition ${from} → ${to} is not allowed for ${method}`
    )
  }
}

// Инвариант приёмки: переход в delivered для способа delivery валиден только
// с верным кодом получения («передан по коду» — способ подтвердить delivered,
// не статус). Чистая функция — тестируется без БД, вызывается в recordTransition.
export function assertDeliveryConfirmation(input: {
  method: DeliveryMethod
  stored_code: string | null
  provided_code?: string | null
}) {
  if (input.method !== "delivery") {
    return
  }
  if (!input.stored_code) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Order has no delivery code issued — cannot confirm delivery"
    )
  }
  if (!input.provided_code || input.provided_code !== input.stored_code) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Delivery code is missing or invalid"
    )
  }
}

// Статусы, из которых слот доставки ещё можно подвинуть (T5.6b). Пока заказ
// не уехал, окно — это обещание на будущее, и продавец меняет его по звонку
// покупателя. С момента отгрузки менять нечего: машина в пути (in_delivery),
// заказ вручён (delivered/closed) или его уже нет (canceled/returned) — перенос
// там только переписал бы историю.
export const SLOT_RESCHEDULE_STATUSES: OrderStatusValue[] = [
  "new",
  "confirmed",
  "assembling",
  "partially_assembled",
  "assembled",
]

// Инвариант переноса слота: чистая функция, тестируется без БД и вызывается
// перед записью. Способ получения проверяем тоже — слот есть только у доставки.
export function assertSlotRescheduleAllowed(input: {
  status: OrderStatusValue
  method: DeliveryMethod
}) {
  if (input.method !== "delivery") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Order with method ${input.method} has no delivery slot to reschedule`
    )
  }
  if (!SLOT_RESCHEDULE_STATUSES.includes(input.status)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Delivery slot cannot be rescheduled in status ${input.status}`
    )
  }
}

// Сервис домена «жизненный цикл заказа». CRUD по OrderLifecycle/
// OrderLifecycleEvent генерируется MedusaService; здесь — локальное применение
// перехода (проверка инварианта + обновление статуса + запись в лог). Вызов
// ЯДРОВЫХ workflow (fulfillment/shipment/complete/cancel) остаётся в
// src/workflows/ — правило изоляции модулей.
class OrderLifecycleModuleService extends MedusaService({
  OrderLifecycle,
  OrderLifecycleEvent,
}) {
  // Применить переход: проверить инвариант, дописать лог, обновить статус.
  // Трогает только локальные модели — атомарность на уровне модуля.
  // Возвращает и обновлённый статус, и созданную запись лога — id события
  // нужен workflow-шагу для компенсации (откат перехода при сбое дальше).
  async recordTransition(input: {
    order_lifecycle_id: string
    to: OrderStatusValue
    actor_type: StatusActorType
    actor_id?: string | null
    reason?: string | null
    // Код получения от покупателя — обязателен для delivered при способе
    // delivery (см. assertDeliveryConfirmation).
    delivery_code?: string | null
  }) {
    const current = await this.retrieveOrderLifecycle(input.order_lifecycle_id)
    const from = current.status as OrderStatusValue
    const method = current.delivery_method as DeliveryMethod
    assertOrderStatusTransition(from, input.to, method)
    if (input.to === "delivered") {
      assertDeliveryConfirmation({
        method,
        stored_code: current.delivery_code ?? null,
        provided_code: input.delivery_code,
      })
    }

    const event = await this.createOrderLifecycleEvents({
      order_lifecycle: input.order_lifecycle_id,
      from_status: from,
      to_status: input.to,
      actor_type: input.actor_type,
      actor_id: input.actor_id ?? null,
      reason: input.reason ?? null,
    })

    const lifecycle = await this.updateOrderLifecycles({
      id: input.order_lifecycle_id,
      status: input.to,
      previous_status: from,
      note: input.reason ?? null,
    })

    return { lifecycle, event }
  }

  // Перенести слот доставки: проверить инвариант, дописать в лог запись
  // kind=slot (слот до и после, кто и почему) и обновить слот заказа. Статус
  // при переносе НЕ меняется — двигается только обещание по времени, поэтому
  // ни `status`, ни `previous_status`, ни `note` не трогаем: `note` хранит
  // причину последнего ПЕРЕХОДА, и причина переноса её бы затёрла.
  // Доступность нового окна (запас на сборку, горизонт) проверяет вызывающий
  // слой — правило живёт в домене слота (lib/logistics/delivery-slots.ts).
  async rescheduleDeliverySlot(input: {
    order_lifecycle_id: string
    date: string
    window: DeliveryWindow
    actor_type: StatusActorType
    actor_id?: string | null
    reason?: string | null
  }) {
    const current = await this.retrieveOrderLifecycle(input.order_lifecycle_id)
    assertSlotRescheduleAllowed({
      status: current.status as OrderStatusValue,
      method: current.delivery_method as DeliveryMethod,
    })

    const from = {
      date: (current.delivery_date as string | null) ?? null,
      window: (current.delivery_window as DeliveryWindow | null) ?? null,
    }
    // Тот же слот — не перенос: пустая запись в логе врала бы, что доставку
    // подвинули, а продавец решил бы, что покупателя уведомили о новом окне.
    if (from.date === input.date && from.window === input.window) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order is already scheduled for this delivery slot"
      )
    }

    const status = current.status as OrderStatusValue
    const event = await this.createOrderLifecycleEvents({
      order_lifecycle: input.order_lifecycle_id,
      kind: "slot",
      from_status: status,
      to_status: status,
      actor_type: input.actor_type,
      actor_id: input.actor_id ?? null,
      reason: input.reason ?? null,
      from_slot_date: from.date,
      from_slot_window: from.window,
      to_slot_date: input.date,
      to_slot_window: input.window,
    })

    const lifecycle = await this.updateOrderLifecycles({
      id: input.order_lifecycle_id,
      delivery_date: input.date,
      delivery_window: input.window,
    })

    return { lifecycle, event, from }
  }
}

export default OrderLifecycleModuleService
