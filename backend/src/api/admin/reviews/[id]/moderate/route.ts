import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { moderateReviewWorkflow } from "../../../../../workflows/moderate-review"
import { serializeReviewForAdmin } from "../../../../utils/serialize-review"
import { AdminModerateReviewType } from "../../validators"

// POST /admin/reviews/:id/moderate — скрыть/опубликовать отзыв (модерация).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminModerateReviewType>,
  res: MedusaResponse
) {
  const { result } = await moderateReviewWorkflow(req.scope).run({
    input: { id: req.params.id, status: req.validatedBody.status },
    throwOnError: true,
  })
  res.json({ review: serializeReviewForAdmin(result) })
}
