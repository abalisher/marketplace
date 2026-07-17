import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  deleteCartCreditLinesWorkflow,
  refreshPaymentCollectionForCartWorkflow,
} from "@medusajs/medusa/core-flows"
import { getCartBonusStateStep } from "./steps/get-cart-bonus-state"

export type RemoveCartBonusWorkflowInput = {
  cart_id: string
}

// Снятие бонусов с корзины: удалить бонусную кредитную линию и синхронизировать
// сумму оплаты (refresh ядра удалит устаревшие платёжные сессии — инвойс Kaspi
// на уменьшенную сумму станет неактуален, клиент инициализирует оплату заново).
// Без применённых бонусов — no-op (DELETE идемпотентен).
export const removeCartBonusWorkflow = createWorkflow(
  "remove-cart-bonus",
  (input: WorkflowData<RemoveCartBonusWorkflowInput>) => {
    const state = getCartBonusStateStep({ cart_id: input.cart_id })

    const deleted = when(
      "has-bonus-line",
      { state },
      ({ state }) => state.bonus_credit_line_ids.length > 0
    ).then(() =>
      deleteCartCreditLinesWorkflow.runAsStep({
        input: transform({ state }, (d) => ({
          id: d.state.bonus_credit_line_ids,
        })),
      })
    )

    const refreshed = when(
      "removed-with-payment-collection",
      { state },
      ({ state }) =>
        state.bonus_credit_line_ids.length > 0 && !!state.payment_collection_id
    ).then(() =>
      refreshPaymentCollectionForCartWorkflow.runAsStep({
        input: transform({ input, deleted }, (d) => ({
          cart_id: d.input.cart_id,
        })),
      })
    )

    const result = getCartBonusStateStep(
      transform({ input, deleted, refreshed }, (d) => ({
        cart_id: d.input.cart_id,
      }))
    ).config({ name: "get-cart-bonus-state-result" })

    return new WorkflowResponse(result)
  }
)
