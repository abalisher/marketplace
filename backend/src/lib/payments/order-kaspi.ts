import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createOrderPaymentCollectionWorkflow,
  createPaymentSessionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { KASPI_PROVIDER_ID } from "../../modules/payment-kaspi"
import { PAYMENT_PROVIDER_IDS } from "./providers"

// Счёт Kaspi на уже оформленный заказ (покупатель сменил перевод или долг на
// Kaspi QR): отдельная платёжная коллекция заказа с Kaspi-сессией. Здесь —
// только чтение: какая сессия ждёт оплаты и какие «обещания» прежнего способа
// (авторизованные платежи перевода/долга) отменить, когда Kaspi оплачен.

export type OrderKaspiSession = {
  id: string
  status: string
  data: Record<string, unknown>
}

type Row = {
  payment_collections?: {
    id: string
    payment_sessions?: {
      id: string
      provider_id: string
      status: string
      data?: Record<string, unknown> | null
    }[] | null
    payments?: {
      id: string
      provider_id: string
      captured_at?: string | Date | null
      canceled_at?: string | Date | null
    }[] | null
  }[] | null
}

const loadOrderPaymentRows = async (container: MedusaContainer, orderId: string) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: [
      "payment_collections.id",
      "payment_collections.payment_sessions.id",
      "payment_collections.payment_sessions.provider_id",
      "payment_collections.payment_sessions.status",
      "payment_collections.payment_sessions.data",
      "payment_collections.payments.id",
      "payment_collections.payments.provider_id",
      "payment_collections.payments.captured_at",
      "payment_collections.payments.canceled_at",
    ],
    filters: { id: orderId },
  })
  return (data[0] as Row | undefined)?.payment_collections ?? []
}

// Kaspi-сессия заказа, которая ещё ждёт оплаты (pending), или null.
export const findPendingOrderKaspiSession = async (
  container: MedusaContainer,
  orderId: string
): Promise<OrderKaspiSession | null> => {
  for (const collection of await loadOrderPaymentRows(container, orderId)) {
    const session = (collection.payment_sessions ?? []).find(
      (s) =>
        s.provider_id === KASPI_PROVIDER_ID &&
        (s.status === "pending" || s.status === "requires_more")
    )
    if (session) {
      return { id: session.id, status: session.status, data: session.data ?? {} }
    }
  }
  return null
}

// Авторизованная (оплаченная, но ещё не списанная) Kaspi-сессия заказа.
export const findAuthorizedOrderKaspiSession = async (
  container: MedusaContainer,
  orderId: string
): Promise<OrderKaspiSession | null> => {
  for (const collection of await loadOrderPaymentRows(container, orderId)) {
    const session = (collection.payment_sessions ?? []).find(
      (s) => s.provider_id === KASPI_PROVIDER_ID && s.status === "authorized"
    )
    if (session) {
      return { id: session.id, status: session.status, data: session.data ?? {} }
    }
  }
  return null
}

// Платежи «вне банка» (перевод, долг), ещё не списанные и не отменённые: их
// отменяем, когда заказ оплачен Kaspi, — денег по ним не будет.
export const findOpenOfflinePayments = async (
  container: MedusaContainer,
  orderId: string
): Promise<string[]> =>
  (await loadOrderPaymentRows(container, orderId))
    .flatMap((collection) => collection.payments ?? [])
    .filter(
      (payment) =>
        PAYMENT_PROVIDER_IDS.includes(payment.provider_id) &&
        payment.provider_id !== KASPI_PROVIDER_ID &&
        !payment.captured_at &&
        !payment.canceled_at
    )
    .map((payment) => payment.id)

// Выставить счёт Kaspi на оформленный заказ: своя платёжная коллекция заказа и
// Kaspi-сессия продавца (ключи — по sales_channel_id). Покупатель сменил способ
// на Kaspi QR или выбрал в чате Kaspi QR с оплатой после оформления. Оплату
// потом узнаёт и списывает settle-order-kaspi-payment.
export const issueOrderKaspiInvoice = async (
  container: MedusaContainer,
  input: { order_id: string; amount: number; sales_channel_id: string | null }
): Promise<void> => {
  const { result: collections } = await createOrderPaymentCollectionWorkflow(
    container
  ).run({ input: { order_id: input.order_id, amount: input.amount } })
  await createPaymentSessionsWorkflow(container).run({
    input: {
      payment_collection_id: collections[0].id,
      provider_id: KASPI_PROVIDER_ID,
      data: {
        reference: input.order_id,
        payment_method: "kaspi_qr",
        sales_channel_id: input.sales_channel_id,
      },
    },
  })
}
