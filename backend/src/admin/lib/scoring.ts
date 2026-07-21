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

// Поля конфига в порядке отображения: ключ + подпись. Все — числовые.
export const SCORING_CONFIG_FIELDS: {
  key: keyof Omit<AdminScoringConfig, "id">
  label: string
}[] = [
  { key: "points_per_order", label: "Points per order" },
  { key: "max_orders_points", label: "Max order points" },
  { key: "volume_per_point", label: "Volume per point" },
  { key: "max_volume_points", label: "Max volume points" },
  { key: "days_per_point", label: "Days per tenure point" },
  { key: "max_tenure_points", label: "Max tenure points" },
  { key: "penalty_per_return", label: "Penalty per return" },
  { key: "min_score_for_credit", label: "Min score for credit" },
  { key: "base_limit", label: "Base limit" },
  { key: "limit_per_score_point", label: "Limit per score point" },
  { key: "max_limit", label: "Max limit" },
]

export const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)
