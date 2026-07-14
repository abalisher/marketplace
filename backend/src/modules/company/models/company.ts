import { model } from "@medusajs/framework/utils"
import Employee from "./employee"

// Статусы модерации юрлица: регистрируется само, но лимиты/отсрочка
// активируются только после одобрения админом (см. docs/modules/company.md).
export const COMPANY_STATUSES = ["pending", "approved", "rejected"] as const
export type CompanyStatus = (typeof COMPANY_STATUSES)[number]

// Компания-покупатель (юрлицо): реквизиты, учредительные документы, статус модерации.
const Company = model.define("company", {
  id: model.id({ prefix: "comp" }).primaryKey(),
  name: model.text().searchable(),
  // БИН — 12 цифр, уникален; формат валидируется на уровне API/workflow.
  bin: model.text().unique().searchable(),
  // Спред — копия readonly-кортежа: model.enum не принимает readonly-массив.
  status: model.enum([...COMPANY_STATUSES]).default("pending"),
  // Комментарий админа при отклонении; для pending/approved — null.
  rejection_reason: model.text().nullable(),
  // Учредительные документы: массив { name, url } (файлы лежат в file-провайдере Medusa).
  documents: model.json().nullable(),
  employees: model.hasMany(() => Employee, { mappedBy: "company" }),
})

export default Company
