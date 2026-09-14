import { RemoteQueryFunction } from "@medusajs/framework/types"
import {
  ASSEMBLY_TASK_STATUSES,
  AssemblyItemStatus,
  AssemblyTaskStatus,
} from "../../../modules/assembly/models/constants"

// Сборка строки очереди заданий (экран сборщика T10.12 и экран отгрузки
// T10.13 читают одно и то же). Роут остаётся тонким: считает и склеивает всё
// здесь, а чистые функции покрыты юнитом (идиома order-lifecycles/rows.ts).

export type TaskItemLike = {
  id: string
  order_item_id: string
  variant_id?: string | null
  title: string
  sku?: string | null
  quantity: number
  picked_quantity?: number | null
  status: string
  marked_at?: Date | string | null
  marked_by?: string | null
  note?: string | null
}

export type TaskLike = {
  id: string
  order_id: string
  category_handle: string
  category_name: string
  status: string
  assignee_id?: string | null
  started_at?: Date | string | null
  completed_at?: Date | string | null
  completed_by?: string | null
  note?: string | null
  created_at?: Date | string | null
  items?: TaskItemLike[]
}

export type OrderRef = {
  id: string
  display_id: number | null
  email: string | null
  customer_name: string | null
}

export type AssemblyTaskItemRow = {
  id: string
  order_item_id: string
  variant_id: string | null
  title: string
  sku: string | null
  quantity: number
  picked_quantity: number
  status: AssemblyItemStatus
  marked_at: string | null
  marked_by: string | null
  note: string | null
}

export type AssemblyTaskRow = {
  id: string
  order_id: string
  order_display_id: number | null
  customer_name: string | null
  category_handle: string
  category_name: string
  status: AssemblyTaskStatus
  assignee_id: string | null
  started_at: string | null
  completed_at: string | null
  completed_by: string | null
  note: string | null
  created_at: string | null
  // Сводка по позициям — то, что рисует плитка задания: сколько всего,
  // сколько отмечено, сколько не набралось.
  items_total: number
  items_marked: number
  items_missing: number
  items: AssemblyTaskItemRow[]
}

const iso = (value?: Date | string | null): string | null => {
  if (!value) {
    return null
  }
  return value instanceof Date ? value.toISOString() : String(value)
}

export const serializeAssemblyItem = (
  item: TaskItemLike
): AssemblyTaskItemRow => ({
  id: item.id,
  order_item_id: item.order_item_id,
  variant_id: item.variant_id ?? null,
  title: item.title,
  sku: item.sku ?? null,
  quantity: Number(item.quantity),
  picked_quantity: Number(item.picked_quantity ?? 0),
  status: item.status as AssemblyItemStatus,
  marked_at: iso(item.marked_at),
  marked_by: item.marked_by ?? null,
  note: item.note ?? null,
})

// Строка задания. Заказ приходит отдельной картой: order_id — опазная колонка
// (модуль order не импортируем), номер и покупателя дочитывает роут.
export const buildAssemblyTaskRow = (
  task: TaskLike,
  order?: OrderRef
): AssemblyTaskRow => {
  const items = (task.items ?? []).map(serializeAssemblyItem)
  return {
    id: task.id,
    order_id: task.order_id,
    order_display_id: order?.display_id ?? null,
    customer_name: order?.customer_name ?? order?.email ?? null,
    category_handle: task.category_handle,
    category_name: task.category_name,
    status: task.status as AssemblyTaskStatus,
    assignee_id: task.assignee_id ?? null,
    started_at: iso(task.started_at),
    completed_at: iso(task.completed_at),
    completed_by: task.completed_by ?? null,
    note: task.note ?? null,
    created_at: iso(task.created_at),
    items_total: items.length,
    items_marked: items.filter((i) => i.status !== "pending").length,
    items_missing: items.filter(
      (i) => i.status === "missing" || i.status === "partial"
    ).length,
    items,
  }
}

export const emptyTaskCounts = (): Record<AssemblyTaskStatus, number> =>
  ASSEMBLY_TASK_STATUSES.reduce(
    (acc, status) => ({ ...acc, [status]: 0 }),
    {} as Record<AssemblyTaskStatus, number>
  )

export type AssemblyTaskCounts = {
  total: number
  by_status: Record<AssemblyTaskStatus, number>
}

// Счётчики чипов очереди: сколько заданий в каждом статусе при текущем
// фильтре (без самого статуса). Считаем запросом на статус — страница выборки
// ограничена пагинацией, а чипу нужен полный счёт (идиома disputes/rows.ts).
export async function countAssemblyTasks(
  listAndCount: (filters: Record<string, unknown>) => Promise<[unknown[], number]>,
  baseFilters: Record<string, unknown>
): Promise<AssemblyTaskCounts> {
  const [[, total], ...perStatus] = await Promise.all([
    listAndCount(baseFilters),
    ...ASSEMBLY_TASK_STATUSES.map((status) =>
      listAndCount({ ...baseFilters, status })
    ),
  ])

  const by_status = emptyTaskCounts()
  ASSEMBLY_TASK_STATUSES.forEach((status, index) => {
    by_status[status] = perStatus[index][1]
  })

  return { total, by_status }
}

// Заказы заданий одной выборкой: номер (#24) и имя покупателя для строки.
export const loadOrderRefs = async (
  query: Omit<RemoteQueryFunction, symbol>,
  orderIds: string[]
): Promise<Map<string, OrderRef>> => {
  const refs = new Map<string, OrderRef>()
  if (!orderIds.length) {
    return refs
  }

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "shipping_address.first_name",
      "shipping_address.last_name",
    ],
    filters: { id: orderIds },
  })

  for (const order of orders as {
    id: string
    display_id?: number | null
    email?: string | null
    shipping_address?: {
      first_name?: string | null
      last_name?: string | null
    } | null
  }[]) {
    const name = [
      order.shipping_address?.first_name,
      order.shipping_address?.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim()
    refs.set(order.id, {
      id: order.id,
      display_id: order.display_id ?? null,
      email: order.email ?? null,
      customer_name: name || null,
    })
  }
  return refs
}
