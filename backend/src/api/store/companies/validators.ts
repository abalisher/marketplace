import { z } from "@medusajs/framework/zod"
import { EMPLOYEE_ROLES } from "../../../modules/company/models/employee"
import { SPEND_LIMIT_PERIODS } from "../../../modules/company/models/spend-limit"

// Zod-схемы store-роутов компании. Подключаются в src/api/middlewares.ts
// через validateAndTransformBody; роуты читают req.validatedBody.

// Регистрация юрлица текущим покупателем (customer_id берётся из auth-контекста).
export const StoreCreateCompany = z.object({
  name: z.string().trim().min(1),
  // БИН — ровно 12 цифр (формат РК); уникальность проверяет БД.
  bin: z.string().regex(/^\d{12}$/, "BIN must be exactly 12 digits"),
  documents: z
    .array(z.object({ name: z.string().min(1), url: z.string().min(1) }))
    .optional(),
})
export type StoreCreateCompanyType = z.infer<typeof StoreCreateCompany>

// Принятие существующего customer в сотрудники компании вызывающего админа.
export const StoreCreateEmployee = z.object({
  customer_id: z.string().min(1),
  role: z.enum(EMPLOYEE_ROLES).optional(),
})
export type StoreCreateEmployeeType = z.infer<typeof StoreCreateEmployee>

// Назначение лимита сотруднику. Положительность суммы дублирует workflow —
// здесь ради ранней 400 без запуска workflow.
export const StoreCreateSpendLimit = z.object({
  amount: z.number().positive(),
  period: z.enum(SPEND_LIMIT_PERIODS),
  currency_code: z.string().trim().toLowerCase().length(3).optional(),
})
export type StoreCreateSpendLimitType = z.infer<typeof StoreCreateSpendLimit>
