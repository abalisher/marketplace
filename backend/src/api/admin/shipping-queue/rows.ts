import { RemoteQueryFunction } from "@medusajs/framework/types"
import {
  AssemblyTaskRow,
  OrderRef,
  TaskLike,
  buildAssemblyTaskRow,
} from "../assembly-tasks/rows"
import { OrderAssemblySummary } from "../../../modules/assembly/service"
import { AdminOrderLifecycleRowOrder } from "../order-lifecycles/rows"
import { OrderStatusValue } from "../../../modules/order-lifecycle/models/statuses"

// Очередь экрана отгрузки (T10.13): заказы, которые ещё НЕ уехали, каждый —
// плитками категорий и одной понятной стадией. Роут тонкий, вся арифметика и
// склейка — здесь (идиома order-lifecycles/rows.ts).

type Query = Omit<RemoteQueryFunction, symbol>

// Заказ попадает в очередь отгрузки, пока не отгружен: статусы до in_delivery.
// Отфильтровать «в сборке» по ядровому статусу заказа НЕЛЬЗЯ — жизненный цикл
// догоняет факт сборки только при закрытии ПОСЛЕДНЕГО задания
// (ensure-order-assembling), поэтому заказ со сборкой в работе висит ещё в
// `new`/`confirmed`. Стадию считаем по заданиям, а статус нужен лишь для того,
// чтобы понять, разрешён ли переход «передать водителю».
export const SHIPPING_QUEUE_STATUSES: OrderStatusValue[] = [
  "new",
  "confirmed",
  "assembling",
  "partially_assembled",
  "assembled",
]

// Статусы, из которых стейт-машина разрешает отгрузку.
const SHIPPABLE_STATUSES: OrderStatusValue[] = [
  "assembled",
  "partially_assembled",
]

// Стадия заказа для чипов экрана: собирается → готов к отгрузке → нехватка
// (по всем заданиям отработали, но часть не набралась — решает отгрузка).
export const SHIPPING_STAGES = ["assembling", "ready", "shortage"] as const
export type ShippingStage = (typeof SHIPPING_STAGES)[number]

// Сколько заказов очереди просматриваем за раз. Очередь отгрузки — рабочий
// стол «что сейчас едет», а не журнал: заказов в ней десятки. Стадию нельзя
// сосчитать фильтром БД (она выводится из заданий), поэтому страницу режем в
// памяти по этому потолку — честнее, чем врать в счётчиках чипов.
export const SHIPPING_QUEUE_SCAN_CAP = 200

// Плитка категории: то, что рисует экран — кто собирает, сколько позиций
// осталось, где нехватка. Позиций задания в плитке нет намеренно: отгрузке
// нужен светофор по категориям, а список товаров — в карточке заказа.
export type ShippingCategoryTile = Omit<AssemblyTaskRow, "items"> & {
  assignee_name: string | null
  completed_by_name: string | null
}

export type ShippingQueueRow = {
  order: AdminOrderLifecycleRowOrder | null
  order_id: string
  order_status: OrderStatusValue
  stage: ShippingStage
  summary: OrderAssemblySummary
  categories: ShippingCategoryTile[]
  // Переход «передать водителю» разрешён: по всем заданиям отработали, статус
  // заказа это допускает и есть что отгружать. Решает бэкенд — кнопка экрана
  // только следует ответу.
  can_ship: boolean
  ship_target: ShipTarget | null
}

export type ShipTarget = {
  fulfillment_id: string
  items: { id: string; quantity: number }[]
}

export type ShippingQueueCounts = {
  total: number
  by_stage: Record<ShippingStage, number>
}

// Стадия по агрегату заданий. Нехватка — отдельная стадия, а не оттенок
// «готов»: по ней отгрузка принимает решение (довезти или отправить как есть).
export const shippingStage = (summary: OrderAssemblySummary): ShippingStage => {
  if (!summary.is_finished) {
    return "assembling"
  }
  return summary.has_shortage ? "shortage" : "ready"
}

export const emptyStageCounts = (): Record<ShippingStage, number> =>
  SHIPPING_STAGES.reduce(
    (acc, stage) => ({ ...acc, [stage]: 0 }),
    {} as Record<ShippingStage, number>
  )

export const countByStage = (
  stages: ShippingStage[]
): ShippingQueueCounts => {
  const by_stage = emptyStageCounts()
  for (const stage of stages) {
    by_stage[stage] += 1
  }
  return { total: stages.length, by_stage }
}

// Fulfillment под отгрузку: живой и ещё не отгруженный (то же правило, что в
// карточке заказа — cardTransitionTargets).
export type RawFulfillment = {
  id: string
  shipped_at?: Date | string | null
  canceled_at?: Date | string | null
}

// Цель перехода «передать водителю». Позиции берём НЕ все позиции заказа, а
// реально набранное сборщиками (fulfillmentLinesFromTasks): у частично
// собранного заказа ядровый fulfillment создан именно на них.
export const shipTarget = (
  fulfillments: RawFulfillment[],
  lines: { id: string; quantity: number }[]
): ShipTarget | null => {
  const fulfillment = fulfillments
    .filter((f) => !f.canceled_at)
    .find((f) => !f.shipped_at)
  if (!fulfillment || !lines.length) {
    return null
  }
  return { fulfillment_id: fulfillment.id, items: lines }
}

// Плитки категорий заказа. Имена сборщиков подставляем картой: технических id
// на экране панели нет (идиома «ноль id / JSON / metadata»).
export const buildCategoryTiles = (
  tasks: TaskLike[],
  names: Map<string, string>,
  order?: OrderRef
): ShippingCategoryTile[] =>
  tasks.map((task) => {
    const { items: _items, ...row } = buildAssemblyTaskRow(task, order)
    return {
      ...row,
      assignee_name: row.assignee_id ? (names.get(row.assignee_id) ?? null) : null,
      completed_by_name: row.completed_by
        ? (names.get(row.completed_by) ?? null)
        : null,
    }
  })

export const buildShippingRow = (input: {
  order_id: string
  order_status: OrderStatusValue
  summary: OrderAssemblySummary
  categories: ShippingCategoryTile[]
  order: AdminOrderLifecycleRowOrder | null
  ship_target: ShipTarget | null
}): ShippingQueueRow => {
  const stage = shippingStage(input.summary)
  return {
    order_id: input.order_id,
    order: input.order,
    order_status: input.order_status,
    stage,
    summary: input.summary,
    categories: input.categories,
    can_ship:
      input.summary.is_finished &&
      SHIPPABLE_STATUSES.includes(input.order_status) &&
      !!input.ship_target,
    ship_target: input.ship_target,
  }
}

// Fulfillment'ы страницы одной выборкой. Читаем через query.graph, а НЕ через
// сервис модуля order: fulfillment живёт в своём модуле и связан с заказом
// ссылкой — `relations: ["fulfillments"]` у сервиса пустует (проверено на
// стенде: цель отгрузки выходила null у собранного заказа). Та же выборка, что
// в карточке заказа (card.ts).
export const loadFulfillments = async (
  query: Query,
  orderIds: string[]
): Promise<Map<string, RawFulfillment[]>> => {
  const map = new Map<string, RawFulfillment[]>()
  if (!orderIds.length) {
    return map
  }

  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "fulfillments.id",
      "fulfillments.shipped_at",
      "fulfillments.canceled_at",
    ],
    filters: { id: orderIds },
    pagination: { skip: 0, take: orderIds.length },
  })

  for (const order of data as {
    id: string
    fulfillments?: RawFulfillment[] | null
  }[]) {
    map.set(order.id, order.fulfillments ?? [])
  }
  return map
}
