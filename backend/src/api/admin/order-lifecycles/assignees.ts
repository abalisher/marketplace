// Ответственный за заказ в строке очереди: у кого заказ на руках прямо сейчас.
//
// ЗАЧЕМ. В очереди не было ответственного (Ф-прогон панели 2026-08-18, блокер
// Тимура): управляющий видел, что заказ стоит, но не видел, с кого спросить, и
// шёл выяснять голосом. Правило простое и совпадает с тем, как работает склад:
// на стадиях сборки заказ держат сборщики, взявшие задания своих категорий; в
// остальных статусах — тот сотрудник, кто последним перевёл статус. Если из
// сотрудников заказа ещё никто не касался (оформил покупатель, перевела
// система), ответственного НЕТ — строка так и говорит, это и есть «не взят».

import { IUserModuleService } from "@medusajs/framework/types"
import AssemblyModuleService from "../../../modules/assembly/service"
import OrderLifecycleModuleService from "../../../modules/order-lifecycle/service"
import { OrderStatusValue } from "../../../modules/order-lifecycle/models/statuses"
import { loadUserNames } from "../user-names"

// Роль ответственного — чтобы строка подписывала его одним словом («сборка»,
// «оператор»), а не показывала имя без контекста.
export type OrderAssigneeRole = "picker" | "operator"

export type OrderAssignee = {
  name: string
  role: OrderAssigneeRole
}

// Стадии, на которых заказ держит сборщик, а не оператор: задание категории
// взято, и спрашивать надо с того, кто его взял.
const ASSEMBLY_STATUSES: OrderStatusValue[] = [
  "assembling",
  "partially_assembled",
]

// Сотрудники платформы. Переход покупателя (оформил, отменил) и системы
// (авто-закрытие) ответственного не назначает.
const STAFF_ACTOR_TYPES = ["seller", "admin"]

// Сколько имён показываем, когда категории заказа разобрали разные сборщики:
// два имени и «+N» — строка очереди 44 px, третье имя в неё не влезает.
const NAMES_SHOWN = 2

type QueueLifecycle = {
  lifecycle_id: string
  order_id: string
  status: OrderStatusValue
}

type RawEvent = {
  actor_type: string
  actor_id: string | null
  created_at?: string | Date | null
  order_lifecycle_id?: string | null
  order_lifecycle?: { id: string } | string | null
}

// id жизненного цикла у записи лога: сервис модуля отдаёт его колонкой
// `order_lifecycle_id`, а через graph то же поле приходит вложенным объектом —
// читаем оба вида, чтобы карта собиралась при любом пути выборки.
const eventLifecycleId = (event: RawEvent): string | null => {
  if (event.order_lifecycle_id) {
    return event.order_lifecycle_id
  }
  const link = event.order_lifecycle
  if (typeof link === "string") {
    return link
  }
  return link?.id ?? null
}

const joinNames = (names: string[]): string | null => {
  const unique = [...new Set(names)]
  if (!unique.length) {
    return null
  }
  const shown = unique.slice(0, NAMES_SHOWN).join(", ")
  const rest = unique.length - NAMES_SHOWN
  return rest > 0 ? `${shown} +${rest}` : shown
}

// Ответственные по странице очереди одной выборкой на источник: задания сборки,
// лог переходов, имена учёток. Заказы без ответственного в карту не попадают —
// строка покажет «не взят».
export async function loadOrderAssignees(
  services: {
    assembly: AssemblyModuleService
    lifecycle: OrderLifecycleModuleService
    users: IUserModuleService
  },
  lifecycles: QueueLifecycle[]
): Promise<Map<string, OrderAssignee>> {
  const result = new Map<string, OrderAssignee>()
  if (!lifecycles.length) {
    return result
  }

  const assemblyOrderIds = lifecycles
    .filter((entry) => ASSEMBLY_STATUSES.includes(entry.status))
    .map((entry) => entry.order_id)
  const lifecycleIds = lifecycles.map((entry) => entry.lifecycle_id)

  const [tasks, events] = await Promise.all([
    assemblyOrderIds.length
      ? (services.assembly.listAssemblyTasks(
          { order_id: assemblyOrderIds },
          { select: ["order_id", "assignee_id"] }
        ) as Promise<{ order_id: string; assignee_id: string | null }[]>)
      : Promise.resolve([]),
    services.lifecycle.listOrderLifecycleEvents(
      { order_lifecycle: lifecycleIds },
      { order: { created_at: "ASC" } }
    ) as Promise<RawEvent[]>,
  ])

  // Последний переход СОТРУДНИКА по каждому жизненному циклу: выборка идёт по
  // возрастанию, поэтому каждая следующая запись перекрывает предыдущую.
  const lastStaff = new Map<string, string>()
  for (const event of events) {
    if (!event.actor_id || !STAFF_ACTOR_TYPES.includes(event.actor_type)) {
      continue
    }
    const id = eventLifecycleId(event)
    if (id) {
      lastStaff.set(id, event.actor_id)
    }
  }

  const pickersByOrder = new Map<string, string[]>()
  for (const task of tasks) {
    if (!task.assignee_id) {
      continue
    }
    const list = pickersByOrder.get(task.order_id) ?? []
    list.push(task.assignee_id)
    pickersByOrder.set(task.order_id, list)
  }

  const names = await loadUserNames(services.users, [
    ...new Set([...lastStaff.values(), ...[...pickersByOrder.values()].flat()]),
  ])

  for (const entry of lifecycles) {
    const pickers = pickersByOrder.get(entry.order_id) ?? []
    const pickerLabel = joinNames(
      pickers.map((id) => names.get(id)).filter((name): name is string => !!name)
    )
    if (pickerLabel) {
      result.set(entry.order_id, { name: pickerLabel, role: "picker" })
      continue
    }

    const staffId = lastStaff.get(entry.lifecycle_id)
    const staffName = staffId ? names.get(staffId) : null
    if (staffName) {
      result.set(entry.order_id, { name: staffName, role: "operator" })
    }
  }

  return result
}
