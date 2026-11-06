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
import { KASPI_PROVIDER_ID } from "../modules/payment-kaspi"
import type { KaspiScenario } from "../modules/payment-kaspi/types"
import { getCartPaymentStateStep } from "./steps/get-cart-payment-state"
import { validateCartPaymentMethodStep } from "./payments/steps/validate-cart-payment-method"

export type InitCartKaspiPaymentWorkflowInput = {
  cart_id: string
  // Только для мока (dev/тесты): детерминированный исход оплаты,
  // прокидывается в data.kaspi_scenario сессии. В live игнорируется.
  scenario?: KaspiScenario
}

// Инициализация оплаты корзины через Kaspi: payment collection ядра на сумму
// корзины (если ещё нет) + платёжная сессия провайдера pp_kaspi_kaspi (если ещё
// нет) — внутри initiatePayment создаёт инвойс Kaspi и кладёт QR/ссылку в data
// сессии. Повторный вызов идемпотентен: существующая Kaspi-сессия
// переиспользуется (актуальность суммы при правках корзины поддерживает ядро —
// cart-workflows сами освежают payment collection). Суммой/сессией/авторизацией
// управляет ядро @medusajs/payment — здесь только оркестрация.
// Счёт выставляется на продавца корзины: сначала проверяем, что он принимает
// Kaspi QR, и кладём его канал в data сессии — по нему провайдер берёт ключи
// Kaspi продавца (деньги идут на его счёт).
export const initCartKaspiPaymentWorkflow = createWorkflow(
  "init-cart-kaspi-payment",
  (input: WorkflowData<InitCartKaspiPaymentWorkflowInput>) => {
    const choice = validateCartPaymentMethodStep({
      cart_id: input.cart_id,
      method: "kaspi_qr",
    })

    const before = getCartPaymentStateStep(
      transform({ choice }, (d) => ({ cart_id: d.choice.cart_id }))
    )

    const createdCollection = when(
      "no-payment-collection",
      { before },
      ({ before }) => !before.payment_collection_id
    ).then(() =>
      createPaymentCollectionForCartWorkflow.runAsStep({
        input: { cart_id: input.cart_id },
      })
    )

    // Перечитка через transform, ссылающийся на результат when-ветки, —
    // это зависимость по данным: шаг выполнится после создания коллекции.
    const withCollection = getCartPaymentStateStep(
      transform({ input, createdCollection }, (d) => ({
        cart_id: d.input.cart_id,
      }))
    ).config({ name: "get-cart-payment-state-with-collection" })

    const createdSession = when(
      "no-kaspi-session",
      { withCollection },
      ({ withCollection }) => !withCollection.kaspi_session
    ).then(() =>
      createPaymentSessionsWorkflow.runAsStep({
        input: transform({ input, withCollection, choice }, (d) => ({
          payment_collection_id: d.withCollection.payment_collection_id!,
          provider_id: KASPI_PROVIDER_ID,
          data: {
            reference: d.input.cart_id,
            payment_method: "kaspi_qr",
            sales_channel_id: d.choice.sales_channel_id,
            ...(d.input.scenario ? { kaspi_scenario: d.input.scenario } : {}),
          },
        })),
      })
    )

    const result = getCartPaymentStateStep(
      transform({ input, createdSession }, (d) => ({
        cart_id: d.input.cart_id,
      }))
    ).config({ name: "get-cart-payment-state-result" })

    return new WorkflowResponse(result)
  }
)
