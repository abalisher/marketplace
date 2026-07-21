import { z } from "@medusajs/framework/zod"

// Ручная корректировка лимита отсрочки компании. manual_limit=null — сброс
// (действует вычисленный лимит). note — аудит изменения (ТЗ 5.3).
export const AdminSetCreditLimit = z.object({
  manual_limit: z.number().min(0).nullable(),
  note: z.string().trim().min(1).max(1000).optional(),
})
export type AdminSetCreditLimitType = z.infer<typeof AdminSetCreditLimit>
