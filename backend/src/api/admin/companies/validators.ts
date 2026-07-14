import { z } from "@medusajs/framework/zod"
import { COMPANY_STATUSES } from "../../../modules/company/models/company"

// Zod-схемы admin-роутов компании (очередь модерации).

// Поля сортировки списка (префикс «-» — по убыванию, конвенция Medusa).
export const COMPANY_ORDER_FIELDS = [
  "created_at",
  "-created_at",
  "name",
  "-name",
] as const

// Фильтры списка компаний: статус + поиск + сортировка + пагинация.
export const AdminGetCompaniesParams = z.object({
  status: z.enum(COMPANY_STATUSES).optional(),
  q: z.string().trim().min(1).optional(),
  order: z.enum(COMPANY_ORDER_FIELDS).default("created_at"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
export type AdminGetCompaniesParamsType = z.infer<
  typeof AdminGetCompaniesParams
>

// Отклонение компании — комментарий обязателен (требование ТЗ).
export const AdminRejectCompany = z.object({
  reason: z.string().trim().min(1),
})
export type AdminRejectCompanyType = z.infer<typeof AdminRejectCompany>
