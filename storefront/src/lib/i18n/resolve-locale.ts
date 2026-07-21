import { getLocale } from "@lib/data/locale-actions"
import { DEFAULT_LOCALE, isLocale, Locale } from "./config"

// Текущая локаль UI из cookie `_medusa_locale` (см. locale-actions); дефолт ru.
// Серверный резолвер — вызывается в корневом layout для сидирования провайдера.
export const resolveLocale = async (): Promise<Locale> => {
  const value = await getLocale()
  return isLocale(value) ? value : DEFAULT_LOCALE
}
