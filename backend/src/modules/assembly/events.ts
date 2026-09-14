// События модуля сборки (namespace assembly.*). Своих order.* не эмитим —
// ядро и order-lifecycle уже шлют свои (идиома order-lifecycle/events.ts).

// Заказ распался на задания сборки (сразу после оплаты).
export const ASSEMBLY_TASKS_CREATED_EVENT = "assembly.tasks_created"
export type AssemblyTasksCreatedPayload = {
  order_id: string
  task_ids: string[]
  categories: string[]
}

// Сборщик закрыл задание с нехваткой — флаг отвечающему за отгрузку
// (требование владельца: нехватка не блокирует заказ молча).
export const ASSEMBLY_SHORTAGE_EVENT = "assembly.shortage_reported"
export type AssemblyShortagePayload = {
  order_id: string
  task_id: string
  category_handle: string
  category_name: string
}

// Сборка заказа окончена: по всем заданиям сборщики отработали.
// is_assembled=false — часть позиций не набралась (нехватка).
export const ASSEMBLY_ORDER_FINISHED_EVENT = "assembly.order_finished"
export type AssemblyOrderFinishedPayload = {
  order_id: string
  is_assembled: boolean
  has_shortage: boolean
}
