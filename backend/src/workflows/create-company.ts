import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { COMPANY_MODULE } from "../modules/company"
import { createCompanyStep } from "./steps/create-company"
import { createEmployeeStep } from "./steps/create-employee"
import { validateCustomerNotEmployeeStep } from "./steps/validate-customer-not-employee"
import {
  UploadCompanyDocumentsStepInput,
  uploadCompanyDocumentsStep,
} from "./steps/upload-company-documents"

export type CreateCompanyWorkflowInput = {
  name: string
  bin: string
  // Готовые ссылки — для внутренних вызовов (сид, скрипты); покупатель со
  // витрины присылает сами файлы (`files`), их загружает шаг workflow.
  documents?: { name: string; url: string }[]
  files?: UploadCompanyDocumentsStepInput["files"]
  customer_id: string
}

// Регистрация юрлица покупателем: компания в статусе pending + регистрирующий
// customer становится её сотрудником-админом (link employee ↔ customer).
// Лимиты/отсрочка активируются только после модерации (approve-company).
export const createCompanyWorkflow = createWorkflow(
  "create-company",
  (input: WorkflowData<CreateCompanyWorkflowInput>) => {
    validateCustomerNotEmployeeStep({ customer_id: input.customer_id })

    const uploaded = uploadCompanyDocumentsStep({ files: input.files })

    // Пустая заявка оставляет колонку `documents` незаполненной (null), а не
    // пустым массивом: модератор различает «документов не приложили» и «список
    // пуст».
    const documents = transform({ uploaded, input }, (data) => {
      const all = [...(data.input.documents ?? []), ...data.uploaded]
      return all.length ? all : undefined
    })

    const company = createCompanyStep({
      name: input.name,
      bin: input.bin,
      documents,
    })

    const employee = createEmployeeStep({
      company_id: company.id,
      role: "admin",
    })

    const links = transform({ employee, input }, (data) => [
      {
        [COMPANY_MODULE]: { employee_id: data.employee.id },
        [Modules.CUSTOMER]: { customer_id: data.input.customer_id },
      },
    ])
    createRemoteLinkStep(links)

    return new WorkflowResponse({ company, employee })
  }
)
