import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { COMPANY_MODULE } from "../modules/company"
import { EmployeeRole } from "../modules/company/models/employee"
import { createEmployeeStep } from "./steps/create-employee"
import { validateCustomerNotEmployeeStep } from "./steps/validate-customer-not-employee"

export type CreateEmployeeWorkflowInput = {
  company_id: string
  customer_id: string
  role?: EmployeeRole
}

// Добавление сотрудника в компанию: существующий customer привязывается
// к компании как employee (link employee ↔ customer, 1:1).
export const createEmployeeWorkflow = createWorkflow(
  "create-employee",
  (input: WorkflowData<CreateEmployeeWorkflowInput>) => {
    validateCustomerNotEmployeeStep({ customer_id: input.customer_id })

    const employee = createEmployeeStep({
      company_id: input.company_id,
      role: input.role,
    })

    const links = transform({ employee, input }, (data) => [
      {
        [COMPANY_MODULE]: { employee_id: data.employee.id },
        [Modules.CUSTOMER]: { customer_id: data.input.customer_id },
      },
    ])
    createRemoteLinkStep(links)

    return new WorkflowResponse(employee)
  }
)
