import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BONUS_MODULE } from "../../modules/bonus"
import BonusModuleService from "../../modules/bonus/service"

export type CreditBonusAccountStepInput = {
  account_id: string
  amount: number
  // ISO-строка (данные шагов сериализуются); null — лот не сгорает.
  expires_at: string | null
  note?: string | null
}

// Начисление лота на счёт через service.credit (лот + денормализованный
// баланс). Компенсация — зеркальный откат: удалить транзакцию, вернуть баланс.
// Внутри одного workflow лот ещё никем не потрачен — откат безопасен.
export const creditBonusAccountStep = createStep(
  "credit-bonus-account",
  async (input: CreditBonusAccountStepInput, { container }) => {
    const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)

    const { account, transaction } = await bonusService.credit({
      account_id: input.account_id,
      amount: input.amount,
      type: "accrual",
      expires_at: input.expires_at ? new Date(input.expires_at) : null,
      note: input.note ?? null,
    })

    return new StepResponse(
      { transaction_id: transaction.id, account_id: account.id },
      {
        transaction_id: transaction.id,
        account_id: account.id,
        amount: input.amount,
      }
    )
  },
  async (credited, { container }) => {
    if (!credited) {
      return
    }
    const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)
    const account = await bonusService.retrieveBonusAccount(
      credited.account_id
    )
    await bonusService.updateBonusAccounts({
      id: credited.account_id,
      balance: Number(account.balance) - credited.amount,
    })
    await bonusService.deleteBonusTransactions(credited.transaction_id)
  }
)
