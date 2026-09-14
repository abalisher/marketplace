import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { ORDER_LIFECYCLE_MODULE } from "../../modules/order-lifecycle"
import OrderLifecycleModuleService from "../../modules/order-lifecycle/service"
import { OrderStatusValue } from "../../modules/order-lifecycle/models/statuses"

export type EnsureOrderAssemblingStepInput = {
  order_id: string
  actor_id?: string | null
}

type Compensation = {
  order_lifecycle_id: string
  status: OrderStatusValue
  previous_status: OrderStatusValue | null
  note: string | null
  event_ids: string[]
}

// Сборка началась физически — жизненный цикл заказа догоняет факт.
// Оплата у нас 100% предоплата (place-order пропускает только оплаченную
// корзину), поэтому «Подтверждён» для физлица — формальность, из-за которой
// собранный заказ не должен застревать: шаг сам проводит new → confirmed →
// assembling от имени системы. Переходы пишутся в лог (actor_type=system) —
// событие шины на них не эмитим, его шлёт итоговый переход сборки
// (complete-order-assembly). Компенсация возвращает прежний статус и снимает
// дописанные записи лога.
const PATH_TO_ASSEMBLING: Record<string, OrderStatusValue[]> = {
  new: ["confirmed", "assembling"],
  confirmed: ["assembling"],
  assembling: [],
  partially_assembled: [],
}

export const ensureOrderAssemblingStep = createStep(
  "ensure-order-assembling",
  async (input: EnsureOrderAssemblingStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const service =
      container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "order_lifecycle.id",
        "order_lifecycle.status",
        "order_lifecycle.previous_status",
        "order_lifecycle.note",
      ],
      filters: { id: input.order_id },
    })
    const lifecycle = (
      orders[0] as {
        order_lifecycle?: {
          id: string
          status: string
          previous_status: string | null
          note: string | null
        }
      }
    )?.order_lifecycle
    if (!lifecycle) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Order ${input.order_id} has no lifecycle record`
      )
    }

    const path = PATH_TO_ASSEMBLING[lifecycle.status]
    if (!path) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Order ${input.order_id} cannot start assembly from status ${lifecycle.status}`
      )
    }

    const compensation: Compensation = {
      order_lifecycle_id: lifecycle.id,
      status: lifecycle.status as OrderStatusValue,
      previous_status:
        (lifecycle.previous_status as OrderStatusValue | null) ?? null,
      note: lifecycle.note ?? null,
      event_ids: [],
    }

    for (const to of path) {
      const { event } = await service.recordTransition({
        order_lifecycle_id: lifecycle.id,
        to,
        actor_type: "system",
        actor_id: input.actor_id ?? null,
        reason: "Сборка по заданиям категорий",
      })
      compensation.event_ids.push(event.id)
    }

    return new StepResponse(
      { status: path.length ? path[path.length - 1] : compensation.status },
      compensation
    )
  },
  async (compensation, { container }) => {
    if (!compensation?.event_ids.length) {
      return
    }
    const service =
      container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
    await service.updateOrderLifecycles({
      id: compensation.order_lifecycle_id,
      status: compensation.status,
      previous_status: compensation.previous_status,
      note: compensation.note,
    })
    await service.deleteOrderLifecycleEvents(compensation.event_ids)
  }
)
