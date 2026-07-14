import { model } from "@medusajs/framework/utils"
import Company from "./company"
import SpendLimit from "./spend-limit"

// Роли внутри компании-покупателя: админ управляет сотрудниками и лимитами,
// сотрудник оформляет заявки строго в рамках лимита.
export const EMPLOYEE_ROLES = ["admin", "member"] as const
export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number]

// Сотрудник компании. Привязка к customer ядра — через module link
// (src/links/), прямого FK на customer здесь нет намеренно.
const Employee = model.define("employee", {
  id: model.id({ prefix: "emp" }).primaryKey(),
  // Спред — копия readonly-кортежа: model.enum не принимает readonly-массив.
  role: model.enum([...EMPLOYEE_ROLES]).default("member"),
  company: model.belongsTo(() => Company, { mappedBy: "employees" }),
  spend_limits: model.hasMany(() => SpendLimit, { mappedBy: "employee" }),
})

export default Employee
