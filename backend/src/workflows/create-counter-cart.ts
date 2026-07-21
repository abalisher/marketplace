import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  addShippingMethodToCartWorkflow,
  createCartWorkflow,
} from "@medusajs/medusa/core-flows"
import { resolveCounterCartContextStep } from "./steps/resolve-counter-cart-context"
import { resolveCounterCartCustomerStep } from "./steps/resolve-counter-cart-customer"

// Покупка у окна: по умолчанию гостевая. completeCart требует email на корзине —
// подставляем служебный, если ни телефон, ни email не заданы. Привязка покупателя
// по телефону (гэп 3 сверки partner-раунда) — find-or-create customer, см.
// resolve-counter-cart-customer.
export const COUNTER_CART_FALLBACK_EMAIL = "pos@marketplace.local"

export type CreateCounterCartWorkflowInput = {
  // Склад продавца: его pickup-опция станет способом получения корзины,
  // его адрес — адресом корзины.
  location_id: string
  // Обязателен, только если в системе несколько регионов.
  region_id?: string
  email?: string
  // Телефон покупателя — привязка POS-заказа к покупателю (гэп 3).
  phone?: string
}

// POS-корзина продавца (гэп 1 сверки partner-раунда, 2026-07-18): продажа у
// окна начинается с корзины, но store-роуты корзины — покупательские
// (publishable key, гостевые), а Kaspi-инициализация требует customer-auth.
// Продавцу — свой admin-путь: корзина создаётся ядровым createCartWorkflow
// с контекстом склада (регион, канал, адрес) и сразу получает pickup-опцию
// этого склада (completeCart требует shipping method). Метка metadata.counter
// отделяет POS-корзины от покупательских — admin-роуты /admin/counter-carts
// работают только с POS-корзинами.
export const createCounterCartWorkflow = createWorkflow(
  "create-counter-cart",
  (input: WorkflowData<CreateCounterCartWorkflowInput>) => {
    const context = resolveCounterCartContextStep({
      location_id: input.location_id,
      region_id: input.region_id,
    })

    // Привязка покупателя по телефону (гэп 3): find-or-create customer.
    const customer = resolveCounterCartCustomerStep({
      phone: input.phone,
      email: input.email,
    })

    const cart = createCartWorkflow.runAsStep({
      input: transform({ input, context, customer }, (d) => ({
        region_id: d.context.region_id,
        sales_channel_id: d.context.sales_channel_id,
        currency_code: d.context.currency_code,
        email:
          d.customer.email ?? d.input.email ?? COUNTER_CART_FALLBACK_EMAIL,
        ...(d.customer.customer_id
          ? { customer_id: d.customer.customer_id }
          : {}),
        shipping_address: d.context.shipping_address,
        metadata: {
          counter: true,
          location_id: d.input.location_id,
        },
      })),
    })

    addShippingMethodToCartWorkflow.runAsStep({
      input: transform({ cart, context }, (d) => ({
        cart_id: d.cart.id,
        options: [{ id: d.context.shipping_option_id }],
      })),
    })

    return new WorkflowResponse(
      transform({ cart }, (d) => ({ cart_id: d.cart.id }))
    )
  }
)
