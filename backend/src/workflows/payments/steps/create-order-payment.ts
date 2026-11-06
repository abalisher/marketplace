import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ORDER_PAYMENT_MODULE } from "../../../modules/order-payment"
import OrderPaymentModuleService from "../../../modules/order-payment/service"
import type { PaymentMethod } from "../../../modules/order-payment/models/values"
import {
  initialKaspiAction,
  initialPaymentFacts,
  orderPaymentStatus,
} from "../../../lib/payments/order-payment-state"
import { numericAmount } from "../../../lib/payments/amount"
import { issueOrderKaspiInvoice } from "../../../lib/payments/order-kaspi"
import { kaspiStaticQrUrl } from "../../../lib/payments/methods"
import { loadPaymentSettings } from "../../../lib/payments/settings"

export type CreateOrderPaymentStepInput = {
  order_id: string
  method: PaymentMethod
  // Номер заказа для людей (ORG-26-0007), выданный жизненным циклом.
  order_number?: string | null
  // Kaspi QR с оплатой после оформления (чат): счёт выставляется на заказ.
  deferred?: boolean
}

type OrderRow = {
  id: string
  display_id?: number | null
  sales_channel_id?: string | null
  customer_id?: string | null
  currency_code?: string | null
  email?: string | null
  customer?: {
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
  } | null
  payment_collections?: { amount?: unknown }[] | null
}

// Оплата нового заказа: способ, сумма к оплате и начальное состояние. Kaspi QR
// оплачен до оформления — его поступление сразу пишется в журнал; Kaspi QR с
// оплатой после оформления (deferred) ждёт оплату, а на заказ выставляется счёт
// Kaspi (оплату узнаёт settle-order-kaspi-payment). Счёт компенсацией не
// снимается: неоплаченный, он ни на что не влияет. Сумма — из
// payment collection заказа (итог за вычетом бонусов); заказ без коллекции
// оплачен бонусами целиком.
export const createOrderPaymentStep = createStep(
  "create-order-payment",
  async (input: CreateOrderPaymentStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const service = container.resolve<OrderPaymentModuleService>(ORDER_PAYMENT_MODULE)

    const { data } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "sales_channel_id",
        "customer_id",
        "currency_code",
        "email",
        "customer.first_name",
        "customer.last_name",
        "customer.phone",
        "payment_collections.amount",
      ],
      filters: { id: input.order_id },
    })
    const order = (data as OrderRow[])[0]

    const amount = (order?.payment_collections ?? []).reduce(
      (sum, collection) => sum + (numericAmount(collection.amount) ?? 0),
      0
    )
    const method: PaymentMethod = amount > 0 ? input.method : "bonus"
    const deferredKaspi = method === "kaspi_qr" && input.deferred === true
    const facts = initialPaymentFacts(method, amount, deferredKaspi)
    const name = [order?.customer?.first_name, order?.customer?.last_name]
      .filter((part) => !!part?.trim())
      .join(" ")
      .trim()

    const created = await service.createOrderPayments({
      order_id: input.order_id,
      order_display_id: order?.display_id ?? null,
      order_number: input.order_number ?? null,
      sales_channel_id: order?.sales_channel_id ?? null,
      customer_id: order?.customer_id ?? null,
      customer_name: name || null,
      customer_phone: order?.customer?.phone?.trim() || null,
      method,
      status: orderPaymentStatus(facts),
      currency_code: order?.currency_code ?? "kzt",
      amount,
      paid_amount: facts.paid_amount,
      refunded_amount: 0,
    })

    // Постоянный QR магазина — счёта на заказ нет: покупатель платит по QR
    // продавца, оплату подтверждают чек и продавец, в журнал ничего не пишем.
    const staticQr =
      deferredKaspi &&
      !!kaspiStaticQrUrl(await loadPaymentSettings(container, created.sales_channel_id))
    const action = initialKaspiAction(method, amount, deferredKaspi, staticQr)
    if (action === "invoice") {
      await issueOrderKaspiInvoice(container, {
        order_id: input.order_id,
        amount,
        sales_channel_id: created.sales_channel_id ?? null,
      })
    } else if (action === "entry") {
      await service.createPaymentEntries({
        order_payment_id: created.id,
        kind: "payment",
        channel: "kaspi_qr",
        amount,
        sales_channel_id: created.sales_channel_id,
        actor_type: "system",
        actor_id: null,
        note: null,
        occurred_at: new Date(),
      })
    }

    return new StepResponse(
      { id: created.id, method, status: created.status },
      created.id
    )
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const service = container.resolve<OrderPaymentModuleService>(ORDER_PAYMENT_MODULE)
    await service.deleteOrderPayments(id)
  }
)
