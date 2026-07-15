import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { KASPI_PROVIDER_ID } from "../../modules/payment-kaspi"

export type GetCartPaymentStateStepInput = {
  cart_id: string
}

export type CartKaspiPaymentState = {
  payment_collection_id: string | null
  kaspi_session: {
    id: string
    status: string
    data: Record<string, unknown>
  } | null
}

// Текущее платёжное состояние корзины: payment collection ядра и Kaspi-сессия
// (если уже создана). Только чтение (query.graph), компенсация не нужна.
export const getCartPaymentStateStep = createStep(
  "get-cart-payment-state",
  async (input: GetCartPaymentStateStepInput, { container }) => {
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

    const kaspiSession =
      collection?.payment_sessions?.find(
        (s) => s?.provider_id === KASPI_PROVIDER_ID
      ) ?? null

    return new StepResponse({
      payment_collection_id: collection?.id ?? null,
      kaspi_session: kaspiSession
        ? {
            id: kaspiSession.id,
            status: kaspiSession.status,
            data: kaspiSession.data ?? {},
          }
        : null,
    } satisfies CartKaspiPaymentState)
  }
)
