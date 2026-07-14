import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { COMPANY_MODULE } from "../../modules/company"
import CompanyModuleService from "../../modules/company/service"

export type ApproveCompanyStepInput = {
  id: string
}

// Одобрение компании админом маркетплейса. Компенсация — возврат
// прежнего статуса и комментария отклонения.
export const approveCompanyStep = createStep(
  "approve-company",
  async (input: ApproveCompanyStepInput, { container }) => {
    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    const previous = await service.retrieveCompany(input.id)

    const company = await service.approveCompany(input.id)

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
