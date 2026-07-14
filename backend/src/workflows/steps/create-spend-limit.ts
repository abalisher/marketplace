import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { COMPANY_MODULE } from "../../modules/company"
import CompanyModuleService from "../../modules/company/service"
import { SpendLimitPeriod } from "../../modules/company/models/spend-limit"

export type CreateSpendLimitStepInput = {
  employee_id: string
  amount: number
  period: SpendLimitPeriod
  currency_code?: string
}

// Создаёт лимит сотрудника. Сумма должна быть положительной.
// Компенсация — удаление созданной записи.
export const createSpendLimitStep = createStep(
  "create-spend-limit",
  async (input: CreateSpendLimitStepInput, { container }) => {
    if (!(input.amount > 0)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Spend limit amount must be greater than 0"
      )
    }

    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    const spendLimit = await service.createSpendLimits(input)

    return new StepResponse(spendLimit, spendLimit.id)
  },
  async (spendLimitId, { container }) => {
    if (!spendLimitId) {
      return
    }
    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    await service.deleteSpendLimits(spendLimitId)
  }
)
