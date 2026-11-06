// Деньги дня на дашборде продавца: выручка за день и за неделю, деньги в
// работе (заказы, которые ещё не доехали) и дебиторка юрлиц.
//
// ЗАЧЕМ. На дашборде не было НИ ОДНОЙ денежной суммы: управляющий не мог
// ответить ни «сколько заработали сегодня», ни «сколько денег висит в
// незакрытых заказах», и шёл считать это выгрузкой (Ф-прогон панели
// 2026-08-18, блокер Тимура). Счёт — на бэкенде: панель остаётся тонкой
// (CLAUDE.md), а пороги и окна правятся env без пересборки.
//
// Итоги заказов берём сервисом модуля order, а не полем graph: через graph
// `total` приходит неверным (см. loadOrderTotals) — это стоило один разбор на
// стенде, и повторять его нельзя.

import {
  IOrderModuleService,
  RemoteQueryFunction,
} from "@medusajs/framework/types"
import { isCompaniesEnabled } from "../../../lib/feature-flags"
import { loadOrderTotals, paymentState } from "../order-lifecycles/rows"
import {
  loadOrderPaymentStates,
  PanelOrderPayment,
} from "../../../lib/payments/panel-state"
import { numericAmount } from "../../../lib/payments/amount"
import { isDebtOverdue, roundMoney } from "../../../lib/payments/order-payment-state"
import {
  MONEY_SCAN_CAP,
  OPEN_ORDER_STATUSES,
  REVENUE_WEEK_DAYS,
  SHOP_CURRENCY,
  shopTimeZone,
} from "./constants"

type Query = Omit<RemoteQueryFunction, symbol>

// Срок оплаты юрлица по отсрочке, дней. Дебиторка старше срока — просрочена.
// Поля «отсрочка» в модели компании нет (юрлица вне MVP, T10.9), поэтому срок
// один на всех и правится env.
const DEFAULT_RECEIVABLE_TERM_DAYS = 14

export function receivableTermDays(): number {
  const raw = Number(process.env.COMPANY_RECEIVABLE_TERM_DAYS)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_RECEIVABLE_TERM_DAYS
}

export type DashboardReceivables = {
  total: number
  overdue: number
  term_days: number
  companies: number
}

// Долги покупателей «в долг» (физлица, способ оплаты продавца).
export type DashboardDebts = {
  outstanding: number
  overdue: number
  open_orders: number
  requested_orders: number
}

export type DashboardMoney = {
  currency_code: string
  revenue_today: number
  revenue_today_orders: number
  revenue_week: number
  revenue_week_orders: number
  week_days: number
  in_progress: number
  in_progress_orders: number
  // Из денег в работе — то, что ещё не оплачено: «в работе 1,2 млн, из них не
  // оплачено 300 тыс» отвечает на вопрос управляющего одной строкой.
  awaiting_payment: number
  // Заказы окна в чужой валюте — в суммы не попали (см. SHOP_CURRENCY).
  other_currency_orders: number
  // Долги покупателей по заказам «в долг».
  debts: DashboardDebts
  // Дебиторка юрлиц. null — юрлица выключены флагом (MVP только физлица):
  // плитку рисовать нечем, а «₸ 0» на ней было бы неправдой.
  receivables: DashboardReceivables | null
}

// Начало сегодняшнего дня магазина в абсолютном времени. Считаем через местные
// часы/минуты/секунды: вычесть их из «сейчас» — и получится ровно местная
// полночь, без арифметики со смещениями и переходами на летнее время.
export function shopDayStart(now: Date, timeZone: string): Date {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now)

  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)
  // «24» в формате en-GB означает полночь.
  const hour = value("hour") % 24

  const sinceMidnight =
    hour * 3_600_000 +
    value("minute") * 60_000 +
    value("second") * 1_000 +
    now.getMilliseconds()

  return new Date(now.getTime() - sinceMidnight)
}

type MoneyOrder = {
  id: string
  created_at?: string | Date | null
  currency_code?: string | null
  payment_collections?:
    | {
        status?: string | null
        amount?: unknown
        authorized_amount?: unknown
        captured_amount?: unknown
      }[]
    | null
  customer?: {
    employee?: { company?: { id?: string | null } | null } | null
  } | null
}

const MONEY_ORDER_FIELDS = [
  "id",
  "created_at",
  "currency_code",
  "payment_collections.status",
  "payment_collections.amount",
  "payment_collections.authorized_amount",
  "payment_collections.captured_amount",
  "customer.employee.company.id",
]

const inShopCurrency = (order: MoneyOrder) =>
  (order.currency_code ?? SHOP_CURRENCY).toLowerCase() === SHOP_CURRENCY

// Заказы окна выручки: оформленные не раньше начала недели магазина.
async function loadRevenueOrders(
  query: Query,
  from: Date,
  salesChannelId: string | null
): Promise<MoneyOrder[]> {
  const { data } = await query.graph({
    entity: "order",
    fields: MONEY_ORDER_FIELDS,
    filters: {
      created_at: { $gte: from.toISOString() },
      ...(salesChannelId ? { sales_channel_id: salesChannelId } : {}),
    },
    pagination: {
      skip: 0,
      take: MONEY_SCAN_CAP,
      order: { created_at: "DESC" },
    },
  })
  return data as MoneyOrder[]
}

// Заказы, по которым магазин ещё работает: id берём со стороны жизненного цикла
// (статусы наши, ядро о них не знает), а деньги — со стороны заказа.
async function loadInProgressOrders(
  query: Query,
  salesChannelId: string | null
): Promise<MoneyOrder[]> {
  const { data: lifecycles } = await query.graph({
    entity: "order_lifecycle",
    fields: ["id", "order.id"],
    // Деньги в работе — заказы в открытых статусах (включая «в доставке»):
    // доставленный заказ деньгами в работе уже не является.
    filters: {
      status: OPEN_ORDER_STATUSES,
      ...(salesChannelId ? { sales_channel_id: salesChannelId } : {}),
    },
    pagination: { skip: 0, take: MONEY_SCAN_CAP },
  })

  const ids = (lifecycles as { order?: { id: string } | null }[])
    .map((lifecycle) => lifecycle.order?.id)
    .filter((id): id is string => !!id)
  if (!ids.length) {
    return []
  }

  const { data } = await query.graph({
    entity: "order",
    fields: MONEY_ORDER_FIELDS,
    filters: { id: ids },
    pagination: { skip: 0, take: ids.length },
  })
  return data as MoneyOrder[]
}

// Неоплаченные заказы юрлиц — дебиторка: юрлицо забирает товар по отсрочке, и
// эти деньги магазин ещё должен получить. Считаем по заказам в работе: закрытый
// заказ юрлица оплачен по определению (закрыть неоплаченный цикл нельзя).
function receivables(
  orders: MoneyOrder[],
  totals: Map<string, number | null>,
  payments: Map<string, PanelOrderPayment>,
  now: number
): DashboardReceivables {
  const termDays = receivableTermDays()
  const termMs = termDays * 24 * 3_600_000
  const companies = new Set<string>()
  let total = 0
  let overdue = 0

  for (const order of orders) {
    const companyId = order.customer?.employee?.company?.id
    if (!companyId || !inShopCurrency(order)) {
      continue
    }
    if (paymentState(order, payments.get(order.id) ?? null) === "paid") {
      continue
    }
    const amount = totals.get(order.id) ?? 0
    if (amount <= 0) {
      continue
    }

    companies.add(companyId)
    total += amount

    const placed = order.created_at ? new Date(order.created_at).getTime() : NaN
    if (Number.isFinite(placed) && now - placed >= termMs) {
      overdue += amount
    }
  }

  return { total, overdue, term_days: termDays, companies: companies.size }
}

// Долги покупателей («в долг»): сколько должны по одобренным долгам, из них
// просрочено, и сколько просьб ждут решения продавца. Отдельно от выручки:
// долг — это ещё не деньги.
async function loadDebtSummary(
  query: Query,
  salesChannelId: string | null,
  now: Date
): Promise<DashboardDebts> {
  const { data } = await query.graph({
    entity: "order_payment",
    fields: ["status", "amount", "paid_amount", "due_date"],
    filters: {
      method: "debt",
      status: ["debt", "debt_requested"],
      ...(salesChannelId ? { sales_channel_id: salesChannelId } : {}),
    },
  })
  let outstanding = 0
  let overdue = 0
  let open = 0
  let requested = 0
  for (const row of data as {
    status: "debt" | "debt_requested"
    amount: unknown
    paid_amount: unknown
    due_date: string | Date | null
  }[]) {
    if (row.status === "debt_requested") {
      requested += 1
      continue
    }
    const left = Math.max(
      (numericAmount(row.amount) ?? 0) - (numericAmount(row.paid_amount) ?? 0),
      0
    )
    open += 1
    outstanding += left
    if (isDebtOverdue(row.status, row.due_date, now)) {
      overdue += left
    }
  }
  return {
    outstanding: roundMoney(outstanding),
    overdue: roundMoney(overdue),
    open_orders: open,
    requested_orders: requested,
  }
}

// salesChannelId — деньги только заказов канала (продавец компании); null —
// по всей площадке.
export async function loadDashboardMoney(
  query: Query,
  orderService: IOrderModuleService,
  now: Date = new Date(),
  salesChannelId: string | null = null
): Promise<DashboardMoney> {
  const dayStart = shopDayStart(now, shopTimeZone())
  const weekStart = new Date(
    dayStart.getTime() - (REVENUE_WEEK_DAYS - 1) * 24 * 3_600_000
  )

  const [weekOrders, inProgressOrders] = await Promise.all([
    loadRevenueOrders(query, weekStart, salesChannelId),
    loadInProgressOrders(query, salesChannelId),
  ])

  const orderIds = [
    ...new Set([...weekOrders, ...inProgressOrders].map((order) => order.id)),
  ]
  const [totals, payments, debts] = await Promise.all([
    loadOrderTotals(orderService, orderIds),
    loadOrderPaymentStates(query, orderIds, now),
    loadDebtSummary(query, salesChannelId, now),
  ])
  const stateOf = (order: MoneyOrder) =>
    paymentState(order, payments.get(order.id) ?? null)

  let revenueToday = 0
  let revenueTodayOrders = 0
  let revenueWeek = 0
  let revenueWeekOrders = 0
  let otherCurrency = 0

  for (const order of weekOrders) {
    if (!inShopCurrency(order)) {
      otherCurrency += 1
      continue
    }
    // Выручка — только оплаченные заказы: у Kaspi авторизация И ЕСТЬ оплата
    // (см. paymentState), а неоплаченный заказ ещё не деньги. Отменённые сюда
    // не попадают по тому же признаку.
    if (stateOf(order) !== "paid") {
      continue
    }
    const amount = totals.get(order.id) ?? 0
    revenueWeek += amount
    revenueWeekOrders += 1

    const placed = order.created_at ? new Date(order.created_at).getTime() : NaN
    if (Number.isFinite(placed) && placed >= dayStart.getTime()) {
      revenueToday += amount
      revenueTodayOrders += 1
    }
  }

  let inProgress = 0
  let inProgressCount = 0
  let awaitingPayment = 0
  for (const order of inProgressOrders) {
    if (!inShopCurrency(order)) {
      continue
    }
    const amount = totals.get(order.id) ?? 0
    inProgress += amount
    inProgressCount += 1
    if (stateOf(order) !== "paid") {
      awaitingPayment += amount
    }
  }

  return {
    currency_code: SHOP_CURRENCY,
    revenue_today: revenueToday,
    revenue_today_orders: revenueTodayOrders,
    revenue_week: revenueWeek,
    revenue_week_orders: revenueWeekOrders,
    week_days: REVENUE_WEEK_DAYS,
    in_progress: inProgress,
    in_progress_orders: inProgressCount,
    awaiting_payment: awaitingPayment,
    other_currency_orders: otherCurrency,
    debts,
    receivables: isCompaniesEnabled()
      ? receivables(inProgressOrders, totals, payments, now.getTime())
      : null,
  }
}
