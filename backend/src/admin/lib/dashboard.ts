// DTO сводки дня (GET /admin/dashboard) для браузерного бандла админки. Код
// бэкенда сюда не импортируем — типы продублированы намеренно (идиома
// lib/order, lib/procurement). Счёт и пороги считает бэкенд: экран только
// показывает готовые числа.

import { OrderLifecycleStatus } from "./order"

export type AdminDashboardOrderRow = {
  order_id: string
  display_id: number | null
  customer: string | null
  status: OrderLifecycleStatus
  item_count: number
  total: number | null
  currency_code: string | null
  created_at: string
  // Часы в текущем статусе и выход за срок стадии (T4.12).
  status_hours: number
  overdue: boolean
}

export type AdminDashboardStockRow = {
  id: string
  title: string | null
  sku: string | null
  available: number
}

export type AdminDashboardReceiptRow = {
  id: string
  reference: string | null
  supplier: string | null
  status: string
  source: string
  total_cost: number
  created_at: string
}

// Дебиторка юрлиц. null в ответе — юрлица выключены флагом (MVP только
// физлица): плитку не рисуем вовсе, «₸ 0» на ней было бы неправдой.
export type AdminDashboardReceivables = {
  total: number
  overdue: number
  term_days: number
  companies: number
}

// Деньги дня: выручка за день и за неделю, деньги в незакрытых заказах и
// дебиторка. Считает бэкенд (api/admin/dashboard/money.ts).
export type AdminDashboardMoney = {
  currency_code: string
  revenue_today: number
  revenue_today_orders: number
  revenue_week: number
  revenue_week_orders: number
  week_days: number
  in_progress: number
  in_progress_orders: number
  awaiting_payment: number
  other_currency_orders: number
  receivables: AdminDashboardReceivables | null
}

// Стадия отчёта «принято → собрано → отгружено → доставлено». Среднее и худшее
// время — в минутах: сборка за 40 минут в часах читалась бы как «0 ч».
export type AdminDashboardStageKey =
  | "accepted"
  | "assembled"
  | "shipped"
  | "delivered"

export type AdminDashboardStageRow = {
  key: AdminDashboardStageKey
  orders: number
  avg_minutes: number | null
  max_minutes: number | null
}

export type AdminDashboardStages = {
  window_days: number
  orders_total: number
  stages: AdminDashboardStageRow[]
}

export type AdminDashboardResponse = {
  orders: {
    open_count: number
    counts: Partial<Record<OrderLifecycleStatus, number>>
    // Заказы вне срока своей стадии и время самого залежавшегося: панель —
    // единственный канал, которым продавец узнаёт о просрочке (T4.12).
    overdue_count: number
    oldest_waiting_hours: number | null
    queue: AdminDashboardOrderRow[]
  }
  money: AdminDashboardMoney
  stages: AdminDashboardStages
  // Претензии, требующие ответа (T4.11): сколько активных, сколько просрочено
  // по сроку ответа и сколько висит самая старая.
  disputes: {
    open_count: number
    overdue_count: number
    oldest_waiting_hours: number | null
  }
  moderation: {
    pending_count: number
    oldest_waiting_hours: number | null
  }
  stock: {
    low_count: number
    zero_count: number
    threshold: number
    items: AdminDashboardStockRow[]
  }
  receipts: {
    open_count: number
    draft_count: number
    ai_count: number
    items: AdminDashboardReceiptRow[]
  }
}

// Цвет точки KPI-карточки (макет 1a): синяя — рабочая очередь, янтарная —
// ждёт проверки, красная — риск остановки продаж, зелёная — закуп.
export type DashboardAccent = "accent" | "warning" | "error" | "success"

export const DASHBOARD_DOT_COLOR: Record<DashboardAccent, string> = {
  accent: "rgb(var(--sm-accent))",
  warning: "rgb(var(--sm-warning))",
  error: "rgb(var(--sm-error))",
  success: "rgb(var(--sm-success))",
}
