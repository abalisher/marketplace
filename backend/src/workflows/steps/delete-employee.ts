import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { COMPANY_MODULE } from "../../modules/company"
import CompanyModuleService from "../../modules/company/service"

export type DeleteEmployeeStepInput = {
  id: string
}

// Мягко удаляет сотрудника вместе с его лимитами (лимиты без сотрудника
// не имеют смысла). Компенсация — восстановление обоих.
export const deleteEmployeeStep = createStep(
  "delete-employee",
  async (input: DeleteEmployeeStepInput, { container }) => {
    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    const employee = await service.retrieveEmployee(input.id, {
      relations: ["spend_limits"],
    })
    const spendLimitIds = (employee.spend_limits ?? []).map((l) => l.id)

    if (spendLimitIds.length) {
      await service.softDeleteSpendLimits(spendLimitIds)
    }
    await service.softDeleteEmployees(input.id)

    return new StepResponse(void 0, { id: input.id, spendLimitIds })
  },
  async (deleted, { container }) => {
    if (!deleted) {
      return
    }
    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    await service.restoreEmployees([deleted.id])
    if (deleted.spendLimitIds.length) {
      await service.restoreSpendLimits(deleted.spendLimitIds)
    }
  }
)
