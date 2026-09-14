import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { REVIEWS_MODULE } from "../../../modules/reviews"
import ReviewsModuleService from "../../../modules/reviews/service"
import {
  REVIEW_STATUSES,
  REVIEW_TARGETS,
  ReviewStatus,
} from "../../../modules/reviews/models/constants"
import { serializeReviewForAdmin } from "../../utils/serialize-review"
import { loadRowOrders } from "../order-lifecycles/rows"
import { AdminGetReviewsParamsType } from "./validators"

// GET /admin/reviews — раздел «Отзывы» панели продавца (T4.11, блокер 4 Асель:
// «раздела отзывов и действий с ними нет» — до этого отзыв можно было увидеть
// только внизу карточки своего заказа). Список с фильтрами по объекту оценки и
// видимости, поиск, пагинация; модерация — POST /admin/reviews/:id/moderate.
//
// Строка несёт номер заказа и имя покупателя (сборка — order-lifecycles/rows.ts):
// отзыв без заказа и покупателя оператору бесполезен, а технических id на
// экране быть не должно.

const SEARCH_MATCH_CAP = 100

// Поиск: заказ (номер/почта покупателя) ИЛИ текст отзыва — как в очереди
// претензий (кросс-модульного фильтра по заказу у списка отзывов нет).
async function findReviewIdsBySearch(
  reviewsService: ReviewsModuleService,
  query: Omit<RemoteQueryFunction, symbol>,
  q: string
): Promise<string[]> {
  const orderFilters: Record<string, unknown>[] = [
    { email: { $ilike: `%${q}%` } },
  ]
  const displayId = Number(q.replace(/^#/, ""))
  if (Number.isSafeInteger(displayId) && displayId > 0) {
    orderFilters.push({ display_id: displayId })
  }

  const orderIds = new Set<string>()
  for (const filters of orderFilters) {
    const { data } = await query.graph({
      entity: "order",
      fields: ["id"],
      filters,
      pagination: { skip: 0, take: SEARCH_MATCH_CAP },
    })
    for (const order of data as { id: string }[]) {
      orderIds.add(order.id)
    }
  }

  const [byText, byOrder] = await Promise.all([
    reviewsService.listReviews(
      { comment: { $ilike: `%${q}%` } },
      { take: SEARCH_MATCH_CAP, select: ["id"] }
    ),
    orderIds.size
      ? reviewsService.listReviews(
          { order_id: [...orderIds] },
          { take: SEARCH_MATCH_CAP, select: ["id"] }
        )
      : Promise.resolve([]),
  ])

  return [...new Set([...byText, ...byOrder].map((review) => review.id))]
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { target, status, q, limit, offset } =
    req.validatedQuery as AdminGetReviewsParamsType

  const reviewsService =
    req.scope.resolve<ReviewsModuleService>(REVIEWS_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const baseFilters: Record<string, unknown> = {}
  if (target) {
    baseFilters.target = target
  }

  if (q) {
    const ids = await findReviewIdsBySearch(reviewsService, query, q)
    if (!ids.length) {
      res.json({
        reviews: [],
        counts: { total: 0, published: 0, hidden: 0 },
        summaries: [],
        count: 0,
        offset,
        limit,
      })
      return
    }
    baseFilters.id = ids
  }

  const filters: Record<string, unknown> = { ...baseFilters }
  if (status) {
    filters.status = status
  }

  // Счётчики видимости при текущих прочих фильтрах — по одному запросу на
  // статус (идиома счётчиков очереди заказов): нужен точный count.
  const countFor = async (value?: ReviewStatus) => {
    const [, count] = await reviewsService.listAndCountReviews(
      value ? { ...baseFilters, status: value } : baseFilters,
      { select: ["id"], take: 1 }
    )
    return count
  }

  const [[reviews, count], total, ...statusCounts] = await Promise.all([
    reviewsService.listAndCountReviews(filters, {
      skip: offset,
      take: limit,
      // Свежие сверху: отзыв — это лента, а не очередь на разбор.
      order: { created_at: "DESC" },
    }),
    countFor(),
    ...REVIEW_STATUSES.map((value) => countFor(value)),
    ])

  const rows = await loadRowOrders(
    query,
    req.scope.resolve(Modules.ORDER),
    [...new Set(reviews.map((review) => review.order_id))]
  )

  const summaries = await Promise.all(
    REVIEW_TARGETS.map((value) => reviewsService.getRatingSummary(value))
  )

  res.json({
    reviews: reviews.map((review) => ({
      ...serializeReviewForAdmin(review),
      order: rows.get(review.order_id) ?? null,
    })),
    counts: {
      total,
      published: statusCounts[REVIEW_STATUSES.indexOf("published")],
      hidden: statusCounts[REVIEW_STATUSES.indexOf("hidden")],
    },
    summaries,
    count,
    offset,
    limit,
  })
}
