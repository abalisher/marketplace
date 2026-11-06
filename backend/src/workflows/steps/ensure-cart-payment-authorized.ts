import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { settleKaspiPaymentSession } from "../utils/settle-kaspi-payment-session"
import type { PaymentMethod } from "../../modules/order-payment/models/values"
import { paymentMethodUnavailable } from "../../lib/payments/methods"
import {
  isDeferredKaspiProvider,
  methodByProvider,
} from "../../lib/payments/providers"
import { loadPaymentSettings } from "../../lib/payments/settings"

export type EnsureCartPaymentAuthorizedStepInput = {
  cart_id: string
}

// Предусловие оформления (placeOrder): у корзины выбран способ оплаты, который
// продавец принимает, а Kaspi QR — оплачен.
// - Kaspi QR — 100% предоплата: сессия синхронизируется с инвойсом (страховка
//   от гонки: покупатель оплатил, но не дождался polling'а/webhook'а) и должна
//   быть оплачена.
// - Перевод по номеру и «в долг» — заказ оформляется без денег: сессию
//   авторизует completeCart, поступление потом отмечает продавец.
// - Kaspi QR «после оформления» (чат, провайдер pp_kaspiqr_offline) — тоже без
//   денег: счёт Kaspi выставляется уже на заказ (deferred: true), продавец
//   подтвердит заказ, когда его оплатят.
// - Любой другой провайдер (системный pp_system_default и т.п.) — отказ: он
//   завершил бы корзину без оплаты.
// Сумма к оплате — уже за вычетом бонусной кредитной линии (ядро вычитает
// credit lines из total); корзина, полностью покрытая бонусами (total 0),
// платёжной сессии не требует — completeCart в этом случае сам пропускает
// платёж (validate-cart-payments ядра). Возвращает cart_id и способ оплаты,
// чтобы completeCart зависел от шага по данным (гарантия порядка исполнения в
// workflow-графе), а заказ получил свою оплату (create-order-payment).
export const ensureCartPaymentAuthorizedStep = createStep(
  "ensure-cart-payment-authorized",
  async (input: EnsureCartPaymentAuthorizedStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "total",
        "sales_channel_id",
        // ВАЖНО: total учитывает кредитные линии только когда запрошен их
        // amount — с одним credit_lines.id ядро отдаёт total без вычета
        // (проверено эмпирически на 2.17.2).
        "credit_lines.id",
        "credit_lines.amount",
        "payment_collection.id",
        "payment_collection.payment_sessions.id",
        "payment_collection.payment_sessions.provider_id",
        "payment_collection.payment_sessions.data",
      ],
      filters: { id: input.cart_id },
    })

    const cart = carts[0] as
      | {
          total?: number
          sales_channel_id?: string | null
          credit_lines?: { id: string; amount: number }[] | null
          payment_collection?: {
            payment_sessions?: {
              id: string
              provider_id: string
              data?: Record<string, unknown> | null
            }[]
          } | null
        }
      | undefined
    const sessions = cart?.payment_collection?.payment_sessions ?? []

    if (Number(cart?.total ?? 0) <= 0 && (cart?.credit_lines ?? []).length) {
      return new StepResponse({
        cart_id: input.cart_id,
        method: "bonus" as PaymentMethod,
        deferred: false,
      })
    }

    if (!sessions.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cart has no payment session. Initialize payment before placing the order."
      )
    }

    // Активная сессия у коллекции одна (новая сессия ядра удаляет прежние).
    const session = sessions[sessions.length - 1]
    const method = methodByProvider(session.provider_id)
    if (!method) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Payment provider ${session.provider_id} is not accepted. Choose Kaspi QR, Kaspi transfer or debt.`
      )
    }

    // Сессия выставлена другому продавцу (канал в data не совпал с корзиной) —
    // деньги ушли бы не тому продавцу.
    const sessionChannel = session.data?.sales_channel_id
    if (
      typeof sessionChannel === "string" &&
      sessionChannel !== (cart?.sales_channel_id ?? null)
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Payment session belongs to another seller. Choose the payment method again."
      )
    }

    const deferred = isDeferredKaspiProvider(session.provider_id)
    if (method === "kaspi_qr" && !deferred) {
      const paymentService = container.resolve(Modules.PAYMENT)
      const settled = await settleKaspiPaymentSession(
        paymentService,
        session.id
      )
      if (settled.status !== "authorized" && settled.status !== "captured") {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Kaspi payment is not completed (status: ${settled.status}). Pay the invoice before placing the order.`
        )
      }
      return new StepResponse({
        cart_id: input.cart_id,
        method: method as PaymentMethod,
        deferred: false,
      })
    }

    // Перевод, долг и Kaspi QR после оформления: продавец мог выключить способ (или изменить лимит долга)
    // после выбора — проверяем по его настройкам на момент оформления.
    const settings = await loadPaymentSettings(container, cart?.sales_channel_id)
    const reason = paymentMethodUnavailable(
      settings,
      method,
      Number(cart?.total ?? 0)
    )
    if (reason) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `payment_method_unavailable:${reason}: the seller does not accept this payment method now`
      )
    }

    return new StepResponse({
      cart_id: input.cart_id,
      method: method as PaymentMethod,
      deferred,
    })
  }
)
