import { z } from "@medusajs/framework/zod"
import { PRODUCT_SEGMENTS } from "../../../modules/catalog/models/product-card"

// Zod-схемы кастомных store-роутов каталога.

// Значение сегмента (валидируется в middleware filterProductsBySegment,
// сам параметр вырезается из query до ядрового валидатора).
export const StoreProductSegment = z.enum(PRODUCT_SEGMENTS)

// Подбор альтернатив: только размер выдачи.
export const StoreGetAlternativesParams = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
})
export type StoreGetAlternativesParamsType = z.infer<
  typeof StoreGetAlternativesParams
>
