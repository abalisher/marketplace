import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { parseDeliverySlot } from "../../lib/logistics/delivery-slots"
import { ORDER_LIFECYCLE_MODULE } from "../../modules/order-lifecycle"
import OrderLifecycleModuleService from "../../modules/order-lifecycle/service"
import {
  DeliveryWindow,
  StatusActorType,
} from "../../modules/order-lifecycle/models/statuses"

export type RescheduleDeliverySlotStepInput = {
  order_id: string
  date: string
  window: DeliveryWindow
  actor_type: StatusActorType
  actor_id?: string | null
  // Почему подвинули (звонок покупателя, сдвиг сборки) — попадает в лог заказа.
  reason?: string | null
}

type CompensationData = {
  order_lifecycle_id: string
  previous: { date: string | null; window: DeliveryWindow | null }
  event_id: string
}

// Перенос слота доставки: находит жизненный цикл по заказу (link order ↔
// orderLifecycle), проверяет ДОСТУПНОСТЬ нового окна доменом слота и применяет
// перенос (сервис пишет запись лога kind=slot + обновляет слот).
//
// Доступность проверяется здесь, а не в сервисе модуля: «можно ли ещё взять это
// окно» — правило домена слота (запас на сборку, горизонт недели), одно на чат,
// оформление и панель. Слот, который покупателю в чате уже не предложат,
// продавец не должен уметь поставить из панели — иначе обещание разъедется
// с тем, что магазин выполняет.
//
// Компенсация возвращает прежний слот и удаляет запись лога.
export const rescheduleDeliverySlotStep = createStep(
  "reschedule-delivery-slot",
  async (input: RescheduleDeliverySlotStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const service =
      container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)

    const slot = parseDeliverySlot(input.date, input.window, new Date())
    if (!slot) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Delivery slot ${input.date} ${input.window} is not available`
      )
    }

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "order_lifecycle.id",
        "order_lifecycle.delivery_date",
        "order_lifecycle.delivery_window",
      ],
      filters: { id: input.order_id },
    })

    // Link-поле order_lifecycle типизируется в .medusa/types (генерится при
    // старте dev) — читаем через явную форму строки, чтобы tsc не зависел от неё.
    const lifecycle = (
      orders[0] as {
        order_lifecycle?: {
          id: string
          delivery_date: string | null
          delivery_window: string | null
        }
      }
    )?.order_lifecycle
    if (!lifecycle) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Order ${input.order_id} has no lifecycle record`
      )
    }

    const { event, from } = await service.rescheduleDeliverySlot({
      order_lifecycle_id: lifecycle.id,
      date: slot.date,
      window: slot.window,
      actor_type: input.actor_type,
      actor_id: input.actor_id,
      reason: input.reason,
    })

    const compensation: CompensationData = {
      order_lifecycle_id: lifecycle.id,
      previous: from,
      event_id: event.id,
    }

    return new StepResponse(
      {
        order_lifecycle_id: lifecycle.id,
        from,
        to: { date: slot.date, window: slot.window },
      },
      compensation
    )
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    const service =
      container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)

    await service.updateOrderLifecycles({
      id: compensation.order_lifecycle_id,
      delivery_date: compensation.previous.date,
      delivery_window: compensation.previous.window,
    })
    await service.deleteOrderLifecycleEvents(compensation.event_id)
  }
)
