// Локали UI витрины. ru — основной (рынок Казахстана/СНГ), kk — казахский,
// en — запасной/дев. Локаль UI хранится в cookie `_medusa_locale` (см.
// lib/data/locale-actions) и НЕ зависит от countryCode-роута (тот про регион/
// валюту). Подход — словари (не next-intl): лёгкий, без миграции роутинга.
export const LOCALES = ["ru", "kk", "en"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "ru"

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value)

// Подписи для переключателя языка (на самом языке).
export const LOCALE_LABELS: Record<Locale, string> = {
  ru: "Рус",
  kk: "Қаз",
  en: "Eng",
}
