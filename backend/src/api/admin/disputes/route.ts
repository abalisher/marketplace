import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEWS_MODULE } from "../../../modules/reviews"
import ReviewsModuleService from "../../../modules/reviews/service"
import {
  DISPUTE_STATUSES,
  DisputeStatus,
} from "../../../modules/reviews/models/constants"
import { serializeDisputeForAdmin } from "../../utils/serialize-review"

// GET /admin/disputes — очередь диспутов оператора: фильтр по статусу (дефолт —
// активные open+in_review, FIFO по created_at), пагинация. Отдельный ресурс.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const reviewsService =
    req.scope.resolve<ReviewsModuleService>(REVIEWS_MODULE)

  const statusParam = req.query.status as string | undefined
  const filters: { status?: DisputeStatus | DisputeStatus[] } = {}
  if (statusParam) {
    if (!(DISPUTE_STATUSES as readonly string[]).includes(statusParam)) {
      res.status(400).json({ message: `Unknown status: ${statusParam}` })
      return
    }
    filters.status = statusParam as DisputeStatus
  } else {
    // По умолчанию — активные (незакрытые) диспуты.
    filters.status = ["open", "in_review"]
  }

  const limit = Math.min(Number(req.query.limit) || 20, 100)
  const offset = Number(req.query.offset) || 0

  const [disputes, count] = await reviewsService.listAndCountDisputes(
    filters,
    { skip: offset, take: limit, order: { created_at: "ASC" } }
  )

  res.json({
    disputes: disputes.map(serializeDisputeForAdmin),
    count,
    offset,
    limit,
  })
}
