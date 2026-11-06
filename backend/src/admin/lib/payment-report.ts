import { DebtState, PaymentChannel } from "./payments"

// Параметры экрана «Оплаты и долги»: период журнала и запросы к отчёту.

export type JournalPeriod = "today" | "week" | "month" | "all"

export const JOURNAL_PERIODS: JournalPeriod[] = ["today", "week", "month", "all"]

// Начало периода в местном времени браузера (панель работает в Казахстане —
// пояс магазина и пояс оператора совпадают). null — без нижней границы.
export const periodStart = (period: JournalPeriod, now = new Date()): Date | null => {
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  switch (period) {
    case "today":
      return day
    case "week":
      return new Date(day.getTime() - 6 * 24 * 3_600_000)
    case "month":
      return new Date(day.getFullYear(), day.getMonth(), 1)
    default:
      return null
  }
}

export type JournalFilter = {
  sales_channel_id?: string
  period: JournalPeriod
  kind?: "payment" | "refund"
  channel?: PaymentChannel
  q?: string
}

export type DebtsFilter = {
  sales_channel_id?: string
  state: DebtState
  q?: string
}

const toQuery = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value))
    }
  }
  const text = search.toString()
  return text ? `?${text}` : ""
}

export const journalQuery = (
  filter: JournalFilter,
  page?: { limit: number; offset: number }
) =>
  toQuery({
    sales_channel_id: filter.sales_channel_id,
    from: periodStart(filter.period)?.toISOString(),
    kind: filter.kind,
    channel: filter.channel,
    q: filter.q?.trim(),
    limit: page?.limit,
    offset: page?.offset,
  })

export const debtsQuery = (filter: DebtsFilter) =>
  toQuery({
    sales_channel_id: filter.sales_channel_id,
    state: filter.state,
    q: filter.q?.trim(),
  })

export const reportFileName = (view: "entries" | "debts", date: Date) =>
  `${view === "entries" ? "oplaty" : "dolgi"}-${date.toISOString().slice(0, 10)}.csv`
