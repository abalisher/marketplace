import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEWS_MODULE } from "../../../../modules/reviews"
import ReviewsModuleService from "../../../../modules/reviews/service"
import { loadChannelOrderIds } from "../../../../lib/tenants/scope"
import { getTenantScope } from "../../../utils/tenant-access"

// GET /admin/reviews/summary — сводка рейтинга по объектам (поставщик/доставка):
// среднее и количество опубликованных отзывов. Для дашборда/страницы рейтинга.
// Статический сегмент summary не конфликтует с /admin/reviews/:id/... (иная глубина).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const reviewsService =
    req.scope.resolve<ReviewsModuleService>(REVIEWS_MODULE)
  // Продавец компании видит рейтинг только по заказам своего канала.
  const tenant = getTenantScope(req)
  const orderIds = tenant
    ? await loadChannelOrderIds(req.scope, tenant.sales_channel_id)
    : undefined
  const [supplier, delivery] = await Promise.all([
    reviewsService.getRatingSummary("supplier", orderIds),
    reviewsService.getRatingSummary("delivery", orderIds),
  ])
  res.json({ summaries: [supplier, delivery] })
}
