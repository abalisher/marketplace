import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { BONUS_MODULE } from "../../modules/bonus"
import BonusModuleService from "../../modules/bonus/service"

export type GetOrCreateBonusAccountStepInput = {
  customer_id: string
}

// Кошелёк покупателя создаётся лениво — при первом начислении (см.
// docs/modules/bonus.md). Существующий счёт находится по link'у customer ↔
// bonus_account; нового покупателя шаг заводит: счёт + link (внутри одного
// шага — createRemoteLinkStep не умеет «создать, только если счёта не было»).
// Компенсация удаляет только то, что шаг создал; найденный счёт не трогается.
export const getOrCreateBonusAccountStep = createStep(
  "get-or-create-bonus-account",
  async (input: GetOrCreateBonusAccountStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)

    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "bonus_account.id"],
      filters: { id: input.customer_id },
    })
    const customer = customers[0] as
      | { id: string; bonus_account?: { id: string } | null }
      | undefined
    if (!customer) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Customer ${input.customer_id} not found`
      )
    }

    if (customer.bonus_account?.id) {
      return new StepResponse(
        { account_id: customer.bonus_account.id },
        null
      )
    }

    const account = await bonusService.createBonusAccounts({})
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.create({
      [Modules.CUSTOMER]: { customer_id: input.customer_id },
      [BONUS_MODULE]: { bonus_account_id: account.id },
    })

    return new StepResponse(
      { account_id: account.id },
      { account_id: account.id, customer_id: input.customer_id }
    )
  },
  async (created, { container }) => {
    if (!created) {
      return
    }
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.dismiss({
      [Modules.CUSTOMER]: { customer_id: created.customer_id },
      [BONUS_MODULE]: { bonus_account_id: created.account_id },
    })
    const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)
    await bonusService.deleteBonusAccounts(created.account_id)
  }
)
