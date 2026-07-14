import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import OrderLifecycle from "./models/order-lifecycle"
import OrderLifecycleEvent from "./models/order-lifecycle-event"
import { OrderStatusValue, StatusActorType } from "./models/statuses"

// Разрешённые переходы жизненного цикла заказа (стейт-машина ТЗ, см.
// docs/modules/order.md). Терминальные статусы (canceled, returned) целей не
// имеют; closed → returned оставлен для возврата в окне 14 дней после закрытия.
export const ORDER_STATUS_TRANSITIONS: Record<
  OrderStatusValue,
  OrderStatusValue[]
> = {
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
}

// Инвариант стейт-машины: бросает, если переход из from в to не разрешён.
// Чистая функция (не метод сервиса) — тестируется без БД и переиспользуется
// в workflow-шагах до применения перехода.
export function assertOrderStatusTransition(
  from: OrderStatusValue,
  to: OrderStatusValue
) {
  const allowed = ORDER_STATUS_TRANSITIONS[from] ?? []
  if (!allowed.includes(to)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Order status transition ${from} → ${to} is not allowed`
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
  async recordTransition(input: {
    order_lifecycle_id: string
    to: OrderStatusValue
    actor_type: StatusActorType
    actor_id?: string | null
    reason?: string | null
  }) {
    const current = await this.retrieveOrderLifecycle(input.order_lifecycle_id)
    const from = current.status as OrderStatusValue
    assertOrderStatusTransition(from, input.to)

    await this.createOrderLifecycleEvents({
      order_lifecycle: input.order_lifecycle_id,
      from_status: from,
      to_status: input.to,
      actor_type: input.actor_type,
      actor_id: input.actor_id ?? null,
      reason: input.reason ?? null,
    })

    return await this.updateOrderLifecycles({
      id: input.order_lifecycle_id,
      status: input.to,
      previous_status: from,
      note: input.reason ?? null,
    })
  }
}

export default OrderLifecycleModuleService
