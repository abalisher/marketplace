import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { CompanyStatus } from "../../../modules/company/models/company"
import { EmployeeRole } from "../../../modules/company/models/employee"

// Хелперы авторизации store-роутов компании: кто зовёт (employee текущего
// customer) и принадлежность ресурсов его компании. Читают через query.graph
// (link employee ↔ customer), бизнес-логики не содержат.

export type StoreEmployeeWithCompany = {
  id: string
  role: EmployeeRole
  company_id: string
  company: {
    id: string
    name: string
    bin: string
    status: CompanyStatus
    rejection_reason: string | null
    documents: { name: string; url: string }[] | null
    resubmitted_at: string | null
  }
}

// Сотрудник (с компанией) текущего покупателя; null — покупатель не состоит в компании.
export async function findEmployeeForCustomer(
  scope: MedusaContainer,
  customerId: string
): Promise<StoreEmployeeWithCompany | null> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "customer",
    fields: ["employee.*", "employee.company.*"],
    filters: { id: customerId },
  })
  return (data[0]?.employee as StoreEmployeeWithCompany | undefined) ?? null
}

// Сотрудник текущего покупателя; 404 — покупатель не состоит в компании.
export async function requireEmployee(
  scope: MedusaContainer,
  customerId: string
): Promise<StoreEmployeeWithCompany> {
  const employee = await findEmployeeForCustomer(scope, customerId)
  if (!employee?.company) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Customer is not an employee of any company"
    )
  }
  return employee
}

// Право управлять компанией: вызывающий — её сотрудник-админ.
export async function requireCompanyAdmin(
  scope: MedusaContainer,
  customerId: string
): Promise<StoreEmployeeWithCompany> {
  const employee = await requireEmployee(scope, customerId)
  if (employee.role !== "admin") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Only a company admin can manage the company"
    )
  }
  return employee
}

// Сотрудник по id строго в рамках компании вызывающего; чужие/несуществующие — 404.
export async function requireEmployeeInCompany(
  scope: MedusaContainer,
  employeeId: string,
  companyId: string
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "employee",
    fields: ["id", "role", "company_id"],
    filters: { id: employeeId, company_id: companyId },
  })
  if (!data.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Employee ${employeeId} not found in the company`
    )
  }
  return data[0]
}

// Лимит по id строго у данного сотрудника; чужие/несуществующие — 404.
export async function requireSpendLimitOfEmployee(
  scope: MedusaContainer,
  spendLimitId: string,
  employeeId: string
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "spend_limit",
    fields: ["id", "employee_id"],
    filters: { id: spendLimitId, employee_id: employeeId },
  })
  if (!data.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Spend limit ${spendLimitId} not found for the employee`
    )
  }
  return data[0]
}
