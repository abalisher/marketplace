import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  completeCartWorkflow,
  createRemoteLinkStep,
  emitEventStep,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { ORDER_LIFECYCLE_MODULE } from "../modules/order-lifecycle"
import { COMPANY_MODULE } from "../modules/company"
import { BONUS_MODULE } from "../modules/bonus"
import { BONUS_SPENT_EVENT } from "../modules/bonus/events"
import { createOrderLifecycleStep } from "./steps/create-order-lifecycle"
import { ensureCartPaymentAuthorizedStep } from "./steps/ensure-cart-payment-authorized"
import { resolveOrderCompanyStep } from "./steps/resolve-order-company"
import { spendCartBonusStep } from "./steps/spend-cart-bonus"

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
// сумма к оплате — уже за вычетом бонусной кредитной линии (apply-cart-bonus).
// Списание бонусных лотов — строго после проверки оплаты и до completeCart:
// его компенсация (revertSpend) откатит списание при упавшем завершении.
// Цепочка ensure → spend → completeCart закреплена зависимостями по данным.
export const placeOrderWorkflow = createWorkflow(
  "place-order",
  (input: WorkflowData<PlaceOrderWorkflowInput>) => {
    const payment = ensureCartPaymentAuthorizedStep({
      cart_id: input.cart_id,
    })

    const spent = spendCartBonusStep(
      transform({ payment }, (d) => ({ cart_id: d.payment.cart_id }))
    )

    const order = completeCartWorkflow.runAsStep({
      input: transform({ payment, spent }, (d) => ({
        id: d.payment.cart_id,
      })),
    })

    const lifecycle = createOrderLifecycleStep({
      delivery_method: input.delivery_method,
    })

    const { company_id } = resolveOrderCompanyStep({ order_id: order.id })

    // Link 1:1 заказ ↔ жизненный цикл всегда; link заказ ↔ компания — только
    // для заказа сотрудника; link заказ ↔ spend-транзакция — только при оплате
    // бонусами (иначе пустой массив, createRemoteLink — no-op).
    const links = transform(
      { order, lifecycle, company_id, spent },
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
        if (data.spent.transaction_id) {
          result.push({
            [Modules.ORDER]: { order_id: data.order.id },
            [BONUS_MODULE]: {
              bonus_transaction_id: data.spent.transaction_id,
            },
          })
        }
        return result
      }
    )
    createRemoteLinkStep(links)

    when(
      "bonus-was-spent",
      { spent },
      ({ spent }) => !!spent.transaction_id
    ).then(() =>
      // Уникальное имя: у ядрового completeCartWorkflow внутри есть свой
      // emitEventStep (order.placed).
      emitEventStep({
        eventName: BONUS_SPENT_EVENT,
        data: transform({ order, spent }, (d) => ({
          order_id: d.order.id,
          account_id: d.spent.account_id,
          transaction_id: d.spent.transaction_id,
          amount: d.spent.amount,
        })),
      }).config({ name: "emit-bonus-spent" })
    )

    return new WorkflowResponse({ order, lifecycle })
  }
)
