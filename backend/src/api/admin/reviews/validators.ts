import { z } from "@medusajs/framework/zod"

// Модерация видимости отзыва: published (показать) | hidden (скрыть).
export const AdminModerateReview = z.object({
  status: z.enum(["published", "hidden"]),
})
export type AdminModerateReviewType = z.infer<typeof AdminModerateReview>
