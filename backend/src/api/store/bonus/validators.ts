import { z } from "@medusajs/framework/zod"

// Zod-схемы store-роута бонусного счёта.

// История операций: только пагинация, новые первыми.
export const StoreGetBonusParams = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})
export type StoreGetBonusParamsType = z.infer<typeof StoreGetBonusParams>
