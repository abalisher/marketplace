import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { ORDER_LIFECYCLE_MODULE } from "../../modules/order-lifecycle"
import OrderLifecycleModuleService from "../../modules/order-lifecycle/service"
import {
  OrderStatusValue,
  StatusActorType,
} from "../../modules/order-lifecycle/models/statuses"

export type RecordStatusTransitionStepInput = {
  order_id: string
  to: OrderStatusValue
  actor_type: StatusActorType
  actor_id?: string | null
  reason?: string | null
}

type CompensationData = {
  order_lifecycle_id: string
  previous: {
    status: OrderStatusValue
    previous_status: OrderStatusValue | null
    note: string | null
  }
  event_id: string
}

// Общий шаг перехода статуса: находит жизненный цикл по заказу (через link
// order ↔ orderLifecycle), проверяет инвариант стейт-машины и применяет переход
// (сервис пишет лог + обновляет статус). Само событие эмитится отдельным
// emitEventStep в workflow — оно доставляется только после успеха всего
// workflow. Компенсация возвращает прежний статус и удаляет запись лога.
export const recordStatusTransitionStep = createStep(
  "record-status-transition",
  async (input: RecordStatusTransitionStepInput, { container }) => {
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

    // Link-поле order_lifecycle типизируется в .medusa/types (генерится при
    // старте dev) — читаем через явную форму строки, чтобы tsc не зависел от неё.
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

    const compensation: CompensationData = {
      order_lifecycle_id: lifecycle.id,
      previous: {
        status: lifecycle.status as OrderStatusValue,
        previous_status:
          (lifecycle.previous_status as OrderStatusValue | null) ?? null,
        note: lifecycle.note ?? null,
      },
      event_id: "",
    }

    const { event } = await service.recordTransition({
      order_lifecycle_id: lifecycle.id,
      to: input.to,
      actor_type: input.actor_type,
      actor_id: input.actor_id,
      reason: input.reason,
    })
    compensation.event_id = event.id

    return new StepResponse(
      {
        order_lifecycle_id: lifecycle.id,
        from: compensation.previous.status,
        to: input.to,
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
      status: compensation.previous.status,
      previous_status: compensation.previous.previous_status,
      note: compensation.previous.note,
    })
    await service.deleteOrderLifecycleEvents(compensation.event_id)
  }
)
