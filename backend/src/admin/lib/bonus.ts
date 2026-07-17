// DTO admin-API бонусной программы (конфиг + счёт покупателя для widget'а)
// и подписи типов операций леджера. Значения продублированы из модели
// намеренно: код модуля нельзя импортировать в браузерный бандл админки.

export type BonusTransactionType =
  | "accrual"
  | "spend"
  | "expiry"
  | "manual_credit"
  | "manual_debit"

export type AdminBonusConfig = {
  id: string
  accrual_percent: number
  segment_percents: Record<string, number> | null
  max_spend_percent: number
  expiry_days: number | null
  expiry_notice_days: number
  return_window_days: number
  updated_at: string
}

export type AdminBonusConfigResponse = {
  bonus_config: AdminBonusConfig
}

export type AdminBonusTransaction = {
  id: string
  type: BonusTransactionType
  amount: number
  remaining: number | null
  expires_at: string | null
  note: string | null
  created_at: string
}

export type AdminCustomerBonusResponse = {
  bonus: {
    account_id: string | null
    balance: number
    currency_code: string
    transactions: AdminBonusTransaction[]
    count: number
  }
}

// Сегменты каталога, для которых доступно переопределение процента
// начисления (те же, что в lib/catalog.ts — ключи segment_percents).
export const BONUS_SEGMENT_KEYS = ["economy", "comfort", "business"] as const

// Подписи и направление операций леджера: кредит (+) / дебет (−).
export const BONUS_TRANSACTION_META: Record<
  BonusTransactionType,
  { label: string; direction: 1 | -1 }
> = {
  accrual: { label: "Accrued", direction: 1 },
  spend: { label: "Spent", direction: -1 },
  expiry: { label: "Expired", direction: -1 },
  manual_credit: { label: "Manual credit", direction: 1 },
  manual_debit: { label: "Manual debit", direction: -1 },
}

export const formatBonusAmount = (amount: number, currencyCode: string) =>
  `${amount.toLocaleString("en-US")} ${currencyCode.toUpperCase()}`
