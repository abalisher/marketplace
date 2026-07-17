import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { BONUS_MODULE } from "../../modules/bonus"
import BonusModuleService, {
  assertSpendWithinCap,
} from "../../modules/bonus/service"

export type ValidateCartBonusSpendStepInput = {
  amount: number
  customer_id: string | null
  currency_code: string
  // Сумма заказа ДО вычета бонусов — база потолка max_spend_percent.
  pre_bonus_total: number
}

// Проверки применения бонусов к корзине (fail fast при POST, само списание
// лотов — только при оформлении заказа, шаг spend-cart-bonus): у покупателя
// есть счёт с достаточным балансом, валюта совпадает, сумма в потолке
// max_spend_percent от суммы заказа. Только чтение, компенсация не нужна.
export const validateCartBonusSpendStep = createStep(
  "validate-cart-bonus-spend",
  async (input: ValidateCartBonusSpendStepInput, { container }) => {
    if (!input.customer_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Bonuses require a logged-in customer cart"
      )
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: [
        "id",
        "bonus_account.id",
        "bonus_account.balance",
        "bonus_account.currency_code",
      ],
      filters: { id: input.customer_id },
    })
    const account = (
      customers[0] as
        | {
            bonus_account?: {
              id: string
              balance: number
              currency_code: string
            } | null
          }
        | undefined
    )?.bonus_account

    if (!account || Number(account.balance) < input.amount) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Insufficient bonus balance"
      )
    }
    if (account.currency_code !== input.currency_code) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Bonus account currency ${account.currency_code} does not match cart currency ${input.currency_code}`
      )
    }

    const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)
    const config = await bonusService.getOrCreateConfig()
    assertSpendWithinCap({
      spend_amount: input.amount,
      order_amount: input.pre_bonus_total,
      max_spend_percent: Number(config.max_spend_percent),
    })

    return new StepResponse({ account_id: account.id })
  }
)
