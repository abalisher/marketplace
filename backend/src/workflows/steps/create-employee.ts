import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { COMPANY_MODULE } from "../../modules/company"
import CompanyModuleService from "../../modules/company/service"
import { EmployeeRole } from "../../modules/company/models/employee"

export type CreateEmployeeStepInput = {
  company_id: string
  role?: EmployeeRole
}

// Создаёт сотрудника компании. Привязка к customer ядра делается отдельным
// шагом линковки в workflow. Компенсация — удаление созданной записи.
export const createEmployeeStep = createStep(
  "create-employee",
  async (input: CreateEmployeeStepInput, { container }) => {
    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    const employee = await service.createEmployees(input)

    return new StepResponse(employee, employee.id)
  },
  async (employeeId, { container }) => {
    if (!employeeId) {
      return
    }
    const service = container.resolve<CompanyModuleService>(COMPANY_MODULE)
    await service.deleteEmployees(employeeId)
  }
)
