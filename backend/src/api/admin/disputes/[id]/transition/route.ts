import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { transitionDisputeWorkflow } from "../../../../../workflows/transition-dispute"
import { serializeDisputeForAdmin } from "../../../../utils/serialize-review"
import { AdminTransitionDisputeType } from "../../validators"

// POST /admin/disputes/:id/transition — ведение диспута оператором по стейт-
// машине (in_review/resolved/rejected). Недопустимый переход → 400 (сервис).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminTransitionDisputeType>,
  res: MedusaResponse
) {
  const { result } = await transitionDisputeWorkflow(req.scope).run({
    input: {
      id: req.params.id,
      to: req.validatedBody.to,
      resolution: req.validatedBody.resolution ?? null,
    },
    throwOnError: true,
  })
  res.json({ dispute: serializeDisputeForAdmin(result) })
}
