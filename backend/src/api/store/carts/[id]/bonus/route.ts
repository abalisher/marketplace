import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { applyCartBonusWorkflow } from "../../../../../workflows/apply-cart-bonus"
import { removeCartBonusWorkflow } from "../../../../../workflows/remove-cart-bonus"
import type { CartBonusState } from "../../../../../workflows/steps/get-cart-bonus-state"
import { requireOwnCart } from "../../helpers"
import { StoreApplyCartBonusType } from "../../validators"

// Оплата части корзины бонусами (ТЗ 4.16). Тонкие роуты: владение корзиной —
// requireOwnCart (чужая → 404), вся логика — в workflows. Бонусная сумма живёт
// на корзине кредитной линией ядра; списание лотов — при оформлении заказа.

// Единый вид ответа: применённая бонусная сумма + тотал корзины к оплате
// (уже за вычетом бонусов) — тонкому клиенту не нужен пересчёт.
function toCartBonusResponse(state: CartBonusState) {
  return {
    amount: state.bonus_amount,
    cart_total: state.total,
    currency_code: state.currency_code,
  }
}

// POST /store/carts/:id/bonus — применить бонусы к корзине (повторный вызов
// заменяет сумму). Если оплата Kaspi уже инициализирована, её сессия
// сбрасывается ядром (сумма изменилась) — инициализировать заново.
export async function POST(
  req: AuthenticatedMedusaRequest<StoreApplyCartBonusType>,
  res: MedusaResponse
) {
  await requireOwnCart(req.scope, req.params.id, req.auth_context.actor_id)

  const { result } = await applyCartBonusWorkflow(req.scope).run({
    input: {
      cart_id: req.params.id,
      amount: req.validatedBody.amount,
    },
    throwOnError: true,
  })

  res.status(200).json({ bonus: toCartBonusResponse(result) })
}

// DELETE /store/carts/:id/bonus — снять бонусы с корзины (идемпотентен).
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await requireOwnCart(req.scope, req.params.id, req.auth_context.actor_id)

  const { result } = await removeCartBonusWorkflow(req.scope).run({
    input: { cart_id: req.params.id },
    throwOnError: true,
  })

  res.status(200).json({ bonus: toCartBonusResponse(result) })
}
