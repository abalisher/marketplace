import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { BONUS_MODULE } from "../../modules/bonus"
import BonusModuleService, {
  assertSpendWithinCap,
} from "../../modules/bonus/service"
import { BONUS_CREDIT_LINE_REFERENCE } from "./get-cart-bonus-state"

export type SpendCartBonusStepInput = {
  cart_id: string
}

export type SpendCartBonusStepResult = {
  transaction_id: string | null
  account_id: string | null
  amount: number
}

// Списание бонусов при оформлении заказа: если на корзине есть бонусная
// credit line (применена через POST /store/carts/:id/bonus), списать её сумму
// с лотов счёта покупателя. Инварианты перепроверяются на момент оформления
// (корзина могла измениться после применения, баланс — потратиться в другом
// заказе): потолок max_spend_percent от суммы ДО вычета бонусов + достаточный
// баланс (внутри spend). Без бонусной линии — no-op. Компенсация — revertSpend
// (откат лотов по lot_breakdown), поэтому шаг ставится ПЕРЕД completeCart:
// упавшее завершение корзины откатит и списание.
export const spendCartBonusStep = createStep(
  "spend-cart-bonus",
  async (input: SpendCartBonusStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "customer_id",
        "total",
        "credit_lines.id",
        "credit_lines.amount",
        "credit_lines.reference",
        "credit_lines.reference_id",
      ],
      filters: { id: input.cart_id },
    })
    const cart = carts[0] as
      | {
          id: string
          customer_id: string | null
          total: number
          credit_lines?:
            | {
                id: string
                amount: number
                reference: string | null
                reference_id: string | null
              }[]
            | null
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
    if (!bonusLines.length) {
      const noop: SpendCartBonusStepResult = {
        transaction_id: null,
        account_id: null,
        amount: 0,
      }
      return new StepResponse(noop, null)
    }

    const amount = bonusLines.reduce(
      (sum, line) => sum + Number(line.amount),
      0
    )
    // Счёт — из reference_id бонусной линии (туда его положил apply-cart-bonus
    // после проверки принадлежности покупателю).
    const accountId = bonusLines[0].reference_id
    if (!accountId) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Bonus credit line ${bonusLines[0].id} has no account reference`
      )
    }

    const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)
    const config = await bonusService.getOrCreateConfig()
    assertSpendWithinCap({
      spend_amount: amount,
      order_amount: Number(cart.total) + amount,
      max_spend_percent: Number(config.max_spend_percent),
    })

    const { transaction } = await bonusService.spend({
      account_id: accountId,
      amount,
      note: `spend for cart ${input.cart_id}`,
    })

    const result: SpendCartBonusStepResult = {
      transaction_id: transaction.id,
      account_id: accountId,
      amount,
    }
    return new StepResponse(result, {
      spend_transaction_id: transaction.id,
    })
  },
  async (spent, { container }) => {
    if (!spent) {
      return
    }
    const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)
    await bonusService.revertSpend({
      spend_transaction_id: spent.spend_transaction_id,
    })
  }
)
