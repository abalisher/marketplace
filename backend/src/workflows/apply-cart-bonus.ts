import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createCartCreditLinesWorkflow,
  deleteCartCreditLinesWorkflow,
  refreshPaymentCollectionForCartWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  BONUS_CREDIT_LINE_REFERENCE,
  getCartBonusStateStep,
} from "./steps/get-cart-bonus-state"
import { validateCartBonusSpendStep } from "./steps/validate-cart-bonus-spend"

export type ApplyCartBonusWorkflowInput = {
  cart_id: string
  amount: number
}

// Применение бонусов к корзине (ТЗ 4.16, частичная оплата будущего заказа):
// бонусная сумма — кредитная линия корзины ядра (reference = bonus_account) —
// cart.total уменьшается ядром, completeCart сам копирует линии в заказ, а при
// полной оплате бонусами ядро пропускает платёж. Здесь только проверки
// (баланс/валюта/потолок) и линия-НАМЕРЕНИЕ; само списание лотов — при
// оформлении (шаг spend-cart-bonus в place-order). Повторный вызов заменяет
// сумму (старая линия удаляется). Если оплата уже инициализирована, refresh
// ядра синхронизирует payment collection и удаляет устаревшие сессии (инвойс
// Kaspi на старую сумму) — клиент инициализирует оплату заново.
export const applyCartBonusWorkflow = createWorkflow(
  "apply-cart-bonus",
  (input: WorkflowData<ApplyCartBonusWorkflowInput>) => {
    const state = getCartBonusStateStep({ cart_id: input.cart_id })

    const validated = validateCartBonusSpendStep(
      transform({ input, state }, (d) => ({
        amount: d.input.amount,
        customer_id: d.state.customer_id,
        currency_code: d.state.currency_code,
        pre_bonus_total: d.state.pre_bonus_total,
      }))
    )

    // Замена ранее применённой суммы: старая линия удаляется. Ветка when —
    // deleteCartCreditLinesWorkflow падает на пустом списке id.
    const deleted = when(
      "has-existing-bonus-line",
      { state },
      ({ state }) => state.bonus_credit_line_ids.length > 0
    ).then(() =>
      deleteCartCreditLinesWorkflow.runAsStep({
        input: transform({ state }, (d) => ({
          id: d.state.bonus_credit_line_ids,
        })),
      })
    )

    // Ссылки на validated/deleted в transform — зависимость по данным:
    // создание строго после проверок и удаления старой линии.
    const created = createCartCreditLinesWorkflow.runAsStep({
      input: transform({ input, validated, deleted }, (d) => [
        {
          cart_id: d.input.cart_id,
          amount: d.input.amount,
          reference: BONUS_CREDIT_LINE_REFERENCE,
          reference_id: d.validated.account_id,
          metadata: null,
        },
      ]),
    })

    // Синхронизация суммы оплаты, если payment collection уже создана
    // (иначе её создаст init оплаты уже с учётом бонуса).
    const refreshed = when(
      "cart-has-payment-collection",
      { state },
      ({ state }) => !!state.payment_collection_id
    ).then(() =>
      refreshPaymentCollectionForCartWorkflow.runAsStep({
        input: transform({ input, created }, (d) => ({
          cart_id: d.input.cart_id,
        })),
      })
    )

    const result = getCartBonusStateStep(
      transform({ input, created, refreshed }, (d) => ({
        cart_id: d.input.cart_id,
      }))
    ).config({ name: "get-cart-bonus-state-result" })

    return new WorkflowResponse(result)
  }
)
