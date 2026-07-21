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
import { getCartProviderPaymentStateStep } from "./steps/get-cart-provider-payment-state"

// Наличные/перевод у окна = ядровый провайдер pp_system_default: сессию
// авторизует сам completeCart, продавцу достаточно её создать.
export const SYSTEM_PROVIDER_ID = "pp_system_default"

export type InitCartCashPaymentWorkflowInput = {
  cart_id: string
}

// «Оплата наличными» POS-корзины (гэп 2 сверки partner-раунда): payment
// collection ядра на сумму корзины (если ещё нет) + сессия pp_system_default
// (если ещё нет) — предусловие ensure-cart-payment-authorized в
// place-counter-order требует сессию, а авторизует её completeCart. Повторный
// вызов идемпотентен. Смена способа оплаты (Kaspi → наличные и обратно)
// работает через ядро: createPaymentSessionsWorkflow удаляет прочие сессии
// коллекции при создании новой (проверено интеграционным тестом).
// Структура — зеркало init-cart-kaspi-payment (see DECISIONS 2026-07-15
// о порядке шагов через transform-зависимости).
export const initCartCashPaymentWorkflow = createWorkflow(
  "init-cart-cash-payment",
  (input: WorkflowData<InitCartCashPaymentWorkflowInput>) => {
    const before = getCartProviderPaymentStateStep({
      cart_id: input.cart_id,
      provider_id: SYSTEM_PROVIDER_ID,
    })

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
    const withCollection = getCartProviderPaymentStateStep(
      transform({ input, createdCollection }, (d) => ({
        cart_id: d.input.cart_id,
        provider_id: SYSTEM_PROVIDER_ID,
      }))
    ).config({ name: "get-cart-provider-payment-state-with-collection" })

    const createdSession = when(
      "no-cash-session",
      { withCollection },
      ({ withCollection }) => !withCollection.session
    ).then(() =>
      createPaymentSessionsWorkflow.runAsStep({
        input: transform({ withCollection }, (d) => ({
          payment_collection_id: d.withCollection.payment_collection_id!,
          provider_id: SYSTEM_PROVIDER_ID,
        })),
      })
    )

    const result = getCartProviderPaymentStateStep(
      transform({ input, createdSession }, (d) => ({
        cart_id: d.input.cart_id,
        provider_id: SYSTEM_PROVIDER_ID,
      }))
    ).config({ name: "get-cart-provider-payment-state-result" })

    return new WorkflowResponse(result)
  }
)
