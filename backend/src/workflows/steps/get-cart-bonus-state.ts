import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

// Маркер бонусной кредитной линии корзины: reference = "bonus_account",
// reference_id = id бонусного счёта. По нему бонусная линия отличается от
// возможных будущих кредитных линий других доменов.
export const BONUS_CREDIT_LINE_REFERENCE = "bonus_account"

export type GetCartBonusStateStepInput = {
  cart_id: string
}

export type CartBonusState = {
  cart_id: string
  customer_id: string | null
  currency_code: string
  // Текущий total корзины — ядро уже вычло кредитные линии.
  total: number
  // Сумма применённых бонусных линий и их id (для замены/удаления).
  bonus_amount: number
  bonus_credit_line_ids: string[]
  // База потолка списания: сумма заказа ДО вычета бонусов.
  pre_bonus_total: number
  payment_collection_id: string | null
}

// Бонусное состояние корзины: применённые бонусные credit lines + тотал +
// платёжная коллекция. Только чтение (query.graph), компенсация не нужна.
export const getCartBonusStateStep = createStep(
  "get-cart-bonus-state",
  async (input: GetCartBonusStateStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "customer_id",
        "currency_code",
        "total",
        "credit_lines.id",
        "credit_lines.amount",
        "credit_lines.reference",
        "payment_collection.id",
      ],
      filters: { id: input.cart_id },
    })

    const cart = carts[0] as
      | {
          id: string
          customer_id: string | null
          currency_code: string
          total: number
          credit_lines?:
            | { id: string; amount: number; reference: string | null }[]
            | null
          payment_collection?: { id: string } | null
        }
      | undefined
    if (!cart) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Cart ${input.cart_id} not found`
      )
    }

    const bonusLines = (cart.credit_lines ?? []).filter(
      (line) => line?.reference === BONUS_CREDIT_LINE_REFERENCE
    )
    const bonusAmount = bonusLines.reduce(
      (sum, line) => sum + Number(line.amount),
      0
    )
    const total = Number(cart.total)

    return new StepResponse({
      cart_id: cart.id,
      customer_id: cart.customer_id ?? null,
      currency_code: cart.currency_code,
      total,
      bonus_amount: bonusAmount,
      bonus_credit_line_ids: bonusLines.map((line) => line.id),
      pre_bonus_total: total + bonusAmount,
      payment_collection_id: cart.payment_collection?.id ?? null,
    } satisfies CartBonusState)
  }
)
