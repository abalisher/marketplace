import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { submitProductForModerationWorkflow } from "../../../../../../workflows/submit-product-for-moderation"

// POST /admin/products/:id/moderation/submit — отправить карточку на
// модерацию (продавец): draft|rejected → proposed, сертификаты обязательны.
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { result: product } = await submitProductForModerationWorkflow(
    req.scope
  ).run({
    input: { product_id: req.params.id },
    throwOnError: true,
  })

  res.json({ product })
}
