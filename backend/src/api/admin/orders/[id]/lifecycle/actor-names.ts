// Имя человека в логе переходов заказа: «Данияр Сеитов», а не роль
// «администратор» и не `usr_01H…`.
//
// ЗАЧЕМ. В истории переходов автором стояла РОЛЬ («администратор»), хотя в
// логе лежит и actor_id: управляющий не мог сказать, кто именно перевёл заказ,
// а лог статусов по ТЗ ведётся именно ради «кто, когда, из какого в какой»
// (Ф-прогон панели 2026-08-18, блокер Тимура). Роль остаётся подписью рядом —
// имя отвечает на «кто», роль на «в каком качестве».
//
// Актор системы (джобы) имени не имеет — у него actor_id пустой, и роль
// «система» остаётся единственной подписью.

import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { loadUserNames } from "../../../user-names"
import { DRIVER_MODULE } from "../../../../../modules/driver"
import DriverModuleService from "../../../../../modules/driver/service"

type ActorRef = { actor_type: string; actor_id: string | null }

// Сотрудники платформы живут в модуле user, покупатель — в customer, водитель —
// в своём модуле driver (он не сотрудник продавца, T5.1): id из лога сам не
// говорит, где искать, поэтому разбираем по типу актора.
const STAFF_ACTOR_TYPES = ["seller", "admin"]

// Имя покупателя: ФИО → телефон → почта. Телефон раньше почты намеренно —
// после разворота на физлиц вход идёт по номеру (T10.7), и у части покупателей
// почты нет вовсе.
const customerLabel = (customer: {
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  email?: string | null
}): string | null => {
  const person = [customer.first_name, customer.last_name]
    .filter((part) => !!part?.trim())
    .join(" ")
    .trim()
  return person || customer.phone?.trim() || customer.email?.trim() || null
}

export async function loadTransitionActorNames(
  scope: MedusaContainer,
  events: ActorRef[]
): Promise<Map<string, string>> {
  const staffIds = new Set<string>()
  const customerIds = new Set<string>()
  const driverIds = new Set<string>()
  for (const event of events) {
    if (!event.actor_id) {
      continue
    }
    if (STAFF_ACTOR_TYPES.includes(event.actor_type)) {
      staffIds.add(event.actor_id)
    } else if (event.actor_type === "buyer") {
      customerIds.add(event.actor_id)
    } else if (event.actor_type === "driver") {
      driverIds.add(event.actor_id)
    }
  }

  const names = new Map<string, string>()
  if (!staffIds.size && !customerIds.size && !driverIds.size) {
    return names
  }

  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const driverService = scope.resolve<DriverModuleService>(DRIVER_MODULE)
  const [staff, customers, drivers] = await Promise.all([
    staffIds.size
      ? loadUserNames(scope.resolve(Modules.USER), [...staffIds])
      : Promise.resolve(new Map<string, string>()),
    customerIds.size
      ? query.graph({
          entity: "customer",
          fields: ["id", "first_name", "last_name", "phone", "email"],
          filters: { id: [...customerIds] },
        })
      : Promise.resolve({ data: [] }),
    // Водитель заполняет ФИО сам, но допущенным он без ФИО не бывает
    // (assertDriverActivation) — телефон остаётся страховкой на случай заявок,
    // допущенных до этого правила.
    driverIds.size
      ? driverService.listDrivers({ id: [...driverIds] })
      : Promise.resolve([]),
  ])

  for (const [id, name] of staff) {
    names.set(id, name)
  }
  for (const customer of customers.data as {
    id: string
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    email?: string | null
  }[]) {
    const label = customerLabel(customer)
    if (label) {
      names.set(customer.id, label)
    }
  }
  for (const driver of drivers as {
    id: string
    full_name?: string | null
    phone?: string | null
  }[]) {
    const label = driver.full_name?.trim() || driver.phone?.trim() || null
    if (label) {
      names.set(driver.id, label)
    }
  }

  return names
}

// В каком качестве сотрудник перевёл заказ. В логе у всех действий из панели
// actor_type = admin, а у закрытия сборки — seller: тип записывает роут, а не
// человек. Подпись берём по учётке: сборщик (роль picker), продавец (seller),
// иначе — администратор площадки.
export type StaffRole = "picker" | "seller" | "driver" | "admin"

export async function loadStaffRoles(
  scope: MedusaContainer,
  events: ActorRef[]
): Promise<Map<string, StaffRole>> {
  const ids = [
    ...new Set(
      events
        .filter((event) => event.actor_id && STAFF_ACTOR_TYPES.includes(event.actor_type))
        .map((event) => event.actor_id as string)
    ),
  ]
  const roles = new Map<string, StaffRole>()
  if (!ids.length) {
    return roles
  }
  const users = await scope
    .resolve(Modules.USER)
    .listUsers({ id: ids }, { select: ["id", "metadata"] })
  for (const user of users) {
    const role = (user.metadata as Record<string, unknown> | null)?.role
    roles.set(
      user.id,
      role === "picker" || role === "seller" || role === "driver" ? role : "admin"
    )
  }
  return roles
}
