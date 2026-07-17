import { z } from "@medusajs/framework/zod"

// Zod-схема правки конфига бонусной программы. Все поля опциональны —
// частичное обновление; segment_percents/expiry_days принимают null
// (сбросить переопределения / выключить сгорание).
export const AdminUpdateBonusConfig = z.object({
  accrual_percent: z.number().min(0).max(100).optional(),
  segment_percents: z
    .record(z.string().min(1), z.number().min(0).max(100))
    .nullable()
    .optional(),
  max_spend_percent: z.number().min(0).max(100).optional(),
  expiry_days: z.number().int().min(1).max(3650).nullable().optional(),
  expiry_notice_days: z.number().int().min(0).max(365).optional(),
  return_window_days: z.number().int().min(0).max(365).optional(),
})
export type AdminUpdateBonusConfigType = z.infer<typeof AdminUpdateBonusConfig>
