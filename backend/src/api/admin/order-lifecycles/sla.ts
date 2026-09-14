// Сроки обработки заказа по стадиям и время строки в текущем статусе.
//
// ЗАЧЕМ. В очереди не было ни даты заказа, ни времени в статусе: три заказа
// шестой день висели «В доставке», два — в «Собран», и увидеть это в панели
// было нельзя (Ф-прогон панели 2026-08-18, блокер Тимура). Управляющий читает
// очередь как «что стоит дольше нормы», а не «что оформили раньше» — поэтому
// строка несёт время в статусе и признак просрочки, а не только дату.
//
// Порог — на бэкенде, как срок ответа по претензии (disputes/rows.ts) и порог
// низкого остатка (dashboard/constants.ts): клиент панели бизнес-правил не
// считает (CLAUDE.md).

import { RemoteQueryFunction } from "@medusajs/framework/types"
import {
  ORDER_STATUSES,
  OrderStatusValue,
} from "../../../modules/order-lifecycle/models/statuses"

// Сколько заказ имеет право стоять в статусе, часов. `null` — срока нет:
// доставленный, закрытый, отменённый и возвращённый заказ уже никого не ждёт,
// красная метка на них читалась бы как «надо что-то сделать».
//
// Значения — рабочая норма склада: подтвердить в течение двух часов, начать
// сборку в тот же полурабочий день, собрать за смену, отгрузить за смену после
// сборки, довезти за сутки. Правятся env'ом без пересборки (ORDER_SLA_HOURS).
export const DEFAULT_ORDER_SLA_HOURS: Record<OrderStatusValue, number | null> = {
  new: 2,
  confirmed: 4,
  assembling: 8,
  partially_assembled: 8,
  assembled: 12,
  in_delivery: 24,
  delivered: null,
  closed: null,
  canceled: null,
  returned: null,
}

// Разбор переопределения из env: «new=1,assembled=6». Неизвестный статус и
// нечисловое значение молча игнорируются — опечатка в env не должна валить
// очередь заказов; `0` и отрицательное значение читаются как «срока нет»
// (иначе «0 ч» пометило бы просроченным каждый новый заказ).
export function parseSlaOverrides(
  raw: string | undefined
): Partial<Record<OrderStatusValue, number | null>> {
  const overrides: Partial<Record<OrderStatusValue, number | null>> = {}
  if (!raw?.trim()) {
    return overrides
  }

  for (const pair of raw.split(",")) {
    const [key, value] = pair.split("=").map((part) => part?.trim())
    if (!key || !(ORDER_STATUSES as readonly string[]).includes(key)) {
      continue
    }
    const hours = Number(value)
    if (!Number.isFinite(hours)) {
      continue
    }
    overrides[key as OrderStatusValue] = hours > 0 ? hours : null
  }
  return overrides
}

export function orderSlaHours(): Record<OrderStatusValue, number | null> {
  return {
    ...DEFAULT_ORDER_SLA_HOURS,
    ...parseSlaOverrides(process.env.ORDER_SLA_HOURS),
  }
}

// Время строки очереди в часах: возраст заказа (от оформления) и время в
// текущем статусе (от последнего перехода). Просрочка считается по статусу: у
// статуса без срока её нет.
export type OrderQueueTiming = {
  age_hours: number
  status_hours: number
  sla_hours: number | null
  overdue: boolean
}

// Часы между моментом и «сейчас». Без даты (битая строка) — 0: выдуманный
// возраст хуже нулевого (идиома ageHours очереди претензий).
function hoursSince(
  value: string | Date | null | undefined,
  now: number
): number {
  if (!value) {
    return 0
  }
  const at = new Date(value).getTime()
  if (!Number.isFinite(at)) {
    return 0
  }
  return Math.max(0, Math.floor((now - at) / 3_600_000))
}

export function orderQueueTiming(
  lifecycle: {
    status: OrderStatusValue
    created_at?: string | Date | null
    updated_at?: string | Date | null
  },
  sla: Record<OrderStatusValue, number | null>,
  now: number = Date.now()
): OrderQueueTiming {
  // Время в статусе — от updated_at жизненного цикла: запись меняется ТОЛЬКО
  // переходом (status/previous_status/note), других правок у неё нет. Заказ без
  // ни одного перехода стоит в «Новом» со момента оформления — тогда
  // updated_at равен created_at, и время в статусе совпадает с возрастом.
  const age = hoursSince(lifecycle.created_at, now)
  const inStatus = hoursSince(lifecycle.updated_at ?? lifecycle.created_at, now)
  const slaHours = sla[lifecycle.status] ?? null

  return {
    age_hours: age,
    status_hours: inStatus,
    sla_hours: slaHours,
    overdue: slaHours !== null && inStatus >= slaHours,
  }
}

// Сколько заказов вышли за срок своей стадии при текущих фильтрах очереди.
//
// Просрочку нельзя спросить у БД условием: срок зависит от статуса, а время в
// статусе — от updated_at, поэтому читаем открытые статусы и считаем в памяти.
// Выборка дешёвая (четыре поля на строку) и ограничена потолком: у одного
// магазина открытых заказов десятки.
//
// Считаем ТОЛЬКО открытые статусы: у доставленного и закрытого срока нет, и
// подмешивать их в счётчик значило бы пугать оператора числом, по которому
// делать нечего.
const OVERDUE_SCAN_CAP = 1000

// Статусы со сроком выводим из самой карты сроков, а не вторым списком: иначе
// правка ORDER_SLA_HOURS и правка списка разъезжаются.
export function waitingStatuses(
  sla: Record<OrderStatusValue, number | null>
): OrderStatusValue[] {
  return ORDER_STATUSES.filter((status) => sla[status] !== null)
}

export async function countOverdueOrders(
  query: Omit<RemoteQueryFunction, symbol>,
  baseFilters: Record<string, unknown> = {},
  now: number = Date.now()
): Promise<number> {
  const sla = orderSlaHours()
  const { data } = await query.graph({
    entity: "order_lifecycle",
    fields: ["id", "status", "created_at", "updated_at"],
    filters: { ...baseFilters, status: waitingStatuses(sla) },
    pagination: { skip: 0, take: OVERDUE_SCAN_CAP },
  })

  return (
    data as {
      status: OrderStatusValue
      created_at?: string | null
      updated_at?: string | null
    }[]
  ).filter((lifecycle) => orderQueueTiming(lifecycle, sla, now).overdue).length
}
