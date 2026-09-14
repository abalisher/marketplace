// Форматирование значений для бланков документов: суммы, даты, единицы.
// Чистые функции без Intl — прод-сборка Node не везде идёт с полной ICU, а
// названия месяцев и склонения тенге ICU всё равно не даёт.

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
]

// Название валюты для бланка. Символ ₸ (U+20B8) в PT Sans отсутствует — в PDF
// он вышел бы пустым квадратом, поэтому пишем словом.
export const currencyLabel = (currency: string): string =>
  (currency || "kzt").toLowerCase() === "kzt" ? "тенге" : currency.toUpperCase()

// Сумма в бухгалтерском виде: разряды пробелом, две цифры после запятой
// («242 000,00»). Валюта — отдельной подписью, чтобы в колонках таблицы
// не повторяться в каждой ячейке.
export const formatAmount = (amount: number): string => {
  const safe = Number.isFinite(amount) ? amount : 0
  const [whole, fraction] = Math.abs(safe).toFixed(2).split(".")
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${safe < 0 ? "-" : ""}${grouped},${fraction}`
}

// Сумма с подписью валюты — для итогов и текста вне таблицы.
export const formatMoney = (amount: number, currency: string): string =>
  `${formatAmount(amount)} ${currencyLabel(currency)}`

// Количество без хвоста нулей: 3 → «3», 3.5 → «3,5» (объёмные материалы
// заказывают дробно — 3,5 м³ песка).
export const formatQuantity = (quantity: number): string => {
  const safe = Number.isFinite(quantity) ? quantity : 0
  const rounded = Math.round(safe * 1000) / 1000
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace(".", ",")
}

// Дата бланка: «6 сентября 2026 г.» — так подписывают первичные документы.
export const formatDocumentDate = (value: string | null | undefined): string => {
  if (!value) {
    return "—"
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()} г.`
}

// Короткая дата для отметок («06.09.2026»).
export const formatShortDate = (value: string | null | undefined): string => {
  if (!value) {
    return "—"
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  return `${dd}.${mm}.${date.getFullYear()}`
}

// Единица измерения позиции. Снапшоты до правки её не несут — печатаем «шт»,
// пустая клетка в форме З-2 недопустима.
export const itemUnit = (unit: string | null | undefined): string => {
  const value = (unit ?? "").trim()
  return value === "" ? "шт" : value
}

// Название платёжного провайдера человекочитаемо (в снапшоте лежит id ядра
// вида «pp_kaspi_kaspi»).
export const paymentProviderLabel = (
  provider: string | null | undefined
): string => {
  const value = (provider ?? "").toLowerCase()
  if (value.includes("kaspi")) {
    return "Kaspi"
  }
  if (value.includes("cash")) {
    return "наличными"
  }
  return "онлайн"
}
