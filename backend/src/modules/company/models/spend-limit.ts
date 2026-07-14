import { model } from "@medusajs/framework/utils"
import Employee from "./employee"

// Период действия лимита: на один заказ либо скользящее окно (день/неделя/месяц).
// У сотрудника может быть несколько лимитов с разными периодами одновременно
// (например, дневной и месячный) — проверяются все в workflow оформления заказа.
export const SPEND_LIMIT_PERIODS = ["order", "day", "week", "month"] as const
export type SpendLimitPeriod = (typeof SPEND_LIMIT_PERIODS)[number]

// Лимит сотрудника на оформление заявок (сумма за период).
const SpendLimit = model.define("spend_limit", {
  id: model.id({ prefix: "splim" }).primaryKey(),
  amount: model.bigNumber(),
  // Валюта суммы лимита; на MVP — KZT.
  currency_code: model.text().default("kzt"),
  // Спред — копия readonly-кортежа: model.enum не принимает readonly-массив.
  period: model.enum([...SPEND_LIMIT_PERIODS]),
  employee: model.belongsTo(() => Employee, { mappedBy: "spend_limits" }),
})

export default SpendLimit
