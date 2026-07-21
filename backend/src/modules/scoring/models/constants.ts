// Чистые функции скоринга (без БД/сети) — расчёт балла компании и лимита
// отсрочки по НАСТРАИВАЕМОМУ конфигу (ТЗ 4.7: правила настраиваемые, не хардкод).
// Standalone-функции (не методы сервиса: правило service-methods-must-be-async;
// идиома bonus calculateOrderAccrual/assertSpendWithinCap). Сбор входных данных
// (история заказов/возвратов/срок работы компании) — в workflow/джобе (подзадача 2),
// не здесь: модуль scoring заказы/компанию не знает.

// Входные факторы рейтинга (собираются снаружи из истории компании).
export type ScoringInputs = {
  orders_count: number // завершённых заказов
  orders_total: number // суммарная выручка по ним (в основной валюте)
  returns_count: number // возвраты/отмены (штраф)
  tenure_days: number // срок работы компании с платформой (дней)
}

// Настраиваемые веса/пороги. Значения-дефолты дублируют модель ScoringConfig —
// используются как fallback в чистых функциях, если поле конфига пришло пустым.
export type ScoringWeights = {
  points_per_order: number
  max_orders_points: number
  volume_per_point: number // сколько выручки даёт 1 балл объёма
  max_volume_points: number
  days_per_point: number // сколько дней стажа дают 1 балл
  max_tenure_points: number
  penalty_per_return: number
  min_score_for_credit: number
  base_limit: number
  limit_per_score_point: number
  max_limit: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

// Балл 0..100 как взвешенная сумма компонентов минус штраф за возвраты. Каждый
// компонент ограничен своим потолком (max_*_points) — ни один фактор не
// доминирует. Возвращает и разбивку (для карточки рейтинга продавцу, ТЗ 4.7).
export const calculateScore = (
  inputs: ScoringInputs,
  weights: ScoringWeights
): { score: number; components: Record<string, number> } => {
  const orders = Math.min(
    inputs.orders_count * weights.points_per_order,
    weights.max_orders_points
  )
  const volume = Math.min(
    weights.volume_per_point > 0
      ? inputs.orders_total / weights.volume_per_point
      : 0,
    weights.max_volume_points
  )
  const tenure = Math.min(
    weights.days_per_point > 0
      ? inputs.tenure_days / weights.days_per_point
      : 0,
    weights.max_tenure_points
  )
  const penalty = inputs.returns_count * weights.penalty_per_return

  const components = {
    orders: Math.round(orders * 10) / 10,
    volume: Math.round(volume * 10) / 10,
    tenure: Math.round(tenure * 10) / 10,
    penalty: Math.round(penalty * 10) / 10,
  }
  const raw = orders + volume + tenure - penalty
  const score = Math.round(clamp(raw, 0, 100))
  return { score, components }
}

// Балл → лимит отсрочки. Ниже порога кредит не даётся (0); иначе линейно от базы
// с шагом на балл, ограничен потолком.
export const scoreToLimit = (
  score: number,
  weights: ScoringWeights
): number => {
  if (score < weights.min_score_for_credit) {
    return 0
  }
  const limit = weights.base_limit + score * weights.limit_per_score_point
  return Math.round(clamp(limit, 0, weights.max_limit))
}
