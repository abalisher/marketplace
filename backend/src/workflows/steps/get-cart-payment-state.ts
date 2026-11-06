import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { KASPI_PROVIDER_ID } from "../../modules/payment-kaspi"

export type GetCartPaymentStateStepInput = {
  cart_id: string
}

export type CartPaymentSessionState = {
  id: string
  provider_id: string
  status: string
  data: Record<string, unknown>
}

export type CartKaspiPaymentState = {
  payment_collection_id: string | null
  // Канал продаж корзины — её продавец: чьими способами оплаты и чьими ключами
  // Kaspi принимаются деньги.
  sales_channel_id: string | null
  // Все сессии корзины (у коллекции активна одна: новая сессия ядра удаляет
  // прежние).
  sessions: CartPaymentSessionState[]
  kaspi_session: {
    id: string
    status: string
    data: Record<string, unknown>
  } | null
}

// Текущее платёжное состояние корзины: payment collection ядра, её сессии и
// Kaspi-сессия (если уже создана). Только чтение (query.graph), компенсация не
// нужна.
export const getCartPaymentStateStep = createStep(
  "get-cart-payment-state",
  async (input: GetCartPaymentStateStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "sales_channel_id",
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

    const cart = carts[0] as { sales_channel_id?: string | null }
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
      sales_channel_id: cart.sales_channel_id ?? null,
      sessions: (collection?.payment_sessions ?? [])
        .filter((s) => !!s)
        .map((s) => ({
          id: s.id,
          provider_id: s.provider_id,
          status: s.status,
          data: s.data ?? {},
        })),
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
