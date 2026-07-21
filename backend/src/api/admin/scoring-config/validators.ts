import { z } from "@medusajs/framework/zod"

// Частичная правка настраиваемых правил скоринга. Все поля опциональны; веса/
// потолки — неотрицательные, порог балла — 0..100, суммы — неотрицательные.
export const AdminUpdateScoringConfig = z.object({
  points_per_order: z.number().min(0).optional(),
  max_orders_points: z.number().min(0).max(100).optional(),
  volume_per_point: z.number().min(1).optional(),
  max_volume_points: z.number().min(0).max(100).optional(),
  days_per_point: z.number().min(1).optional(),
  max_tenure_points: z.number().min(0).max(100).optional(),
  penalty_per_return: z.number().min(0).optional(),
  min_score_for_credit: z.number().min(0).max(100).optional(),
  base_limit: z.number().min(0).optional(),
  limit_per_score_point: z.number().min(0).optional(),
  max_limit: z.number().min(0).optional(),
})
export type AdminUpdateScoringConfigType = z.infer<
  typeof AdminUpdateScoringConfig
>
