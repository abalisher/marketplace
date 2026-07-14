import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { COMPANY_MODULE } from "../../modules/company"
import CompanyModuleService from "../../modules/company/service"

export type CreateCompanyStepInput = {
  name: string
  bin: string
  documents?: { name: string; url: string }[]
}

// Создаёт компанию в статусе pending (дефолт модели). Формат БИН (12 цифр)
// проверяется здесь, уникальность — ограничением БД.
// Компенсация — удаление созданной записи.
export const createCompanyStep = createStep(
  "create-company",
  async (input: CreateCompanyStepInput, { container }) => {
    if (!/^\d{12}$/.test(input.bin)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "BIN must be exactly 12 digits"
      )
    }

    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    const company = await service.createCompanies({
      name: input.name,
      bin: input.bin,
      // model.json() типизируется как Record<string, unknown>, хотя колонка
      // хранит массив документов — приводим тип, структура описана в модели.
      documents: input.documents as unknown as Record<string, unknown>,
    })

    return new StepResponse(company, company.id)
  },
  async (companyId, { container }) => {
    if (!companyId) {
      return
    }
    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    await service.deleteCompanies(companyId)
  }
)
