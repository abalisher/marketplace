import { z } from "@medusajs/framework/zod"

// Создание/правка норматива расхода (upsert по code). base — база расхода;
// consumption_per_unit > 0; category_id nullable (для подборки по каталогу).
export const AdminUpsertMaterialNorm = z.object({
  code: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1),
  work_type: z.string().trim().min(1),
  material_kind: z.string().trim().min(1),
  base: z.enum(["area", "volume", "length", "count"]),
  consumption_per_unit: z.number().positive(),
  unit: z.string().trim().min(1),
  category_id: z.string().trim().min(1).nullable().optional(),
  active: z.boolean().optional(),
  note: z.string().trim().min(1).max(2000).nullable().optional(),
})
export type AdminUpsertMaterialNormType = z.infer<
  typeof AdminUpsertMaterialNorm
>
