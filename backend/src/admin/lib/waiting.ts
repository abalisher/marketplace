// Ожидание в человеческих единицах: до двух суток — часы («ждёт 6 ч» точнее
// «0 дн»), дальше — сутки. Гейт U по T4.11: претензия, открытая на прошлой
// неделе, показывала в очереди и на плитке дашборда «443 ч» — оператор такое в
// дни в голове не переводит, а «18 дн» отвечает на его вопрос сразу.
//
// Единицу выбирает эта функция, ПОДПИСЬ — вызывающий экран: у очереди она
// короткая («18 дн»), у карточки с предлогом («ждёт 18 дн»), у плитки — внутри
// фразы. Поэтому здесь только число и единица, без i18n.
export type WaitingUnit = "hours" | "days"

export type Waiting = { unit: WaitingUnit; value: number }

const HOURS_IN_DAY = 24
// Порог перехода на сутки: двое суток. Раньше — часы ещё читаются как срок
// ответа (SLA — 24 ч), позже — уже нет.
const DAYS_FROM_HOURS = 48

export const waitingUnit = (hours: number | null | undefined): Waiting => {
  const safe = Math.max(0, Math.round(hours ?? 0))
  return safe < DAYS_FROM_HOURS
    ? { unit: "hours", value: safe }
    : { unit: "days", value: Math.round(safe / HOURS_IN_DAY) }
}

// Длительность стадии из отчёта по стадиям (T4.12) — тоже в человеческих
// единицах, но с минутами: сборка за 40 минут в часах читалась бы как «0 ч», а
// доставка за трое суток в часах — как «74 ч». Единицу выбирает эта функция,
// подпись — экран (i18n панели).
export type DurationUnit = "minutes" | "hours" | "days"

export type Duration = { unit: DurationUnit; value: number }

const MINUTES_IN_HOUR = 60
// До часа считаем минутами, до двух суток — часами (тот же порог, что у
// ожидания в очереди), дальше — сутками.
const HOURS_FROM_MINUTES = 60
const DAYS_FROM_MINUTES = DAYS_FROM_HOURS * MINUTES_IN_HOUR

export const durationUnit = (minutes: number | null | undefined): Duration => {
  const safe = Math.max(0, Math.round(minutes ?? 0))
  if (safe < HOURS_FROM_MINUTES) {
    return { unit: "minutes", value: safe }
  }
  if (safe < DAYS_FROM_MINUTES) {
    return { unit: "hours", value: Math.round(safe / MINUTES_IN_HOUR) }
  }
  return {
    unit: "days",
    value: Math.round(safe / (MINUTES_IN_HOUR * HOURS_IN_DAY)),
  }
}
