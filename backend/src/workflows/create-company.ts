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

export type CreateCompanyWorkflowInput = {
  name: string
  bin: string
  documents?: { name: string; url: string }[]
  customer_id: string
}

// Регистрация юрлица покупателем: компания в статусе pending + регистрирующий
// customer становится её сотрудником-админом (link employee ↔ customer).
// Лимиты/отсрочка активируются только после модерации (approve-company).
export const createCompanyWorkflow = createWorkflow(
  "create-company",
  (input: WorkflowData<CreateCompanyWorkflowInput>) => {
    validateCustomerNotEmployeeStep({ customer_id: input.customer_id })

    const company = createCompanyStep({
      name: input.name,
      bin: input.bin,
      documents: input.documents,
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
