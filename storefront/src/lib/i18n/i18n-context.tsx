"use client"

import { createContext, useContext } from "react"
import { Locale } from "./config"
import { en, Messages } from "./messages/en"

type I18nValue = { locale: Locale; messages: Messages }

// Дефолт (en) — на случай использования вне провайдера; реально провайдер
// сидируется в корневом layout резолвнутой локалью.
const I18nContext = createContext<I18nValue>({ locale: "en", messages: en })

export const I18nProvider = ({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: React.ReactNode
}) => (
  <I18nContext.Provider value={{ locale, messages }}>
    {children}
  </I18nContext.Provider>
)

// Строки UI текущей локали. Пример: const m = useMessages(); m.checkout.bonus.apply
export const useMessages = (): Messages => useContext(I18nContext).messages
export const useLocale = (): Locale => useContext(I18nContext).locale
