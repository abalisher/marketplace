// Типы движений бонусного леджера. amount транзакции ВСЕГДА > 0 —
// направление (кредит/дебет) определяет тип (см. docs/modules/bonus.md).
export const BONUS_TRANSACTION_TYPES = [
  "accrual", // начисление за закрытый заказ (кредит, создаёт лот)
  "spend", // списание в оплату заказа (дебет, FIFO по лотам)
  "expiry", // сгорание несписанного остатка лота (дебет)
  "manual_credit", // ручная корректировка админом (кредит, создаёт лот)
  "manual_debit", // ручная корректировка админом (дебет)
] as const
export type BonusTransactionType = (typeof BONUS_TRANSACTION_TYPES)[number]

// Кредитные типы — создают лот (remaining) и увеличивают баланс.
export const BONUS_CREDIT_TYPES = ["accrual", "manual_credit"] as const
export type BonusCreditType = (typeof BONUS_CREDIT_TYPES)[number]

// Разбивка списания по лотам — хранится в spend-транзакции для отката.
export type BonusLotBreakdown = { transaction_id: string; taken: number }[]

// Дефолты конфига платформы (ТЗ 4.16): 1% начисления; потолок списания 50% —
// дефолт до уточнения владельцем (ТЗ значение не задаёт); окно возврата 14
// дней; сгорание по умолчанию выключено (expiry_days = null).
export const DEFAULT_ACCRUAL_PERCENT = 1
export const DEFAULT_MAX_SPEND_PERCENT = 50
export const DEFAULT_RETURN_WINDOW_DAYS = 14
export const DEFAULT_EXPIRY_NOTICE_DAYS = 7
