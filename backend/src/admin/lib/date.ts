import { panelLocale } from "./locale"

// Даты панели — одним форматтером на всю админку.
//
// До T4.1a каждый экран форматировал дату сам: восемь мест жёстко задавали
// «en-US», два — «ru-RU», один брал локаль из i18n. В русской панели это давало
// «Jul 15, 2026» в очереди заказов и «15 июл. 2026 г.» в приходах на соседних
// экранах. Здесь один источник: локаль панели (lib/locale.ts) + два формата.
//
// Пустое значение — прочерк: у части сущностей даты необязательны (проведение
// прихода, закрытие спора), и подставлять «Invalid Date» нельзя.

const EMPTY = "—"

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
}

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  ...DATE_OPTIONS,
  hour: "2-digit",
  minute: "2-digit",
}

const format = (
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions
) => {
  if (!value) {
    return EMPTY
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? EMPTY
    : date.toLocaleString(panelLocale, options)
}

// «15 июл. 2026 г.» / «Jul 15, 2026» — списки и карточки.
export const formatDate = (value: string | null | undefined) =>
  format(value, DATE_OPTIONS)

// «15 июл. 2026 г., 14:05» / «Jul 15, 2026, 02:05 PM» — журналы и леджеры.
export const formatDateTime = (value: string | null | undefined) =>
  format(value, DATE_TIME_OPTIONS)

// «15 июл.» / «Jul 15» — плотные таблицы-очереди, где колонка даты соседствует
// с временем в статусе и ответственным (T4.12): полная дата с годом («15 июл.
// 2026 г.») занимает там места больше, чем несёт смысла. Год дописываем только
// у прошлогодних записей — иначе очередь врала бы про заказ годовой давности.
const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
}

export const formatShortDate = (value: string | null | undefined) => {
  if (!value) {
    return EMPTY
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return EMPTY
  }
  const options =
    date.getFullYear() === new Date().getFullYear()
      ? SHORT_DATE_OPTIONS
      : { ...SHORT_DATE_OPTIONS, year: "2-digit" as const }
  return date.toLocaleDateString(panelLocale, options)
}

// «4 августа» / «August 4» — подпись «сегодня» в шапке дашборда.
export const formatDayMonth = (value: Date) =>
  value.toLocaleDateString(panelLocale, { day: "numeric", month: "long" })
