import { model } from "@medusajs/framework/utils"
import BonusAccount from "./bonus-account"
import { BONUS_TRANSACTION_TYPES } from "./constants"

// Строка бонусного леджера. Кредитные типы (accrual/manual_credit) — ЛОТЫ:
// remaining хранит несписанный остаток, expires_at — срок сгорания лота.
// Списание уменьшает remaining лотов FIFO (ближайшее сгорание первым) и
// запоминает разбивку в lot_breakdown — по ней spend откатывается компенсацией
// workflow-шага. Заказ-основание — через module link, FK в модели нет.
const BonusTransaction = model.define("bonus_transaction", {
  id: model.id({ prefix: "bontx" }).primaryKey(),
  // Спред — копия readonly-кортежа: model.enum не принимает readonly-массив.
  type: model.enum([...BONUS_TRANSACTION_TYPES]),
  // Всегда > 0 — направление движения определяет type.
  amount: model.bigNumber(),
  // Несписанный остаток лота; только у кредитных типов, у дебетовых — null.
  remaining: model.bigNumber().nullable(),
  // Срок сгорания лота; null — не сгорает (сгорание выключено в конфиге).
  expires_at: model.dateTime().nullable(),
  // Маркер «о скором сгорании лота уже предупредили» — идемпотентность
  // bonus.expiring_soon между прогонами джобы expire-bonuses.
  expiry_notified_at: model.dateTime().nullable(),
  // У списаний: [{transaction_id, taken}] — из каких лотов сколько взято.
  lot_breakdown: model.json().nullable(),
  note: model.text().nullable(),
  account: model.belongsTo(() => BonusAccount, { mappedBy: "transactions" }),
})

export default BonusTransaction
