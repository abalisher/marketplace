import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

// Валюты, которые показываем без дробной части: тенге в цене магазина всегда
// целый, «1 500,00 ₸» выглядит как ошибка.
const WHOLE_UNIT_CURRENCIES = ["kzt"]

// Деньги на витрине: рынок — Казахстан, поэтому дефолт — локаль ru-KZ и символ
// валюты вместо кода («1 500 ₸», а не «KZT 1,500.00»). Валюта передаётся явно,
// поэтому демо-регионы стартера (eur/usd) продолжают форматироваться корректно.
export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "ru-KZ",
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) {
    return amount.toString()
  }

  const isWholeUnit = WHOLE_UNIT_CURRENCIES.includes(
    currency_code.toLowerCase()
  )

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits:
      minimumFractionDigits ?? (isWholeUnit ? 0 : undefined),
    maximumFractionDigits:
      maximumFractionDigits ?? (isWholeUnit ? 0 : undefined),
  }).format(amount)
}
