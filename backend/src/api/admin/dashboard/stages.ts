// Отчёт по стадиям заказа со средним временем: принято → собрано → отгружено →
// доставлено.
//
// ЗАЧЕМ. Управляющий видел очередь «здесь и сейчас», но не видел, ГДЕ магазин
// тормозит: сколько заказ ждёт подтверждения, сколько лежит собранным до
// отгрузки, сколько едет. Отчёта по стадиям не было вовсе (Ф-прогон панели
// 2026-08-18, блокер Тимура), а данные для него лежали в логе переходов
// (order_lifecycle_event) с самого начала — ТЗ требует логировать переходы
// бессрочно именно ради этого.
//
// Считаем по факту переходов, а не по текущему статусу: заказ, который уже
// доставлен, всё равно рассказывает, сколько он стоял на каждой стадии.

import { RemoteQueryFunction } from "@medusajs/framework/types"
import OrderLifecycleModuleService from "../../../modules/order-lifecycle/service"
import { OrderStatusValue } from "../../../modules/order-lifecycle/models/statuses"
import { MONEY_SCAN_CAP } from "./constants"

type Query = Omit<RemoteQueryFunction, symbol>

// Окно отчёта в днях: заказы, оформленные за последние N дней. Месяц — рабочий
// горизонт управляющего («как мы работали в этом месяце»); правится env.
const DEFAULT_STAGE_REPORT_DAYS = 30

export function stageReportDays(): number {
  const raw = Number(process.env.DASHBOARD_STAGE_REPORT_DAYS)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_STAGE_REPORT_DAYS
}

// Ключи стадий отчёта. Подписи — на клиенте (i18n панели), здесь только
// правила: от какого момента до какого считается стадия.
export const ORDER_STAGE_KEYS = [
  "accepted",
  "assembled",
  "shipped",
  "delivered",
] as const
export type OrderStageKey = (typeof ORDER_STAGE_KEYS)[number]

// Чем стадия заканчивается. Начало каждой следующей — конец предыдущей, а
// начало первой — момент оформления заказа (создание жизненного цикла).
// «Собран» закрывается и частичной сборкой: для отгрузки важен факт, что
// сборка закончена, а нехватка позиций — отдельная история (assembly-shortage).
const STAGE_END_STATUSES: Record<OrderStageKey, OrderStatusValue[]> = {
  accepted: ["confirmed"],
  assembled: ["assembled", "partially_assembled"],
  shipped: ["in_delivery"],
  delivered: ["delivered"],
}

export type OrderStageReportRow = {
  key: OrderStageKey
  // Сколько заказов окна прошли стадию до конца — на них и считается среднее.
  orders: number
  // Среднее и худшее время стадии в минутах. null — стадию в окне не прошёл ни
  // один заказ (нечего усреднять; «0» читалось бы как «мгновенно»).
  avg_minutes: number | null
  max_minutes: number | null
}

export type OrderStageReport = {
  window_days: number
  // Заказов в окне — знаменатель, по которому читаются числа стадий.
  orders_total: number
  stages: OrderStageReportRow[]
}

type StageEvent = {
  to_status: string
  created_at?: string | Date | null
  order_lifecycle_id?: string | null
  order_lifecycle?: { id: string } | string | null
}

// id жизненного цикла у записи лога: сервис модуля отдаёт колонку
// `order_lifecycle_id`, graph — вложенный объект. Читаем оба вида (идиома
// assignees.ts).
const eventLifecycleId = (event: StageEvent): string | null => {
  if (event.order_lifecycle_id) {
    return event.order_lifecycle_id
  }
  const link = event.order_lifecycle
  if (typeof link === "string") {
    return link
  }
  return link?.id ?? null
}

const timeOf = (value: string | Date | null | undefined): number | null => {
  if (!value) {
    return null
  }
  const at = new Date(value).getTime()
  return Number.isFinite(at) ? at : null
}

// Сборка отчёта из готовых данных — отдельно от выборки: правило усреднения
// проверяется юнит-тестом без БД.
export function buildStageReport(
  lifecycles: { id: string; created_at?: string | Date | null }[],
  events: StageEvent[],
  windowDays: number
): OrderStageReport {
  // Первый переход в каждый статус по каждому заказу: повторный переход
  // (например «в сборке» после частичной) стадию не удлиняет.
  const firstAt = new Map<string, Map<string, number>>()
  for (const event of events) {
    const id = eventLifecycleId(event)
    const at = timeOf(event.created_at)
    if (!id || at === null) {
      continue
    }
    const byStatus = firstAt.get(id) ?? new Map<string, number>()
    const known = byStatus.get(event.to_status)
    if (known === undefined || at < known) {
      byStatus.set(event.to_status, at)
    }
    firstAt.set(id, byStatus)
  }

  const durations = new Map<OrderStageKey, number[]>(
    ORDER_STAGE_KEYS.map((key) => [key, []])
  )

  for (const lifecycle of lifecycles) {
    const byStatus = firstAt.get(lifecycle.id) ?? new Map<string, number>()
    // Начало первой стадии — оформление заказа. Без даты жизненного цикла
    // (битая строка) заказ в отчёт не идёт: считать от выдуманного момента
    // хуже, чем не считать.
    let from = timeOf(lifecycle.created_at)
    if (from === null) {
      continue
    }

    for (const key of ORDER_STAGE_KEYS) {
      const ends = STAGE_END_STATUSES[key]
        .map((status) => byStatus.get(status))
        .filter((at): at is number => at !== undefined)
      if (!ends.length) {
        // Стадия не завершена — дальше по цепочке считать нечего.
        break
      }
      const to = Math.min(...ends)
      // Переход задним числом (правка данных, часы сервера) стадию не портит:
      // отрицательное время не усредняем.
      if (to >= from) {
        durations.get(key)!.push(Math.round((to - from) / 60_000))
      }
      from = to
    }
  }

  return {
    window_days: windowDays,
    orders_total: lifecycles.length,
    stages: ORDER_STAGE_KEYS.map((key) => {
      const values = durations.get(key)!
      return {
        key,
        orders: values.length,
        avg_minutes: values.length
          ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
          : null,
        max_minutes: values.length ? Math.max(...values) : null,
      }
    }),
  }
}

export async function loadOrderStageReport(
  query: Query,
  lifecycleService: OrderLifecycleModuleService,
  now: Date = new Date()
): Promise<OrderStageReport> {
  const windowDays = stageReportDays()
  const from = new Date(now.getTime() - windowDays * 24 * 3_600_000)

  const { data: lifecycles } = await query.graph({
    entity: "order_lifecycle",
    fields: ["id", "created_at"],
    filters: { created_at: { $gte: from.toISOString() } },
    pagination: {
      skip: 0,
      take: MONEY_SCAN_CAP,
      order: { created_at: "DESC" },
    },
  })

  const rows = lifecycles as { id: string; created_at?: string | null }[]
  if (!rows.length) {
    return buildStageReport([], [], windowDays)
  }

  // Лог переходов — одной выборкой на всё окно через сервис модуля (та же
  // идиома, что в lifecycle-detail): запрос на каждый заказ дал бы под сотню
  // обращений на один дашборд.
  const events = (await lifecycleService.listOrderLifecycleEvents(
    { order_lifecycle: rows.map((row) => row.id) },
    { order: { created_at: "ASC" } }
  )) as StageEvent[]

  return buildStageReport(rows, events, windowDays)
}
