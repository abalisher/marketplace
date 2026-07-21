import { DEFAULT_LOCALE, Locale } from "./config"
import { en, Messages } from "./messages/en"
import { ru } from "./messages/ru"
import { kk } from "./messages/kk"

// Словари невелики — импортируем статически (без динамического import).
const DICTIONARIES: Record<Locale, Messages> = { ru, kk, en }

export const getMessages = (locale: Locale): Messages =>
  DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE]
