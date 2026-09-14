// Слот доставки на экранах покупателя (T5.6a): «6 сент., 13:00–17:00».
//
// Бэкенд отдаёт слот КОДАМИ (дата `YYYY-MM-DD` в календарных сутках Астаны +
// код окна), а подпись собирает клиент — так же, как подписывает стадию заказа
// по `delivery_stage`. Иначе окно приезда пришло бы одной русской фразой и не
// перевелось бы на kk/en.
//
// Часы окон — ЗЕРКАЛО домена бэкенда (`backend/src/lib/logistics/delivery-slots.ts`,
// `DELIVERY_WINDOW_HOURS`): цифры в них одинаковы во всех локалях, поэтому живут
// в коде, а не в словаре. Меняются часы — правится и эта таблица.
const WINDOW_HOURS: Record<string, string> = {
  morning: "09:00–13:00",
  day: "13:00–17:00",
  evening: "17:00–21:00",
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

// Подпись слота или null, если слота нет (заказ оформлен до появления слотов)
// либо коды не разобрались. null — строку слота на экране просто не рисуем:
// придумывать за бэкенд «уточним время» нельзя, это обещание магазина.
//
// Дату разбираем по частям, а не через `new Date`: слот — календарные сутки
// Астаны, и приведение к таймзоне браузера сдвинуло бы «6 сентября» на 5-е
// у покупателя западнее UTC+5.
export const formatDeliverySlot = (
  date?: string | null,
  window?: string | null,
  months?: string[]
): string | null => {
  const hours = window ? WINDOW_HOURS[window] : null
  const match = date ? DATE_RE.exec(date) : null

  if (!hours || !match || !months) {
    return null
  }

  const month = months[Number(match[2]) - 1]
  if (!month) {
    return null
  }

  return `${Number(match[3])} ${month}, ${hours}`
}
