import { z } from "@medusajs/framework/zod"

// Создание расчёта материалов покупателем (MVP — ручные параметры). Все
// измерители опциональны и неотрицательны; norm_codes сужает набор нормативов
// (иначе — все активные). source по умолчанию manual (file/voice — ИИ-этап).
export const StoreCreateEstimate = z.object({
  params: z
    .object({
      area: z.number().min(0).optional(),
      volume: z.number().min(0).optional(),
      length: z.number().min(0).optional(),
      height: z.number().min(0).optional(),
      count: z.number().min(0).optional(),
    })
    .default({}),
  norm_codes: z.array(z.string().min(1)).optional(),
  note: z.string().trim().min(1).max(2000).optional(),
})
export type StoreCreateEstimateType = z.infer<typeof StoreCreateEstimate>
