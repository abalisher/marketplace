// Данные строки экрана «Претензии» панели продавца и счётчики по статусам для
// чипов-фильтров. Отдельный файл от роута: роут остаётся тонким, вся выборка,
// счёт и сроки — здесь (идиома order-lifecycles/rows.ts).
//
// Клиент админки тонкий: номер заказа, имя покупателя, сумму заказа, возраст
// обращения и признак просрочки считает бэкенд. До T4.11 в строке очереди был
// только внутренний id заказа — Асель (Ф-прогон 2026-08-18) не могла ни понять,
// чей это заказ, ни найти его поиском: «панель показывает код, который сама же
// не находит».

import {
  IOrderModuleService,
  RemoteQueryFunction,
} from "@medusajs/framework/types"
import {
  DISPUTE_STATUSES,
  DisputeStatus,
} from "../../../modules/reviews/models/constants"
import {
  AdminOrderLifecycleRowOrder,
  loadRowOrders,
} from "../order-lifecycles/rows"
import { serializeDisputeForAdmin } from "../../utils/serialize-review"

type Query = Omit<RemoteQueryFunction, symbol>

// Активные (незакрытые) претензии: их разбирает оператор, они же — дефолт
// очереди и содержимое плитки дашборда.
export const ACTIVE_DISPUTE_STATUSES: DisputeStatus[] = ["open", "in_review"]

// Срок ответа по претензии в часах. Активная претензия старше срока —
// просрочена (в очереди подсвечивается, на дашборде считается отдельно):
// «сколько висит третий день» Асель не видела вовсе. Порог держим на бэкенде,
// как порог низкого остатка дашборда (клиент правил не считает).
const DEFAULT_DISPUTE_SLA_HOURS = 24

export function disputeSlaHours(): number {
  const raw = Number(process.env.DISPUTE_SLA_HOURS)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_DISPUTE_SLA_HOURS
}

// Строка очереди претензий: сама претензия + заказ, по которому она открыта, +
// возраст и просрочка. Технических id, кроме id претензии и заказа (нужны для
// открытия карточки), на экране нет.
export type AdminDisputeRow = ReturnType<typeof serializeDisputeForAdmin> & {
  order: AdminOrderLifecycleRowOrder | null
  age_hours: number
  overdue: boolean
}

export type AdminDisputeCounts = {
  total: number
  by_status: Record<DisputeStatus, number>
  overdue: number
}

type DisputeLike = {
  id: string
  order_id: string
  customer_id: string
  category: string
  description: string
  status: string
  resolution: string | null
  outcome?: string | null
  source?: string | null
  created_at?: Date | string | null
}

// Возраст обращения в часах от момента открытия. Без даты (битая строка) — 0:
// выдуманный возраст хуже нулевого, а просрочку по нему считать нельзя.
export function ageHours(
  createdAt: Date | string | null | undefined,
  now: number
): number {
  if (!createdAt) {
    return 0
  }
  const opened = new Date(createdAt).getTime()
  if (!Number.isFinite(opened)) {
    return 0
  }
  return Math.max(0, Math.floor((now - opened) / 3_600_000))
}

// Просрочена только НЕЗАКРЫТАЯ претензия: у решённой и отклонённой срок ответа
// уже неважен, красная метка на них читалась бы как «ещё надо ответить».
export function isOverdue(
  status: string,
  age: number,
  slaHours: number
): boolean {
  return (
    (ACTIVE_DISPUTE_STATUSES as string[]).includes(status) && age >= slaHours
  )
}

// Обогащение страницы очереди: к каждой претензии — заказ (номер, покупатель,
// сумма, адрес) одним запросом на страницу, возраст и просрочка.
export async function loadDisputeRows(
  query: Query,
  orderService: IOrderModuleService,
  disputes: DisputeLike[],
  now: number = Date.now()
): Promise<AdminDisputeRow[]> {
  const slaHours = disputeSlaHours()
  const orders = await loadRowOrders(
    query,
    orderService,
    [...new Set(disputes.map((dispute) => dispute.order_id))]
  )

  return disputes.map((dispute) => {
    const age = ageHours(dispute.created_at, now)
    return {
      ...serializeDisputeForAdmin(dispute),
      order: orders.get(dispute.order_id) ?? null,
      age_hours: age,
      overdue: isOverdue(dispute.status, age, slaHours),
    }
  })
}

// Счётчики для чипов-фильтров: сколько претензий в каждом статусе при текущем
// поиске — и сколько активных просрочено. Считаем по одному запросу на статус
// (идиома счётчиков очереди заказов и сводки дашборда): нужен точный count, а не
// пересчёт усечённой страницы.
export async function countDisputes(
  listAndCount: (
    filters: Record<string, unknown>
  ) => Promise<[{ created_at?: Date | string | null }[], number]>,
  baseFilters: Record<string, unknown>,
  now: number = Date.now()
): Promise<AdminDisputeCounts> {
  const slaHours = disputeSlaHours()

  const [[, total], ...perStatus] = await Promise.all([
    listAndCount(baseFilters),
    ...DISPUTE_STATUSES.map((status) =>
      listAndCount({ ...baseFilters, status })
    ),
  ])

  const by_status = {} as Record<DisputeStatus, number>
  DISPUTE_STATUSES.forEach((status, index) => {
    by_status[status] = perStatus[index][1]
  })

  // Просрочку считаем по датам активных претензий: порог живёт в часах, а
  // фильтра «старше N часов» в отрыве от «сейчас» у списка нет.
  const [active] = await listAndCount({
    ...baseFilters,
    status: ACTIVE_DISPUTE_STATUSES,
  })
  const overdue = active.filter(
    (dispute) => ageHours(dispute.created_at, now) >= slaHours
  ).length

  return { total, by_status, overdue }
}
