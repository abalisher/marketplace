import { defineLink } from "@medusajs/framework/utils"
import OrderModule from "@medusajs/medusa/order"
import BonusModule from "../modules/bonus"

// Заказ ядра ↔ бонусные транзакции (1:N): у заказа может быть и начисление
// (после закрытия + окна возврата), и списание (оплата бонусами при
// оформлении). По этому link'у джоба начисления проверяет идемпотентность
// («у заказа уже есть accrual-транзакция»).
export default defineLink(OrderModule.linkable.order, {
  linkable: BonusModule.linkable.bonusTransaction,
  isList: true,
})
