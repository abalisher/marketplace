import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  completeCartWorkflow,
  createOrderFulfillmentWorkflow,
  createRemoteLinkStep,
  emitEventStep,
  markOrderFulfillmentAsDeliveredWorkflow,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { ORDER_LIFECYCLE_MODULE } from "../modules/order-lifecycle"
import { COMPANY_MODULE } from "../modules/company"
import { BONUS_MODULE } from "../modules/bonus"
import { BONUS_SPENT_EVENT } from "../modules/bonus/events"
import { StatusActorType } from "../modules/order-lifecycle/models/statuses"
import { createOrderLifecycleStep } from "./steps/create-order-lifecycle"
import { ensureCartPaymentAuthorizedStep } from "./steps/ensure-cart-payment-authorized"
import { resolveOrderCompanyStep } from "./steps/resolve-order-company"
import { getOrderItemsStep } from "./steps/get-order-items"
import { spendCartBonusStep } from "./steps/spend-cart-bonus"
import { applyOrderTransition } from "./apply-order-transition"

export type PlaceCounterOrderWorkflowInput = {
  cart_id: string
  // Кто пробил продажу (продавец у окна / админ) — уходит в лог перехода.
  actor_type: StatusActorType
  actor_id?: string | null
  // Склад выдачи; без него ядро возьмёт склад по shipping option корзины.
  location_id?: string
}

// Продажа у окна склада (POS, поправка 2026-07-15): покупатель на месте без
// предзаказа — продавец собирает корзину, принимает оплату и сразу выдаёт
// товар. Свёрнутый путь жизненного цикла new → delivered (без confirmed/
// assembling/in_delivery — разрешён стейт-машиной только для counter): как и в
// place-order, ядро завершает корзину (предоплата обязательна — тот же шаг
// ensure-cart-payment-authorized), затем lifecycle с методом counter + links,
// физика ядра одним махом (fulfillment всех позиций → выдано), переход
// new → delivered. Код получения не нужен — покупатель принимает по накладной
// на месте (документ — модуль documents позже).
export const placeCounterOrderWorkflow = createWorkflow(
  "place-counter-order",
  (input: WorkflowData<PlaceCounterOrderWorkflowInput>) => {
    const payment = ensureCartPaymentAuthorizedStep({
      cart_id: input.cart_id,
    })

    // Корзина покупателя с применёнными бонусами может быть завершена и у
    // окна — списание лотов обязано случиться и здесь (иначе скидка кредитной
    // линии прошла бы без движения по леджеру). Без бонусов шаг — no-op.
    const spent = spendCartBonusStep(
      transform({ payment }, (d) => ({ cart_id: d.payment.cart_id }))
    )

    const order = completeCartWorkflow.runAsStep({
      input: transform({ payment, spent }, (d) => ({
        id: d.payment.cart_id,
      })),
    })

    const lifecycle = createOrderLifecycleStep({
      delivery_method: "counter",
    })

    const { company_id } = resolveOrderCompanyStep({ order_id: order.id })

    // Link 1:1 заказ ↔ жизненный цикл всегда; link заказ ↔ компания — только
    // для заказа сотрудника; link заказ ↔ spend-транзакция — только при оплате
    // бонусами (иначе пустой массив, createRemoteLink — no-op).
    const links = transform({ order, lifecycle, company_id, spent }, (data) => {
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
    })
    createRemoteLinkStep(links)

    when(
      "bonus-was-spent",
      { spent },
      ({ spent }) => !!spent.transaction_id
    ).then(() =>
      // applyOrderTransition ниже тоже содержит emitEventStep — имя шага
      // обязано быть уникальным в пределах workflow.
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

    const { items } = getOrderItemsStep({ order_id: order.id })

    const fulfillment = createOrderFulfillmentWorkflow.runAsStep({
      input: transform({ order, items, input }, (data) => ({
        order_id: data.order.id,
        items: data.items,
        location_id: data.input.location_id,
      })),
    })

    const result = applyOrderTransition({
      order_id: order.id,
      to: "delivered",
      actor_type: input.actor_type,
      actor_id: input.actor_id,
    })

    markOrderFulfillmentAsDeliveredWorkflow.runAsStep({
      input: transform({ order, fulfillment }, (data) => ({
        orderId: data.order.id,
        fulfillmentId: data.fulfillment.id,
      })),
    })

    return new WorkflowResponse({ order, lifecycle, transition: result })
  }
)
