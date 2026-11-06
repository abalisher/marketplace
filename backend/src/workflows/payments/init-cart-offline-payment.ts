import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { getCartPaymentStateStep } from "../steps/get-cart-payment-state"
import { validateCartPaymentMethodStep } from "./steps/validate-cart-payment-method"

export type InitCartOfflinePaymentWorkflowInput = {
  cart_id: string
  // kaspi_qr здесь — Kaspi QR с оплатой ПОСЛЕ оформления (чат): у корзины
  // «обещание оплатить», счёт Kaspi выставится на заказ.
  method: "kaspi_transfer" | "debt" | "kaspi_qr"
}

// Выбор оплаты «вне банка» для корзины — перевод по номеру Kaspi, «в долг» или
// Kaspi QR с оплатой после оформления (счёт выставится на заказ).
// Та же оркестрация, что у Kaspi QR (init-cart-kaspi-payment): payment
// collection ядра (если ещё нет) и сессия провайдера способа (если ещё нет —
// новая сессия ядра удаляет прежнюю, так что выбранный способ всегда один).
// Денег сессия не означает: заказ оформится с оплатой «ждём» и продавец
// отметит поступление сам.
export const initCartOfflinePaymentWorkflow = createWorkflow(
  "init-cart-offline-payment",
  (input: WorkflowData<InitCartOfflinePaymentWorkflowInput>) => {
    const choice = validateCartPaymentMethodStep(
      transform({ input }, (d) => ({
        cart_id: d.input.cart_id,
        method: d.input.method,
        deferred: d.input.method === "kaspi_qr",
      }))
    )

    const before = getCartPaymentStateStep(
      transform({ choice }, (d) => ({ cart_id: d.choice.cart_id }))
    )

    const createdCollection = when(
      "offline-no-payment-collection",
      { before },
      ({ before }) => !before.payment_collection_id
    ).then(() =>
      createPaymentCollectionForCartWorkflow.runAsStep({
        input: transform({ input }, (d) => ({ cart_id: d.input.cart_id })),
      })
    )

    const withCollection = getCartPaymentStateStep(
      transform({ input, createdCollection }, (d) => ({
        cart_id: d.input.cart_id,
      }))
    ).config({ name: "get-cart-payment-state-offline-collection" })

    const createdSession = when(
      "offline-no-method-session",
      { withCollection, choice },
      ({ withCollection, choice }) =>
        !withCollection.sessions.some((s) => s.provider_id === choice.provider_id)
    ).then(() =>
      createPaymentSessionsWorkflow.runAsStep({
        input: transform({ withCollection, choice }, (d) => ({
          payment_collection_id: d.withCollection.payment_collection_id!,
          provider_id: d.choice.provider_id,
          data: {
            payment_method: d.choice.method,
            sales_channel_id: d.choice.sales_channel_id,
          },
        })),
      })
    )

    const result = getCartPaymentStateStep(
      transform({ input, createdSession }, (d) => ({
        cart_id: d.input.cart_id,
      }))
    ).config({ name: "get-cart-payment-state-offline-result" })

    return new WorkflowResponse(result)
  }
)
