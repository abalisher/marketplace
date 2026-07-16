import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  completeCartWorkflow,
  createRemoteLinkStep,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { ORDER_LIFECYCLE_MODULE } from "../modules/order-lifecycle"
import { COMPANY_MODULE } from "../modules/company"
import { createOrderLifecycleStep } from "./steps/create-order-lifecycle"
import { ensureCartPaymentAuthorizedStep } from "./steps/ensure-cart-payment-authorized"
import { resolveOrderCompanyStep } from "./steps/resolve-order-company"

export type PlaceOrderWorkflowInput = {
  cart_id: string
  // Способ получения выбирает покупатель при оформлении: доставка или
  // самовывоз. counter сюда не входит — продажа у окна оформляется отдельным
  // workflow place-counter-order (сторона продавца).
  delivery_method?: "delivery" | "pickup"
}

// Сквозное оформление заказа. Обёртка над ядровым completeCartWorkflow (он
// создаёт order и резервирует остатки — reserveInventoryStep), поверх которого
// навешивается наш жизненный цикл: OrderLifecycle=new + link 1:1 к заказу, и
// (если покупатель — сотрудник компании) link заказа к компании. Ядро само
// эмитит order.placed — свой дубль не шлём (см. modules/order-lifecycle/events.ts).
// Предусловие 100% предоплаты: сессия есть, Kaspi-сессия оплачена (шаг ниже);
// completeCart зависит от шага по данным (cart_id через его результат).
export const placeOrderWorkflow = createWorkflow(
  "place-order",
  (input: WorkflowData<PlaceOrderWorkflowInput>) => {
    const payment = ensureCartPaymentAuthorizedStep({
      cart_id: input.cart_id,
    })

    const order = completeCartWorkflow.runAsStep({
      input: { id: payment.cart_id },
    })

    const lifecycle = createOrderLifecycleStep({
      delivery_method: input.delivery_method,
    })

    const { company_id } = resolveOrderCompanyStep({ order_id: order.id })

    // Link 1:1 заказ ↔ жизненный цикл всегда; link заказ ↔ компания — только
    // для заказа сотрудника (иначе пустой массив, createRemoteLink — no-op).
    const links = transform(
      { order, lifecycle, company_id },
      (data) => {
        const result: Record<string, Record<string, string>>[] = [
          {
            [Modules.ORDER]: { order_id: data.order.id },
            [ORDER_LIFECYCLE_MODULE]: {
              order_lifecycle_id: data.lifecycle.id,
            },
          },
        ]
        if (data.company_id) {
          result.push({
            [COMPANY_MODULE]: { company_id: data.company_id },
            [Modules.ORDER]: { order_id: data.order.id },
          })
        }
        return result
      }
    )
    createRemoteLinkStep(links)

    return new WorkflowResponse({ order, lifecycle })
  }
)
