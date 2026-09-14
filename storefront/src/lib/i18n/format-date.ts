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
