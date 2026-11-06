import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import type { SelectablePaymentMethod } from "../../../modules/order-payment/models/values"
import { kaspiStaticQrUrl, paymentMethodUnavailable } from "../../../lib/payments/methods"
import {
  DEFERRED_KASPI_PROVIDER_ID,
  METHOD_PROVIDER,
} from "../../../lib/payments/providers"
import { loadPaymentSettings } from "../../../lib/payments/settings"

export type ValidateCartPaymentMethodStepInput = {
  cart_id: string
  method: SelectablePaymentMethod
  // Kaspi QR с оплатой после оформления (чат): у корзины не счёт Kaspi, а
  // «обещание оплатить»; счёт выставляется на заказ.
  deferred?: boolean
}

// Текст отказа начинается с кода: клиенты (витрина, чат) различают причину по
// нему, человеку показывают свою подпись.
const UNAVAILABLE_MESSAGE: Record<string, string> = {
  disabled: "Продавец не принимает этот способ оплаты",
  kaspi_not_connected: "Оплата Kaspi у продавца ещё не подключена",
  transfer_no_phone: "Продавец не указал номер Kaspi для перевода",
  debt_over_limit: "Сумма заказа больше, чем продавец отпускает в долг",
}

// Сумма к оплате корзины — итог за вычетом бонусов (кредитные линии ядро
// вычитает из total, только если запрошен их amount — см.
// ensure-cart-payment-authorized).
export const cartAmountDue = (cart: {
  total?: unknown
}): number => {
  const total = Number(
    typeof cart.total === "object" && cart.total !== null && "numeric" in cart.total
      ? (cart.total as { numeric: unknown }).numeric
      : cart.total
  )
  return Number.isFinite(total) ? total : 0
}

// Принимает ли продавец корзины этот способ оплаты (его настройки, сумма
// корзины). Только чтение — компенсация не нужна.
export const validateCartPaymentMethodStep = createStep(
  "validate-cart-payment-method",
  async (input: ValidateCartPaymentMethodStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "sales_channel_id",
        "completed_at",
        "total",
        "credit_lines.id",
        "credit_lines.amount",
        "payment_collection.payment_sessions.provider_id",
        "payment_collection.payment_sessions.status",
      ],
      filters: { id: input.cart_id },
    })
    const cart = data[0] as
      | {
          id: string
          sales_channel_id?: string | null
          completed_at?: string | null
          total?: unknown
          payment_collection?: {
            payment_sessions?: { provider_id: string; status: string }[]
          } | null
        }
      | undefined
    if (!cart) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Cart ${input.cart_id} not found`
      )
    }
    if (cart.completed_at) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Заказ по этой корзине уже оформлен"
      )
    }

    // Kaspi QR уже оплачен — сменить способ нельзя: новая сессия ядра удалила
    // бы оплаченную, и деньги покупателя повисли бы без заказа.
    const paidKaspi = (cart.payment_collection?.payment_sessions ?? []).some(
      (session) =>
        session.provider_id === METHOD_PROVIDER.kaspi_qr &&
        (session.status === "authorized" || session.status === "captured")
    )
    if (paidKaspi && (input.method !== "kaspi_qr" || input.deferred)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "payment_method_unavailable:kaspi_already_paid: Kaspi уже оплачен — оформляйте заказ"
      )
    }

    const settings = await loadPaymentSettings(container, cart.sales_channel_id)
    const reason = paymentMethodUnavailable(
      settings,
      input.method,
      cartAmountDue(cart)
    )
    if (reason) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `payment_method_unavailable:${reason}: ${UNAVAILABLE_MESSAGE[reason]}`
      )
    }

    // Постоянный QR магазина не подтверждает оплату до заказа: Kaspi QR такого
    // продавца — только «сначала заказ, потом оплата».
    if (input.method === "kaspi_qr" && !input.deferred && kaspiStaticQrUrl(settings)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "payment_method_unavailable:kaspi_static_qr: оплата по QR магазина — после оформления заказа"
      )
    }

    return new StepResponse({
      cart_id: cart.id,
      method: input.method,
      provider_id:
        input.method === "kaspi_qr" && input.deferred
          ? DEFERRED_KASPI_PROVIDER_ID
          : METHOD_PROVIDER[input.method],
      sales_channel_id: cart.sales_channel_id ?? null,
    })
  }
)
