import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

export type GetCartProviderPaymentStateStepInput = {
  cart_id: string
  provider_id: string
}

export type CartProviderPaymentState = {
  payment_collection_id: string | null
  session: {
    id: string
    status: string
    data: Record<string, unknown>
  } | null
}

// Текущее платёжное состояние корзины по конкретному провайдеру: payment
// collection ядра и сессия провайдера (если уже создана). Обобщение
// get-cart-payment-state (тот зашит на Kaspi — не трогаем работающие
// kaspi-workflows). Только чтение (query.graph), компенсация не нужна.
export const getCartProviderPaymentStateStep = createStep(
  "get-cart-provider-payment-state",
  async (input: GetCartProviderPaymentStateStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "payment_collection.id",
        "payment_collection.payment_sessions.id",
        "payment_collection.payment_sessions.provider_id",
        "payment_collection.payment_sessions.status",
        "payment_collection.payment_sessions.data",
      ],
      filters: { id: input.cart_id },
    })

    if (!carts.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Cart ${input.cart_id} not found`
      )
    }

    const collection = (
      carts[0] as {
        payment_collection?: {
          id: string
          payment_sessions?: {
            id: string
            provider_id: string
            status: string
            data: Record<string, unknown>
          }[]
        } | null
      }
    ).payment_collection

    const session =
      collection?.payment_sessions?.find(
        (s) => s?.provider_id === input.provider_id
      ) ?? null

    return new StepResponse({
      payment_collection_id: collection?.id ?? null,
      session: session
        ? {
            id: session.id,
            status: session.status,
            data: session.data ?? {},
          }
        : null,
    } satisfies CartProviderPaymentState)
  }
)
