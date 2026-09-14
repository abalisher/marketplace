import {
  DELIVERY_WINDOWS,
  DeliveryWindow,
} from "../../modules/order-lifecycle/models/statuses"

// Домен слота доставки (T5.6): какие окна бывают, какие из них ещё можно взять
// и как назвать слот человеку. Живёт ЗДЕСЬ, а не в роуте и не в инструменте
// ассистента, по той же причине, что и правило пула рейсов
// (lib/orders/driver-pool.ts): слот выбирают в чате, проверяют при оформлении,
// показывают в панели и в кабинете — все четыре места обязаны считать
// «доступен ли слот» одинаково, иначе покупатель выберет окно, которое заказ
// не примет.
//
// Чистые функции без контейнера и БД: правило проверяется unit-тестом на
// фиксированном «сейчас», а не живым стендом.

// Магазин один и работает по Астане — время слота всегда астанинское.
// Asia/Almaty с 2024-03-01 постоянно UTC+5, перевода часов нет: считаем
// сдвигом, а не Intl с таймзоной (тот зависит от icu-данных сборки).
export const ASTANA_UTC_OFFSET_HOURS = 5

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS

// Часы окон: три смены по четыре часа, покрывающие рабочий день склада.
// Это ОКНО ПРИЕЗДА машины, а не время в пути.
export const DELIVERY_WINDOW_HOURS: Record<
  DeliveryWindow,
  { start: number; end: number }
> = {
  morning: { start: 9, end: 13 },
  day: { start: 13, end: 17 },
  evening: { start: 17, end: 21 },
}

// Запас между оформлением и НАЧАЛОМ окна: заказ надо успеть собрать и
// погрузить. Окно, до начала которого осталось меньше, покупателю не
// предлагается — обещание «привезём через полчаса» магазин не выполнит.
export const SLOT_LEAD_HOURS = 3

// Насколько вперёд открыт выбор. Дальше недели планировать бессмысленно:
// стройка меняет сроки чаще.
export const SLOT_HORIZON_DAYS = 7

export type DeliverySlot = {
  // Дата в астанинских сутках, `YYYY-MM-DD`. Строка, а не Date: слот — это
  // календарные сутки магазина, а не момент времени.
  date: string
  window: DeliveryWindow
}

export type DeliverySlotOption = DeliverySlot & {
  // Готовые подписи для чата: модель не должна сама превращать `2026-09-06` и
  // `day` в человеческую фразу — выдумает и формат, и часы.
  window_label: string
  date_label: string
  label: string
}

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

const WEEKDAYS = [
  "воскресенье",
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
]

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const pad = (value: number): string => String(value).padStart(2, "0")

// Момент времени → астанинские сутки и час внутри них (дробный).
function astanaMoment(now: Date): { date: string; hour: number } {
  const shifted = new Date(now.getTime() + ASTANA_UTC_OFFSET_HOURS * HOUR_MS)
  return {
    date: shifted.toISOString().slice(0, 10),
    hour: shifted.getUTCHours() + shifted.getUTCMinutes() / 60,
  }
}

// Астанинские сутки `YYYY-MM-DD` → полночь этих суток в UTC-миллисекундах.
function dayStartMs(date: string): number {
  const [year, month, day] = date.split("-").map(Number)
  return Date.UTC(year, month - 1, day) - ASTANA_UTC_OFFSET_HOURS * HOUR_MS
}

function shiftDate(date: string, days: number): string {
  const shifted = new Date(dayStartMs(date) + days * DAY_MS + ASTANA_UTC_OFFSET_HOURS * HOUR_MS)
  return shifted.toISOString().slice(0, 10)
}

// Момент начала окна в UTC — по нему считается и доступность слота, и
// сортировка вариантов.
export function slotStartMs(slot: DeliverySlot): number {
  return dayStartMs(slot.date) + DELIVERY_WINDOW_HOURS[slot.window].start * HOUR_MS
}

export function isDeliveryWindow(value: unknown): value is DeliveryWindow {
  return (
    typeof value === "string" &&
    (DELIVERY_WINDOWS as readonly string[]).includes(value)
  )
}

// Дата слота — строго `YYYY-MM-DD` и существующий календарный день: «2026-02-31»
// проходит регулярку, но такого дня нет, и слот на него никогда не наступит.
export function isSlotDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) {
    return false
  }
  const shifted = new Date(dayStartMs(value) + ASTANA_UTC_OFFSET_HOURS * HOUR_MS)
  return shifted.toISOString().slice(0, 10) === value
}

export function windowLabel(window: DeliveryWindow): string {
  const { start, end } = DELIVERY_WINDOW_HOURS[window]
  return `${pad(start)}:00–${pad(end)}:00`
}

// Дата словами: ближние дни называем «сегодня/завтра» — так покупатель их и
// произносит; остальные — числом, месяцем и днём недели (без дня недели
// «12 сентября» ничего не говорит прорабу, который планирует бригаду).
export function dateLabel(date: string, now: Date): string {
  const today = astanaMoment(now).date
  if (date === today) {
    return "сегодня"
  }
  if (date === shiftDate(today, 1)) {
    return "завтра"
  }
  const at = new Date(dayStartMs(date) + ASTANA_UTC_OFFSET_HOURS * HOUR_MS)
  const day = at.getUTCDate()
  const month = MONTHS_GENITIVE[at.getUTCMonth()]
  return `${day} ${month}, ${WEEKDAYS[at.getUTCDay()]}`
}

// Слот одной строкой для чата и документов: «завтра, 13:00–17:00».
export function formatDeliverySlot(slot: DeliverySlot, now: Date): string {
  return `${dateLabel(slot.date, now)}, ${windowLabel(slot.window)}`
}

// Можно ли ещё взять этот слот. Два условия: окно начинается не раньше чем
// через SLOT_LEAD_HOURS и не позже горизонта планирования.
export function isSlotAvailable(slot: DeliverySlot, now: Date): boolean {
  if (!isSlotDate(slot.date) || !isDeliveryWindow(slot.window)) {
    return false
  }
  const start = slotStartMs(slot)
  if (start - now.getTime() < SLOT_LEAD_HOURS * HOUR_MS) {
    return false
  }
  const lastDay = shiftDate(astanaMoment(now).date, SLOT_HORIZON_DAYS - 1)
  return slot.date <= lastDay
}

// Все слоты, которые магазин готов пообещать прямо сейчас, по возрастанию
// времени. Первым в списке идёт ближайший — его ассистент и предлагает.
export function listDeliverySlots(now: Date): DeliverySlotOption[] {
  const today = astanaMoment(now).date
  const options: DeliverySlotOption[] = []

  for (let day = 0; day < SLOT_HORIZON_DAYS; day++) {
    const date = shiftDate(today, day)
    for (const window of DELIVERY_WINDOWS) {
      const slot: DeliverySlot = { date, window }
      if (!isSlotAvailable(slot, now)) {
        continue
      }
      options.push({
        ...slot,
        window_label: windowLabel(window),
        date_label: dateLabel(date, now),
        label: formatDeliverySlot(slot, now),
      })
    }
  }

  return options
}

// Разбор слота из произвольных данных (аргументы инструмента, метаданные
// корзины). Возвращает слот только если он валиден и ещё доступен — иначе
// null: занять вчерашнее окно нельзя ни из чата, ни из оформления.
export function parseDeliverySlot(
  date: unknown,
  window: unknown,
  now: Date
): DeliverySlot | null {
  if (!isSlotDate(date) || !isDeliveryWindow(window)) {
    return null
  }
  const slot: DeliverySlot = { date, window }
  return isSlotAvailable(slot, now) ? slot : null
}
