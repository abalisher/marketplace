// Задания сборки для экрана сборщика (GET /admin/assembly-tasks и действия
// над заданием). Типы — форма ответа api/admin/assembly-tasks/rows.ts.

export type AssemblyTaskStatus = "pending" | "picking" | "assembled" | "shortage"
export type AssemblyItemStatus = "pending" | "picked" | "partial" | "missing"

export type AssemblyTaskItem = {
  id: string
  title: string
  sku: string | null
  quantity: number
  picked_quantity: number
  status: AssemblyItemStatus
}

export type AssemblyTask = {
  id: string
  order_id: string
  order_display_id: number | null
  // Номер для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  order_number?: string | null
  customer_name: string | null
  category_name: string
  status: AssemblyTaskStatus
  created_at: string | null
  items_total: number
  items_marked: number
  items: AssemblyTaskItem[]
}

export type AdminAssemblyTasksResponse = {
  assembly_tasks: AssemblyTask[]
  counts: { total: number; by_status: Record<AssemblyTaskStatus, number> }
  count: number
}

export type AssemblyChip = {
  key: string
  label: string
  statuses: AssemblyTaskStatus[] | null
}

// Чипы очереди: в работе — то, что ещё надо собрать; собранные остаются
// видны, пока заказ не отгружен.
export const ASSEMBLY_CHIPS: AssemblyChip[] = [
  { key: "active", label: "picker.chip.active", statuses: ["pending", "picking"] },
  { key: "done", label: "picker.chip.done", statuses: ["assembled", "shortage"] },
  { key: "all", label: "picker.chip.all", statuses: null },
]

export const assemblyChipCount = (
  counts: AdminAssemblyTasksResponse["counts"],
  chip: AssemblyChip
) =>
  chip.statuses
    ? chip.statuses.reduce((sum, status) => sum + (counts.by_status[status] ?? 0), 0)
    : counts.total

export const TASK_STATUS_META: Record<
  AssemblyTaskStatus,
  { label: string; color: "grey" | "orange" | "green" | "red" }
> = {
  pending: { label: "picker.status.pending", color: "grey" },
  picking: { label: "picker.status.picking", color: "orange" },
  assembled: { label: "picker.status.assembled", color: "green" },
  shortage: { label: "picker.status.shortage", color: "red" },
}

// Отметка позиции: набрано всё → picked, часть → partial, ничего → missing.
export const itemMark = (
  item: AssemblyTaskItem,
  picked: number
): { status: AssemblyItemStatus; picked_quantity: number } => {
  const quantity = Math.max(0, Math.min(item.quantity, Math.floor(picked)))
  if (quantity >= item.quantity) {
    return { status: "picked", picked_quantity: item.quantity }
  }
  return quantity > 0
    ? { status: "partial", picked_quantity: quantity }
    : { status: "missing", picked_quantity: 0 }
}
