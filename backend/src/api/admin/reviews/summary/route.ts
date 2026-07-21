import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEWS_MODULE } from "../../../../modules/reviews"
import ReviewsModuleService from "../../../../modules/reviews/service"

// GET /admin/reviews/summary — сводка рейтинга по объектам (поставщик/доставка):
// среднее и количество опубликованных отзывов. Для дашборда/страницы рейтинга.
// Статический сегмент summary не конфликтует с /admin/reviews/:id/... (иная глубина).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const reviewsService =
    req.scope.resolve<ReviewsModuleService>(REVIEWS_MODULE)
  const [supplier, delivery] = await Promise.all([
    reviewsService.getRatingSummary("supplier"),
    reviewsService.getRatingSummary("delivery"),
  ])
  res.json({ summaries: [supplier, delivery] })
}
