import { z } from "@medusajs/framework/zod"
import {
  REVIEW_STATUSES,
  REVIEW_TARGETS,
} from "../../../modules/reviews/models/constants"

// Раздел «Отзывы»: фильтры по объекту оценки (поставщик/доставка) и видимости,
// поиск по номеру заказа, почте покупателя и тексту отзыва, пагинация.
export const AdminGetReviewsParams = z.object({
  target: z.enum(REVIEW_TARGETS).optional(),
  status: z.enum(REVIEW_STATUSES).optional(),
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
export type AdminGetReviewsParamsType = z.infer<typeof AdminGetReviewsParams>

// Модерация видимости отзыва: published (показать) | hidden (скрыть).
export const AdminModerateReview = z.object({
  status: z.enum(["published", "hidden"]),
})
export type AdminModerateReviewType = z.infer<typeof AdminModerateReview>
