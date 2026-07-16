import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import OrderLifecycle from "./models/order-lifecycle"
import OrderLifecycleEvent from "./models/order-lifecycle-event"
import {
  DeliveryMethod,
  OrderStatusValue,
  StatusActorType,
} from "./models/statuses"

// Разрешённые переходы жизненного цикла заказа (стейт-машина ТЗ +
// поправка «способы получения», см. docs/modules/order.md). Карта — на каждый
// способ получения: delivery проходит полный путь; pickup выдаётся у окна без
// этапа доставки (assembled → delivered); counter — свёрнутый POS-путь
// (new → delivered). Терминальные статусы (canceled, returned) целей не имеют;
// closed → returned оставлен для возврата в окне 14 дней после закрытия.
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
  pickup: {
    new: ["confirmed", "canceled"],
    confirmed: ["assembling", "canceled"],
    assembling: ["partially_assembled", "assembled", "canceled"],
    // Частичную выдачу самовывоза не поддерживаем — только досборка.
    partially_assembled: ["assembled", "canceled"],
    // Выдача у окна — сразу delivered, этапа in_delivery нет.
    assembled: ["delivered", "canceled"],
    in_delivery: [],
    delivered: ["closed", "returned"],
    closed: ["returned"],
    canceled: [],
    returned: [],
  },
  counter: {
    // Продажа у окна: заказ создаётся и сразу выдаётся (place-counter-order).
    new: ["delivered", "canceled"],
    confirmed: [],
    assembling: [],
    partially_assembled: [],
    assembled: [],
    in_delivery: [],
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
// не статус). pickup/counter подтверждаются накладной — код не требуется.
// Чистая функция — тестируется без БД, вызывается в recordTransition.
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
}

export default OrderLifecycleModuleService
