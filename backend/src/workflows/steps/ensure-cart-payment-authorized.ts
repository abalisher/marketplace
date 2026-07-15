import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { KASPI_PROVIDER_ID } from "../../modules/payment-kaspi"
import { settleKaspiPaymentSession } from "../utils/settle-kaspi-payment-session"

export type EnsureCartPaymentAuthorizedStepInput = {
  cart_id: string
}

// Предусловие 100% предоплаты перед завершением корзины (placeOrder):
// у корзины должна быть платёжная сессия, а Kaspi-сессия — оплачена.
// Перед проверкой Kaspi-сессия синхронизируется с инвойсом (страховка от
// гонки: покупатель оплатил, но не дождался polling'а/webhook'а). Прочие
// провайдеры (pp_system_default и будущие) авторизует сам completeCart.
// Ветка постоплаты юрлиц появится с модулем scoring (дизайн-док).
// Возвращает cart_id, чтобы completeCart зависел от шага по данным
// (гарантия порядка исполнения в workflow-графе).
export const ensureCartPaymentAuthorizedStep = createStep(
  "ensure-cart-payment-authorized",
  async (input: EnsureCartPaymentAuthorizedStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "payment_collection.id",
        "payment_collection.payment_sessions.id",
        "payment_collection.payment_sessions.provider_id",
      ],
      filters: { id: input.cart_id },
    })

    const sessions =
      (
        carts[0] as
          | {
              payment_collection?: {
                payment_sessions?: { id: string; provider_id: string }[]
              } | null
            }
          | undefined
      )?.payment_collection?.payment_sessions ?? []

    if (!sessions.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cart has no payment session. Initialize payment before placing the order."
      )
    }

    const kaspiSession = sessions.find(
      (s) => s.provider_id === KASPI_PROVIDER_ID
    )
    if (kaspiSession) {
      const paymentService = container.resolve(Modules.PAYMENT)
      const session = await settleKaspiPaymentSession(
        paymentService,
        kaspiSession.id
      )
      if (session.status !== "authorized" && session.status !== "captured") {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Kaspi payment is not completed (status: ${session.status}). Pay the invoice before placing the order.`
        )
      }
    }

    return new StepResponse({ cart_id: input.cart_id })
  }
)
