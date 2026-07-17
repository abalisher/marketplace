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
// Сумма к оплате — уже за вычетом бонусной кредитной линии (ядро вычитает
// credit lines из total); корзина, полностью покрытая бонусами (total 0),
// платёжной сессии не требует — completeCart в этом случае сам пропускает
// платёж (validate-cart-payments ядра). Перед проверкой Kaspi-сессия
// синхронизируется с инвойсом (страховка от гонки: покупатель оплатил, но не
// дождался polling'а/webhook'а). Прочие провайдеры (pp_system_default и
// будущие) авторизует сам completeCart. Ветка постоплаты юрлиц появится с
// модулем scoring (дизайн-док). Возвращает cart_id, чтобы completeCart
// зависел от шага по данным (гарантия порядка исполнения в workflow-графе).
export const ensureCartPaymentAuthorizedStep = createStep(
  "ensure-cart-payment-authorized",
  async (input: EnsureCartPaymentAuthorizedStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "total",
        // ВАЖНО: total учитывает кредитные линии только когда запрошен их
        // amount — с одним credit_lines.id ядро отдаёт total без вычета
        // (проверено эмпирически на 2.17.2).
        "credit_lines.id",
        "credit_lines.amount",
        "payment_collection.id",
        "payment_collection.payment_sessions.id",
        "payment_collection.payment_sessions.provider_id",
      ],
      filters: { id: input.cart_id },
    })

    const cart = carts[0] as
      | {
          total?: number
          credit_lines?: { id: string; amount: number }[] | null
          payment_collection?: {
            payment_sessions?: { id: string; provider_id: string }[]
          } | null
        }
      | undefined
    const sessions = cart?.payment_collection?.payment_sessions ?? []

    if (Number(cart?.total ?? 0) <= 0 && (cart?.credit_lines ?? []).length) {
      return new StepResponse({ cart_id: input.cart_id })
    }

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
