import { z } from "@medusajs/framework/zod"

// Перевод диспута оператором по стейт-машине. Целевой статус — нетерминальный
// in_review или терминальные resolved|rejected (open — только начальный, задать
// его переходом нельзя). Проверку допустимости из ТЕКУЩЕГО статуса делает сервис.
export const AdminTransitionDispute = z.object({
  to: z.enum(["in_review", "resolved", "rejected"]),
  resolution: z.string().trim().min(1).max(4000).optional(),
})
export type AdminTransitionDisputeType = z.infer<typeof AdminTransitionDispute>
