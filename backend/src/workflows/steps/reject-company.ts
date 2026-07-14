import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { COMPANY_MODULE } from "../../modules/company"
import CompanyModuleService from "../../modules/company/service"

export type RejectCompanyStepInput = {
  id: string
  reason: string
}

// Отклонение компании админом маркетплейса (комментарий обязателен —
// инвариант проверяет сервис). Компенсация — возврат прежнего состояния.
export const rejectCompanyStep = createStep(
  "reject-company",
  async (input: RejectCompanyStepInput, { container }) => {
    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    const previous = await service.retrieveCompany(input.id)

    const company = await service.rejectCompany(input.id, input.reason)

    return new StepResponse(company, {
      id: previous.id,
      status: previous.status,
      rejection_reason: previous.rejection_reason,
    })
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    await service.updateCompanies(previous)
  }
)
