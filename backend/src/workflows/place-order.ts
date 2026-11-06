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
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { ORDER_LIFECYCLE_MODULE } from "../modules/order-lifecycle"
import { COMPANY_MODULE } from "../modules/company"
import { BONUS_MODULE } from "../modules/bonus"
import { BONUS_SPENT_EVENT } from "../modules/bonus/events"
import { captureOrderPaymentStep } from "./steps/capture-order-payment"
import { createOrderPaymentStep } from "./payments/steps/create-order-payment"
import { createOrderLifecycleStep } from "./steps/create-order-lifecycle"
import { ensureCartPaymentAuthorizedStep } from "./steps/ensure-cart-payment-authorized"
import { resolveCartDeliverySlotStep } from "./steps/resolve-cart-delivery-slot"
import { resolveOrderCompanyStep } from "./steps/resolve-order-company"
import { spendCartBonusStep } from "./steps/spend-cart-bonus"

export type PlaceOrderWorkflowInput = {
  cart_id: string
  // После пивота 2026-07-22 единственный способ получения — доставка (самовывоз
  // и продажа у окна сняты). Поле оставлено как точка расширения.
  delivery_method?: "delivery"
}

// Сквозное оформление заказа. Обёртка над ядровым completeCartWorkflow (он
// создаёт order и резервирует остатки — reserveInventoryStep), поверх которого
// навешивается наш жизненный цикл: OrderLifecycle=new + link 1:1 к заказу, и
// (если покупатель — сотрудник компании) link заказа к компании. Ядро само
// эмитит order.placed — свой дубль не шлём (см. modules/order-lifecycle/events.ts).
// Предусловие: выбран способ оплаты, который продавец принимает, а Kaspi QR
// оплачен (шаг ниже); перевод и «в долг» оформляются без денег — их
// поступление отмечает продавец; Kaspi QR с оплатой после оформления (чат)
// тоже — на заказ выставляется счёт Kaspi (create-order-payment);
// сумма к оплате — уже за вычетом бонусной кредитной линии (apply-cart-bonus).
// Списание бонусных лотов — строго после проверки оплаты и до completeCart:
// его компенсация (revertSpend) откатит списание при упавшем завершении.
// Цепочка ensure → spend → completeCart закреплена зависимостями по данным.
// После создания заказа платёж СПИСЫВАЕТСЯ (capture): при QR-оплате авторизация
// и есть оплата, а несписанный платёж оставлял заказу второе состояние денег
// (см. steps/capture-order-payment.ts).
export const placeOrderWorkflow = createWorkflow(
  "place-order",
  (input: WorkflowData<PlaceOrderWorkflowInput>) => {
    const payment = ensureCartPaymentAuthorizedStep({
      cart_id: input.cart_id,
    })

    // Слот доставки снимаем с корзины ДО completeCart: после завершения корзина
    // больше не источник — заказ создаёт ядро, а слот живёт в нашем lifecycle.
    const slot = resolveCartDeliverySlotStep(
      transform({ payment }, (d) => ({ cart_id: d.payment.cart_id }))
    )

    const spent = spendCartBonusStep(
      transform({ payment }, (d) => ({ cart_id: d.payment.cart_id }))
    )

    const order = completeCartWorkflow.runAsStep({
      input: transform({ payment, spent }, (d) => ({
        id: d.payment.cart_id,
      })),
    })

    // Канал продаж заказа копируется в lifecycle: по нему очередь и дашборд
    // показывают продавцу компании только её заказы (см. модель).
    const { data: placedOrders } = useQueryGraphStep({
      entity: "order",
      fields: ["id", "sales_channel_id"],
      filters: { id: order.id },
    }).config({ name: "load-placed-order-channel" })

    const lifecycle = createOrderLifecycleStep(
      transform({ input, slot, placedOrders }, (d) => ({
        delivery_method: d.input.delivery_method,
        delivery_date: d.slot.delivery_date,
        delivery_window: d.slot.delivery_window,
        sales_channel_id:
          (d.placedOrders[0] as { sales_channel_id?: string | null } | undefined)
            ?.sales_channel_id ?? null,
      }))
    )

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

    // Оплата заказа: способ, сумма, состояние (журнал оплат, отчёт по долгам).
    createOrderPaymentStep(
      transform({ order, payment, lifecycle }, (d) => ({
        order_id: d.order.id,
        method: d.payment.method,
        order_number: (d.lifecycle as { number?: string | null }).number ?? null,
        deferred: d.payment.deferred,
      }))
    )

    // Оплата Kaspi QR авторизована ⇒ деньги переведены: списываем сразу, чтобы
    // у заказа не было второго состояния оплаты, которое кто-то должен
    // подтверждать руками (T4.14). Перевод и долг списываются, когда продавец
    // отметит поступление (record-order-payment).
    when(
      "kaspi-qr-paid",
      { payment },
      ({ payment }) => payment.method === "kaspi_qr" && !payment.deferred
    ).then(() => {
      captureOrderPaymentStep({ order_id: order.id })
    })

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
