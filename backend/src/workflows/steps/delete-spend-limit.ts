import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { COMPANY_MODULE } from "../../modules/company"
import CompanyModuleService from "../../modules/company/service"

export type DeleteSpendLimitStepInput = {
  id: string
}

// Мягко удаляет лимит сотрудника. Компенсация — восстановление.
export const deleteSpendLimitStep = createStep(
  "delete-spend-limit",
  async (input: DeleteSpendLimitStepInput, { container }) => {
    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    await service.softDeleteSpendLimits([input.id])

    return new StepResponse(void 0, input.id)
  },
  async (spendLimitId, { container }) => {
    if (!spendLimitId) {
      return
    }
    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    await service.restoreSpendLimits([spendLimitId])
  }
)
