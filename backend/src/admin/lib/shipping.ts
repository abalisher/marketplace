import {
  AdminOrderLifecycleRowOrder,
  OrderLifecycleStatus,
} from "./order"

// DTO очереди отгрузки (GET /admin/shipping-queue — T10.13) и метаданные её
// стадий и статусов заданий. Значения продублированы из модулей намеренно:
// код бэкенда нельзя импортировать в браузерный бандл админки.

// Статус задания сборки одной категории.
export type AssemblyTaskStatus =
  | "pending"
  | "picking"
  | "assembled"
  | "shortage"

// Стадия заказа в очереди: собирается → готов к отгрузке → нехватка. Считает
// бэкенд по заданиям — статус самого заказа догоняет сборку только при
// закрытии последнего задания и стадией служить не может.
export type ShippingStage = "assembling" | "ready" | "shortage"

// Плитка категории: светофор по одной категории заказа. Позиций в плитке нет —
// список товаров живёт в карточке заказа.
export type ShippingCategoryTile = {
  id: string
  order_id: string
  category_handle: string
  category_name: string
  status: AssemblyTaskStatus
  assignee_id: string | null
  assignee_name: string | null
  completed_by: string | null
  completed_by_name: string | null
  started_at: string | null
  completed_at: string | null
  note: string | null
  created_at: string | null
  items_total: number
  items_marked: number
  items_missing: number
}

export type OrderAssemblySummary = {
  tasks_total: number
  tasks_finished: number
  tasks_assembled: number
  tasks_shortage: number
  is_finished: boolean
  is_assembled: boolean
  has_shortage: boolean
}

// Цель перехода «передать водителю»: экран возвращает её обратно как есть,
// технических id не показывает.
export type ShipTarget = {
  fulfillment_id: string
  items: { id: string; quantity: number }[]
}

export type ShippingQueueOrder = {
  order_id: string
  order: AdminOrderLifecycleRowOrder | null
  order_status: OrderLifecycleStatus
  stage: ShippingStage
  summary: OrderAssemblySummary
  categories: ShippingCategoryTile[]
  can_ship: boolean
  ship_target: ShipTarget | null
}

export type ShippingQueueCounts = {
  total: number
  by_stage: Record<ShippingStage, number>
}

export type AdminShippingQueueResponse = {
  shipping_orders: ShippingQueueOrder[]
  counts: ShippingQueueCounts
  count: number
  offset: number
  limit: number
  scan_cap: number
}

// Статус задания в плитке: точка + подпись (идиома StatusCell ядра).
export const ASSEMBLY_TASK_STATUS_META: Record<
  AssemblyTaskStatus,
  { label: string; dotClass: string }
> = {
  pending: {
    label: "shipping.taskStatus.pending",
    dotClass: "bg-ui-tag-neutral-icon",
  },
  picking: {
    label: "shipping.taskStatus.picking",
    dotClass: "bg-ui-tag-orange-icon",
  },
  assembled: {
    label: "shipping.taskStatus.assembled",
    dotClass: "bg-ui-tag-green-icon",
  },
  shortage: {
    label: "shipping.taskStatus.shortage",
    dotClass: "bg-ui-tag-red-icon",
  },
}

// Стадия заказа: цвет бейджа в шапке строки и подпись.
export const SHIPPING_STAGE_META: Record<
  ShippingStage,
  { label: string; color: "orange" | "green" | "red" }
> = {
  assembling: { label: "shipping.stage.assembling", color: "orange" },
  ready: { label: "shipping.stage.ready", color: "green" },
  shortage: { label: "shipping.stage.shortage", color: "red" },
}

// Чипы-фильтры очереди. «Все» — отсутствие фильтра стадии; остальные повторяют
// стадии в порядке движения заказа к машине.
export type ShippingChip = {
  key: string
  label: string
  stage: ShippingStage | null
}

export const SHIPPING_QUEUE_CHIPS: ShippingChip[] = [
  { key: "all", label: "shipping.chip.all", stage: null },
  { key: "assembling", label: "shipping.chip.assembling", stage: "assembling" },
  { key: "ready", label: "shipping.chip.ready", stage: "ready" },
  { key: "shortage", label: "shipping.chip.shortage", stage: "shortage" },
]

export const shippingChipCount = (
  counts: ShippingQueueCounts | undefined,
  chip: ShippingChip
): number => {
  if (!counts) {
    return 0
  }
  return chip.stage ? counts.by_stage[chip.stage] : counts.total
}
