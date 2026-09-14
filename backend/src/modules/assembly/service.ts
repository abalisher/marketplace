import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import AssemblyTask from "./models/assembly-task"
import AssemblyTaskItem from "./models/assembly-task-item"
import {
  ASSEMBLY_TASK_FINAL_STATUSES,
  AssemblyItemStatus,
  AssemblyTaskStatus,
} from "./models/constants"
import { AssemblyTaskDraft } from "./split"

// Стейт-машина задания сборки. «Нехватка» — рабочее состояние, а не тупик:
// довезли позицию → сборщик возвращается в «собирается» и закрывает задание
// как собранное. «Собрано» — терминально.
export const ASSEMBLY_TASK_TRANSITIONS: Record<
  AssemblyTaskStatus,
  AssemblyTaskStatus[]
> = {
  pending: ["picking"],
  picking: ["assembled", "shortage"],
  shortage: ["picking"],
  assembled: [],
}

// Инвариант стейт-машины задания — чистая функция (тестируется без БД).
export function assertAssemblyTaskTransition(
  from: AssemblyTaskStatus,
  to: AssemblyTaskStatus
) {
  if (!(ASSEMBLY_TASK_TRANSITIONS[from] ?? []).includes(to)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Assembly task transition ${from} to ${to} is not allowed`
    )
  }
}

// Отметка по позиции: приводим количество к статусу и наоборот, чтобы клиент
// не мог прислать «набрано целиком, 0 шт». Чистая функция — вся арифметика
// отметки проверяется юнитом.
export function resolveItemMark(input: {
  status: AssemblyItemStatus
  quantity: number
  picked_quantity?: number | null
}): { status: AssemblyItemStatus; picked_quantity: number } {
  if (input.status === "pending") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Assembly item cannot be marked back to pending"
    )
  }
  if (input.status === "picked") {
    return { status: "picked", picked_quantity: input.quantity }
  }
  if (input.status === "missing") {
    return { status: "missing", picked_quantity: 0 }
  }

  const picked = Number(input.picked_quantity ?? 0)
  if (!Number.isFinite(picked) || picked <= 0 || picked >= input.quantity) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Partial pick must be between 1 and ${input.quantity - 1}, got ${picked}`
    )
  }
  return { status: "partial", picked_quantity: picked }
}

type ItemMarkView = { status: AssemblyItemStatus }

// Итог задания по отметкам позиций: всё набрано целиком — «собрано», иначе
// «нехватка» (частично набранная позиция — тоже нехватка).
export function deriveTaskCompletion(
  items: ItemMarkView[]
): AssemblyTaskStatus {
  return items.every((i) => i.status === "picked") ? "assembled" : "shortage"
}

// Задание нельзя закрыть, пока по каждой позиции нет отметки: «молча
// пропущено» и «в наличии нет» на экране отгрузки выглядели бы одинаково,
// а решения требуют разных.
export function assertAllItemsMarked(items: ItemMarkView[]) {
  if (!items.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Assembly task has no items"
    )
  }
  const unmarked = items.filter((i) => i.status === "pending").length
  if (unmarked > 0) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Assembly task has ${unmarked} unmarked item(s)`
    )
  }
}

export type AssemblyTaskView = {
  id?: string
  category_handle?: string
  status: AssemblyTaskStatus
  items?: { order_item_id: string; picked_quantity: number }[]
}

export type OrderAssemblySummary = {
  tasks_total: number
  tasks_finished: number
  tasks_assembled: number
  tasks_shortage: number
  // Сборка окончена: по каждому заданию сборщик отработал (собрано или
  // зафиксирована нехватка) — заказ можно передавать отгрузке.
  is_finished: boolean
  // Заказ СОБРАН — собраны ВСЕ задания, нехватки нет.
  is_assembled: boolean
  // Нехватка хотя бы в одном задании — флаг отвечающему за отгрузку.
  has_shortage: boolean
}

// Агрегат по заказу — чистая функция над списком его заданий.
export function summarizeOrderAssembly(
  tasks: AssemblyTaskView[]
): OrderAssemblySummary {
  const finished = tasks.filter((t) =>
    ASSEMBLY_TASK_FINAL_STATUSES.includes(t.status)
  )
  const shortage = tasks.filter((t) => t.status === "shortage")
  return {
    tasks_total: tasks.length,
    tasks_finished: finished.length,
    tasks_assembled: tasks.filter((t) => t.status === "assembled").length,
    tasks_shortage: shortage.length,
    is_finished: tasks.length > 0 && finished.length === tasks.length,
    is_assembled: tasks.length > 0 && shortage.length === 0 &&
      finished.length === tasks.length,
    has_shortage: shortage.length > 0,
  }
}

// Позиции для ядрового fulfillment: то, что реально набрано (нехватка и
// «нет в наличии» в отгрузку не едут). Количества по одной строке заказа
// суммируются — строка живёт ровно в одном задании, но защита дешёвая.
export function fulfillmentLinesFromTasks(
  tasks: AssemblyTaskView[]
): { id: string; quantity: number }[] {
  const byItem = new Map<string, number>()
  for (const task of tasks) {
    for (const item of task.items ?? []) {
      const picked = Number(item.picked_quantity ?? 0)
      if (picked > 0) {
        byItem.set(
          item.order_item_id,
          (byItem.get(item.order_item_id) ?? 0) + picked
        )
      }
    }
  }
  return [...byItem.entries()].map(([id, quantity]) => ({ id, quantity }))
}

// Сервис домена «сборка заказа». CRUD генерирует MedusaService; здесь —
// сценарные операции над локальными моделями (распад, взятие задания, отметка
// позиции, закрытие). Вызов ЯДРОВЫХ workflow (fulfillment) и переходы
// жизненного цикла заказа остаются в src/workflows/ — правило изоляции модулей.
class AssemblyModuleService extends MedusaService({
  AssemblyTask,
  AssemblyTaskItem,
}) {
  // Распад заказа на задания. Идемпотентно: если задания по заказу уже есть
  // (повторная доставка события order.placed / ретрай), возвращаем их.
  async createOrderTasks(order_id: string, drafts: AssemblyTaskDraft[]) {
    const existing = await this.listAssemblyTasks({ order_id })
    if (existing.length) {
      return existing
    }

    const created: Awaited<ReturnType<typeof this.retrieveAssemblyTask>>[] = []
    for (const draft of drafts) {
      const task = await this.createAssemblyTasks({
        order_id,
        category_handle: draft.category_handle,
        category_name: draft.category_name,
      })
      await this.createAssemblyTaskItems(
        draft.items.map((item) => ({ ...item, task: task.id }))
      )
      created.push(task)
    }
    return created
  }

  // Задания заказа вместе с позициями — база и для экрана отгрузки, и для
  // агрегата статуса.
  async listOrderTasks(order_id: string) {
    return this.listAssemblyTasks(
      { order_id },
      { relations: ["items"], order: { created_at: "ASC" } }
    )
  }

  // Сборщик взял задание: pending → picking.
  async startTask(input: { task_id: string; actor_id?: string | null }) {
    const task = await this.retrieveAssemblyTask(input.task_id)
    assertAssemblyTaskTransition(task.status as AssemblyTaskStatus, "picking")
    return this.updateAssemblyTasks({
      id: task.id,
      status: "picking",
      assignee_id: input.actor_id ?? task.assignee_id ?? null,
      started_at: task.started_at ?? new Date(),
      // Повторный заход после нехватки: прошлое закрытие больше не актуально.
      completed_at: null,
      completed_by: null,
    })
  }

  // Отметка по одной позиции задания. Отмечать можно только у задания в
  // работе — иначе отметка появилась бы у задания, которое никто не брал.
  async markItem(input: {
    task_id: string
    item_id: string
    status: AssemblyItemStatus
    picked_quantity?: number | null
    actor_id?: string | null
    note?: string | null
  }) {
    const task = await this.retrieveAssemblyTask(input.task_id, {
      relations: ["items"],
    })
    if (task.status !== "picking") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Assembly task ${task.id} is not in progress (status ${task.status})`
      )
    }
    const item = (task.items ?? []).find((i) => i.id === input.item_id)
    if (!item) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Assembly item ${input.item_id} does not belong to task ${task.id}`
      )
    }

    const mark = resolveItemMark({
      status: input.status,
      quantity: Number(item.quantity),
      picked_quantity: input.picked_quantity,
    })

    return this.updateAssemblyTaskItems({
      id: item.id,
      status: mark.status,
      picked_quantity: mark.picked_quantity,
      marked_at: new Date(),
      marked_by: input.actor_id ?? null,
      note: input.note ?? item.note ?? null,
    })
  }

  // Сборщик закрыл задание: статус выводится из отметок позиций (собрано /
  // нехватка), время и автор фиксируются.
  async completeTask(input: {
    task_id: string
    actor_id?: string | null
    note?: string | null
  }) {
    const task = await this.retrieveAssemblyTask(input.task_id, {
      relations: ["items"],
    })
    const items = (task.items ?? []).map((i) => ({
      status: i.status as AssemblyItemStatus,
    }))
    assertAllItemsMarked(items)

    const to = deriveTaskCompletion(items)
    assertAssemblyTaskTransition(task.status as AssemblyTaskStatus, to)

    return this.updateAssemblyTasks({
      id: task.id,
      status: to,
      completed_at: new Date(),
      completed_by: input.actor_id ?? null,
      note: input.note ?? task.note ?? null,
    })
  }
}

export default AssemblyModuleService
