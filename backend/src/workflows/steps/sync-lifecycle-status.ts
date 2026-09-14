import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ORDER_LIFECYCLE_MODULE } from "../../modules/order-lifecycle"
import { generateDeliveryCode } from "../../modules/order-lifecycle/delivery-code"
import { planLifecycleSyncPath } from "../../modules/order-lifecycle/sync-path"
import OrderLifecycleModuleService from "../../modules/order-lifecycle/service"
import {
  DeliveryMethod,
  OrderStatusValue,
} from "../../modules/order-lifecycle/models/statuses"

export type SyncLifecycleStatusStepInput = {
  order_id: string
  // Статус, который следует из ядрового события (см. подписчиков sync-lifecycle-*).
  to: OrderStatusValue
  // Человекочитаемая причина догона — пишется в лог переходов и в примечание
  // заказа, чтобы «кто перевёл» отвечало «ядро, а не продавец».
  reason: string
}

export type SyncLifecycleStatusStepOutput = {
  order_lifecycle_id: string | null
  applied: { from: OrderStatusValue; to: OrderStatusValue }[]
}

type CompensationData = {
  order_lifecycle_id: string
  previous: {
    status: OrderStatusValue
    previous_status: OrderStatusValue | null
    note: string | null
  }
  event_ids: string[]
  issued_delivery_code: boolean
}

type RawLifecycle = {
  id: string
  status: string
  previous_status: string | null
  note: string | null
  delivery_method: string
  delivery_code: string | null
}

// Догон нашего цикла до статуса, который уже наступил в ядре. Один шаг на весь
// путь: количество переходов заранее неизвестно (ядро может уйти вперёд сразу
// на несколько этапов), а workflow-sdk не умеет динамическое число шагов.
//
// Идемпотентность: если цикл уже в целевом статусе — ничего не делаем и молчим
// (так гасится эхо собственных workflow: они сами вызывают ядро и получают его
// событие обратно). Если цель недостижима — цикл ушёл вперёд ядра или упёрся в
// терминальный статус; пишем предупреждение и НЕ выдумываем переход.
//
// Инвариант кода получения при догоне: код выдаётся на хопе in_delivery (как в
// shipOrderWorkflow), а на хопе delivered подставляется он же. Проверка «кода
// со слов покупателя» защищает наш путь вручения (водитель/продавец в панели);
// когда доставку отметили ЧЕРЕЗ ЯДРО, физика уже зафиксирована и отказ оставил
// бы ровно то расхождение, ради устранения которого этот догон и существует.
// Поэтому переход проходит, но причина в логе прямо говорит, что кода не было.
export const syncLifecycleStatusStep = createStep(
  "sync-lifecycle-status",
  async (input: SyncLifecycleStatusStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
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
        "order_lifecycle.delivery_method",
        "order_lifecycle.delivery_code",
      ],
      filters: { id: input.order_id },
    })

    // Link-поле order_lifecycle типизируется в .medusa/types (генерится при
    // старте dev) — читаем через явную форму строки, чтобы tsc не зависел от неё.
    const lifecycle = (
      orders[0] as { order_lifecycle?: RawLifecycle }
    )?.order_lifecycle

    // Заказ без жизненного цикла (черновик, заказ до внедрения модуля) — не
    // наша зона: догонять нечего, ронять подписчика незачем.
    if (!lifecycle) {
      return new StepResponse<SyncLifecycleStatusStepOutput, null>(
        { order_lifecycle_id: null, applied: [] },
        null
      )
    }

    const from = lifecycle.status as OrderStatusValue
    const path = planLifecycleSyncPath(
      from,
      input.to,
      lifecycle.delivery_method as DeliveryMethod
    )

    if (!path.length) {
      if (from !== input.to) {
        logger.warn(
          `[order-lifecycle-sync] заказ ${input.order_id}: ядро сообщило ` +
            `«${input.to}», наш статус «${from}» — перехода нет, догон пропущен ` +
            `(${input.reason})`
        )
      }
      return new StepResponse<SyncLifecycleStatusStepOutput, null>(
        { order_lifecycle_id: lifecycle.id, applied: [] },
        null
      )
    }

    const compensation: CompensationData = {
      order_lifecycle_id: lifecycle.id,
      previous: {
        status: from,
        previous_status:
          (lifecycle.previous_status as OrderStatusValue | null) ?? null,
        note: lifecycle.note ?? null,
      },
      event_ids: [],
      issued_delivery_code: false,
    }

    let deliveryCode = lifecycle.delivery_code
    let cursor = from
    const applied: { from: OrderStatusValue; to: OrderStatusValue }[] = []

    for (const hop of path) {
      // Код получения выдаётся на входе в доставку — тем же правилом, что и в
      // shipOrderWorkflow: без него следующий хоп (вручение) не пройдёт.
      if (hop === "in_delivery" && !deliveryCode) {
        deliveryCode = generateDeliveryCode()
        await service.updateOrderLifecycles({
          id: lifecycle.id,
          delivery_code: deliveryCode,
        })
        compensation.issued_delivery_code = true
      }

      const { event } = await service.recordTransition({
        order_lifecycle_id: lifecycle.id,
        to: hop,
        actor_type: "system",
        reason: input.reason,
        delivery_code: hop === "delivered" ? deliveryCode : null,
      })
      compensation.event_ids.push(event.id)
      applied.push({ from: cursor, to: hop })
      cursor = hop
    }

    logger.info(
      `[order-lifecycle-sync] заказ ${input.order_id}: ${from} → ` +
        `${applied.map((step) => step.to).join(" → ")} (${input.reason})`
    )

    return new StepResponse<SyncLifecycleStatusStepOutput, CompensationData>(
      { order_lifecycle_id: lifecycle.id, applied },
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
      ...(compensation.issued_delivery_code ? { delivery_code: null } : {}),
    })
    if (compensation.event_ids.length) {
      await service.deleteOrderLifecycleEvents(compensation.event_ids)
    }
  }
)
