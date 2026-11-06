import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { SelectablePaymentMethod } from "../../modules/order-payment/models/values"
import { numericAmount } from "./amount"
import {
  kaspiStaticQrUrl,
  PaymentMethodOption,
  paymentMethodOptions,
  TransferDetails,
  transferDetails,
} from "./methods"
import { isDeferredKaspiProvider, methodByProvider } from "./providers"
import { loadPaymentSettings } from "./settings"

// Оплата корзины глазами покупателя (витрина, чат, мобильное приложение):
// какие способы принимает продавец, какой выбран и что делать дальше.
// Внутренних id сессий наружу не отдаём — только то, что рисует клиент.

export type CartPaymentSession = {
  method: SelectablePaymentMethod
  // Статус сессии ядра: pending — ждём оплату (Kaspi QR) или оформление
  // (перевод, долг); authorized — Kaspi оплачен.
  status: string
  // Kaspi QR: код и ссылка счёта (пока не оплачен).
  qr_payload: string | null
  payment_url: string | null
  kaspi_state: string | null
  // Kaspi QR с оплатой после оформления (чат): счёта у корзины нет, он
  // выставится на заказ — оформлять можно сразу.
  deferred: boolean
}

export type CartPaymentView = {
  amount: number
  currency_code: string
  methods: PaymentMethodOption[]
  selected: CartPaymentSession | null
  // Куда переводить (если продавец принимает перевод).
  transfer: TransferDetails | null
  // Условия долга (если продавец даёт в долг).
  debt: { max_amount: number | null; term_days: number } | null
  // Заказ можно оформлять: Kaspi оплачен, либо выбран перевод, долг или Kaspi
  // QR с оплатой после оформления.
  ready_to_place: boolean
  // Kaspi QR продавца — постоянный QR магазина: сумму покупатель вводит сам,
  // оплату подтверждают чек и продавец.
  kaspi_static_qr: boolean
}

type CartRow = {
  id: string
  sales_channel_id?: string | null
  currency_code?: string | null
  total?: unknown
  payment_collection?: {
    payment_sessions?: {
      provider_id: string
      status: string
      data?: Record<string, unknown> | null
    }[]
  } | null
}

const PAID = new Set(["authorized", "captured"])

export const loadCartPaymentView = async (
  container: MedusaContainer,
  cartId: string
): Promise<CartPaymentView | null> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "sales_channel_id",
      "currency_code",
      "total",
      "credit_lines.id",
      "credit_lines.amount",
      "payment_collection.payment_sessions.provider_id",
      "payment_collection.payment_sessions.status",
      "payment_collection.payment_sessions.data",
    ],
    filters: { id: cartId },
  })
  const cart = (data as CartRow[])[0]
  if (!cart) {
    return null
  }

  const amount = Math.max(numericAmount(cart.total) ?? 0, 0)
  const settings = await loadPaymentSettings(container, cart.sales_channel_id)
  const sessions = cart.payment_collection?.payment_sessions ?? []
  const session = sessions[sessions.length - 1]
  const method = methodByProvider(session?.provider_id)
  const deferred = isDeferredKaspiProvider(session?.provider_id)
  const paid = !!session && !deferred && PAID.has(session.status)

  const selected: CartPaymentSession | null =
    session && method
      ? {
          method,
          status: session.status,
          // Оплаченному счёту QR не нужен: карточка с кодом читалась бы как
          // «оплати ещё раз» (замечание владельца 2026-08-11).
          qr_payload:
            method === "kaspi_qr" && !paid && !deferred
              ? ((session.data?.qr_payload as string | undefined) ?? null)
              : null,
          payment_url:
            method === "kaspi_qr" && !paid && !deferred
              ? ((session.data?.payment_url as string | undefined) ?? null)
              : null,
          kaspi_state:
            method === "kaspi_qr" && !deferred
              ? ((session.data?.kaspi_state as string | undefined) ?? null)
              : null,
          deferred,
        }
      : null

  return {
    amount,
    currency_code: cart.currency_code ?? "kzt",
    methods: paymentMethodOptions(settings, amount),
    selected,
    transfer: transferDetails(settings),
    debt: settings.debt_enabled
      ? { max_amount: settings.debt_max_amount, term_days: settings.debt_term_days }
      : null,
    kaspi_static_qr: !!kaspiStaticQrUrl(settings),
    ready_to_place:
      !!selected &&
      (selected.method === "kaspi_qr" && !selected.deferred ? paid : true),
  }
}
