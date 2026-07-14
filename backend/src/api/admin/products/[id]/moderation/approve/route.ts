import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { approveProductCardWorkflow } from "../../../../../../workflows/approve-product-card"

// POST /admin/products/:id/moderation/approve — одобрить карточку (модерация):
// proposed → published, комментарий прошлого отклонения сбрасывается.
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { result: product } = await approveProductCardWorkflow(req.scope).run({
    input: { product_id: req.params.id },
    throwOnError: true,
  })

  res.json({ product })
}
