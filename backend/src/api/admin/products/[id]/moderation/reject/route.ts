import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { rejectProductCardWorkflow } from "../../../../../../workflows/reject-product-card"
import { AdminRejectProductCardType } from "../../../validators"

// POST /admin/products/:id/moderation/reject — отклонить карточку (модерация):
// proposed → rejected, комментарий обязателен (виден продавцу).
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { reason } = req.validatedBody as AdminRejectProductCardType

  const { result: product } = await rejectProductCardWorkflow(req.scope).run({
    input: { product_id: req.params.id, reason },
    throwOnError: true,
  })

  res.json({ product })
}
