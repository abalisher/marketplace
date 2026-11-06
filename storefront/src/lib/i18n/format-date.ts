import { Locale } from "./config"

// Локали Intl для дат: ru-KZ/kk-KZ для рынка, en-GB как нейтральный английский
// (en-US дал бы «August 14, 2026» и порядок месяц-день).
const DATE_LOCALES: Record<string, string> = {
  ru: "ru-KZ",
  kk: "kk-KZ",
  en: "en-GB",
}

// Казахские месяцы задаём сами. Intl для kk-KZ отвечает по-разному на сервере
// и в браузере: Node с полным ICU даёт «2026 ж. 28 тамыз», Chrome — «2026 M08
// 28». Разошедшийся текст ронял гидратацию React на каждом экране с датой
// (обнаружено на кадрах кабинета, T10.6b). Своя таблица делает вывод
// одинаковым везде — и заодно читаемым.
const KK_MONTHS = [
  "қаңтар",
  "ақпан",
  "наурыз",
  "сәуір",
  "мамыр",
  "маусым",
  "шілде",
  "тамыз",
  "қыркүйек",
  "қазан",
  "қараша",
  "желтоқсан",
]

// Дата в человеческом виде по локали UI. Единственный форматтер витрины: до
// T3.9 копии жили в order-details и company-card, а карточка заказа в списке
// показывала вообще `toDateString()` («Fri Aug 14 2026» в русском интерфейсе).
export const formatDate = (
  value: string | Date,
  locale: Locale | string
): string => {
  const date = new Date(value)

  if (locale === "kk") {
    return `${date.getDate()} ${
      KK_MONTHS[date.getMonth()]
    } ${date.getFullYear()} ж.`
  }

  return date.toLocaleDateString(DATE_LOCALES[locale] ?? "ru-KZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Сутки Астаны: с 1 марта 2024 года весь Казахстан живёт по UTC+5.
const ASTANA_OFFSET_MS = 5 * 60 * 60 * 1000

const pad2 = (value: number) => String(value).padStart(2, "0")

// Короткая дата «dd.mm.yyyy» в сутках Астаны — срок возврата долга. Формат
// одинаков во всех локалях. Сдвиг считаем сами, а не через Intl с
// `timeZone`: таблицы поясов в браузерах отстают (Asia/Almaty ещё UTC+6), и
// сервер с клиентом разошлись бы на гидратации. null — дата не разобралась.
export const formatShortDate = (
  value: string | Date | null | undefined
): string | null => {
  if (!value) {
    return null
  }
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) {
    return null
  }
  const date = new Date(time + ASTANA_OFFSET_MS)

  return `${pad2(date.getUTCDate())}.${pad2(
    date.getUTCMonth() + 1
  )}.${date.getUTCFullYear()}`
}

// Дата и время «dd.mm, HH:MM» в Астане — отметки хода заказа («30.10, 16:48»).
// Тот же расчёт сдвига, что у formatShortDate, и формат один во всех локалях.
export const formatShortDateTime = (
  value: string | Date | null | undefined
): string | null => {
  if (!value) {
    return null
  }
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) {
    return null
  }
  const date = new Date(time + ASTANA_OFFSET_MS)

  return `${pad2(date.getUTCDate())}.${pad2(date.getUTCMonth() + 1)}, ${pad2(
    date.getUTCHours()
  )}:${pad2(date.getUTCMinutes())}`
}
