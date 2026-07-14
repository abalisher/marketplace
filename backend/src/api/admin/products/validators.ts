import { z } from "@medusajs/framework/zod"
import { PRODUCT_SEGMENTS } from "../../../modules/catalog/models/product-card"

// Zod-схемы admin-роутов модерации карточек товара.

// Отклонение карточки — комментарий обязателен (требование ТЗ).
export const AdminRejectProductCard = z.object({
  reason: z.string().trim().min(1),
})
export type AdminRejectProductCardType = z.infer<typeof AdminRejectProductCard>

// Создание/правка карточки (upsert): сегмент и ед. изм. обязательны,
// сертификаты опциональны (обязательными становятся при отправке на
// модерацию — валидация в submit-workflow).
export const AdminUpsertProductCard = z.object({
  segment: z.enum([...PRODUCT_SEGMENTS]),
  unit: z.string().trim().min(1),
  certificates: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        url: z.string().trim().min(1),
      })
    )
    .optional(),
})
export type AdminUpsertProductCardType = z.infer<typeof AdminUpsertProductCard>
