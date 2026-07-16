import { model } from "@medusajs/framework/utils"
import BonusTransaction from "./bonus-transaction"

// Бонусный кошелёк покупателя (физ и юр). Привязка к customer ядра — через
// module link (1:1, см. src/links/customer-bonus-account.ts), FK здесь нет
// намеренно. balance — денормализованная сумма remaining активных лотов,
// поддерживается методами сервиса (credit/spend/revertSpend/expireLots).
const BonusAccount = model.define("bonus_account", {
  id: model.id({ prefix: "bonacc" }).primaryKey(),
  balance: model.bigNumber().default(0),
  // Валюта счёта; на MVP — KZT (идиома SpendLimit модуля company).
  currency_code: model.text().default("kzt"),
  transactions: model.hasMany(() => BonusTransaction, { mappedBy: "account" }),
})

export default BonusAccount
