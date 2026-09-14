import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { COMPANY_MODULE } from "../../modules/company"
import CompanyModuleService from "../../modules/company/service"
import {
  CompanyDocument,
  MAX_COMPANY_DOCUMENTS,
  parseCompanyDocuments,
} from "../../api/store/companies/document-files"

export type UpdateCompanyApplicationStepInput = {
  company_id: string
  name?: string
  bin?: string
  // Уже загруженные в File Module документы (их даёт upload-company-documents).
  documents?: CompanyDocument[]
}

// Правка собственной заявки покупателем: исправление реквизитов и догрузка
// учредительных документов. Отклонённая заявка этим же действием возвращается
// в очередь модерации (rejected → pending, с отметкой resubmitted_at);
// причина отказа сохраняется — модератор видит, что просил исправить.
// Инварианты держим внутри шага, а не отдельным guard-шагом: без связи по
// данным движок выполнил бы его параллельно, а отказ не остановил бы workflow
// (DECISIONS 2026-08-13). Компенсация возвращает прежнее состояние заявки.
export const updateCompanyApplicationStep = createStep(
  "update-company-application",
  async (input: UpdateCompanyApplicationStepInput, { container }) => {
    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    const company = await service.retrieveCompany(input.company_id)

    const changesRequisites = input.name != null || input.bin != null
    // Реквизиты одобренного юрлица модератор уже проверил: другой БИН — другая
    // компания, её заводят заявкой. Догрузка документов остаётся доступной.
    if (company.status === "approved" && changesRequisites) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Requisites of an approved company cannot be changed"
      )
    }

    if (input.bin != null && !/^\d{12}$/.test(input.bin)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "BIN must be exactly 12 digits"
      )
    }

    // Лимит документов — общий на компанию, а не на запрос: иначе догрузкой
    // можно набить модератору любое их число.
    const documents = [
      ...parseCompanyDocuments(company.documents),
      ...(input.documents ?? []),
    ]
    if (documents.length > MAX_COMPANY_DOCUMENTS) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `A company keeps at most ${MAX_COMPANY_DOCUMENTS} documents`
      )
    }

    const resubmitted = company.status === "rejected"

    const updated = await service.updateCompanies({
      id: company.id,
      ...(input.name != null ? { name: input.name } : {}),
      ...(input.bin != null ? { bin: input.bin } : {}),
      // model.json() типизируется как Record<string, unknown>, хотя колонка
      // хранит массив документов — приводим тип, структура описана в модели.
      ...(documents.length
        ? { documents: documents as unknown as Record<string, unknown> }
        : {}),
      ...(resubmitted
        ? { status: "pending" as const, resubmitted_at: new Date() }
        : {}),
    })

    return new StepResponse(updated, {
      id: company.id,
      name: company.name,
      bin: company.bin,
      documents: company.documents,
      status: company.status,
      resubmitted_at: company.resubmitted_at,
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
