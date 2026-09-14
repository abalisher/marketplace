// DTO admin-API скоринга для браузерного бандла админки (код модуля не
// импортируем — значения продублированы, идиома lib/bonus/lib/order).

export type AdminScoringConfig = {
  id: string
  points_per_order: number
  max_orders_points: number
  volume_per_point: number
  max_volume_points: number
  days_per_point: number
  max_tenure_points: number
  penalty_per_return: number
  min_score_for_credit: number
  base_limit: number
  limit_per_score_point: number
  max_limit: number
}

export type AdminScoringConfigResponse = { scoring_config: AdminScoringConfig }

export type AdminScorecard = {
  company_id: string
  exists: boolean
  score: number
  credit_limit: number
  manual_limit: number | null
  reserved: number
  available_credit: number
  components: Record<string, number> | null
  note: string | null
}

export type AdminScorecardResponse = { scorecard: AdminScorecard }

// Поля конфига в порядке отображения: ключ + i18n-ключ подписи (label —
// ключ react-i18next, потребляется как t(label)). Все — числовые; `money`
// помечает суммы — они показываются в тенге (управляющий в Ф-прогоне T4.6 видел
// «Лимит на балл 5000» и «Макс. лимит 5000000» без валюты и не понимал, деньги
// это или баллы).
export const SCORING_CONFIG_FIELDS: {
  key: keyof Omit<AdminScoringConfig, "id">
  label: string
  money?: boolean
}[] = [
  { key: "points_per_order", label: "scoring.field.points_per_order" },
  { key: "max_orders_points", label: "scoring.field.max_orders_points" },
  { key: "volume_per_point", label: "scoring.field.volume_per_point", money: true },
  { key: "max_volume_points", label: "scoring.field.max_volume_points" },
  { key: "days_per_point", label: "scoring.field.days_per_point" },
  { key: "max_tenure_points", label: "scoring.field.max_tenure_points" },
  { key: "penalty_per_return", label: "scoring.field.penalty_per_return" },
  { key: "min_score_for_credit", label: "scoring.field.min_score_for_credit" },
  { key: "base_limit", label: "scoring.field.base_limit", money: true },
  {
    key: "limit_per_score_point",
    label: "scoring.field.limit_per_score_point",
    money: true,
  },
  { key: "max_limit", label: "scoring.field.max_limit", money: true },
]
