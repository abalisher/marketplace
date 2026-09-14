import { formatDate, formatShortDate } from "./date"

// Слот доставки на экранах панели (T5.6). Окно приезда покупатель выбирает при
// оформлении, продавец планирует по нему день: заказы одного окна везёт одна
// машина.
//
// Часы окон продублированы с домена (`src/lib/logistics/delivery-slots.ts`)
// осознанно: бандл админки собирается отдельно и серверный код не тянет — та же
// причина, по которой здесь заново объявлены статусы заказа (lib/order.ts).
// Значения меняются вместе.

export type DeliveryWindow = "morning" | "day" | "evening"

const WINDOW_HOURS: Record<DeliveryWindow, { start: number; end: number }> = {
  morning: { start: 9, end: 13 },
  day: { start: 13, end: 17 },
  evening: { start: 17, end: 21 },
}

const EMPTY = "—"

const pad = (value: number) => String(value).padStart(2, "0")

const isWindow = (value: string | null | undefined): value is DeliveryWindow =>
  value === "morning" || value === "day" || value === "evening"

// «09:00–13:00» — окно как его называет покупатель в чате. Часы не переводятся:
// это время, а не текст.
export const deliveryWindowLabel = (
  window: string | null | undefined
): string => {
  if (!isWindow(window)) {
    return EMPTY
  }
  const { start, end } = WINDOW_HOURS[window]
  return `${pad(start)}:00–${pad(end)}:00`
}

// Дата слота приходит календарными сутками Астаны (`YYYY-MM-DD`), без времени.
// Разбираем как ПОЛДЕНЬ UTC: `new Date("2026-09-05")` — это полночь UTC, и в
// любом поясе западнее Гринвича панель показала бы предыдущий день.
const slotDate = (date: string | null | undefined): string | null =>
  date ? `${date}T12:00:00.000Z` : null

// «5 сент., 13–17» — плотная строка очереди заказов. Минуты там опущены: окна
// начинаются ровно в час, а колонка соседствует с десятью другими — полное
// «13:00–17:00» вытеснило бы дату в многоточие (та же ошибка, из-за которой из
// очереди убирали адрес).
export const formatDeliverySlotShort = (
  date: string | null | undefined,
  window: string | null | undefined
): string => {
  const iso = slotDate(date)
  if (!iso || !isWindow(window)) {
    return EMPTY
  }
  const { start, end } = WINDOW_HOURS[window]
  return `${formatShortDate(iso)}, ${start}–${end}`
}

// «5 сент. 2026 г., 13:00–17:00» — карточка заказа, где место есть, а год важен.
export const formatDeliverySlot = (
  date: string | null | undefined,
  window: string | null | undefined
): string => {
  const iso = slotDate(date)
  if (!iso || !isWindow(window)) {
    return EMPTY
  }
  return `${formatDate(iso)}, ${deliveryWindowLabel(window)}`
}
