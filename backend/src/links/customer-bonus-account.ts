import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"
import BonusModule from "../modules/bonus"

// Покупатель ядра ↔ бонусный кошелёк (1:1). Счёт создаётся лениво (get-or-
// create в workflow первого начисления) — у покупателя без операций счёта нет.
// FK на customer в модели нет намеренно — правило изоляции модулей.
export default defineLink(
  CustomerModule.linkable.customer,
  BonusModule.linkable.bonusAccount
)
