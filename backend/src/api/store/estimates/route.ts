import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createEstimateWorkflow } from "../../../workflows/create-estimate"
import { serializeEstimate } from "./helpers"
import { StoreCreateEstimateType } from "./validators"

// POST /store/estimates — расчёт материалов покупателем по ручным параметрам
// (MVP). Гость допускается (расчёт рекомендательный, customer_id опционален —
// проставляется, если запрос от залогиненного покупателя).
export async function POST(
  req: AuthenticatedMedusaRequest<StoreCreateEstimateType>,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id ?? null
  const { result } = await createEstimateWorkflow(req.scope).run({
    input: {
      customer_id: customerId,
      params: req.validatedBody.params,
      norm_codes: req.validatedBody.norm_codes,
      note: req.validatedBody.note ?? null,
    },
    throwOnError: true,
  })
  res.status(201).json({ estimate: serializeEstimate(result) })
}
