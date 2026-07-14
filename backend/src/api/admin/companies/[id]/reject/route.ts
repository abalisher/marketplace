import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { rejectCompanyWorkflow } from "../../../../../workflows/reject-company"
import { AdminRejectCompanyType } from "../../validators"

// POST /admin/companies/:id/reject — отклонить компанию с обязательным
// комментарием (модерация).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminRejectCompanyType>,
  res: MedusaResponse
) {
  const { result: company } = await rejectCompanyWorkflow(req.scope).run({
    input: { id: req.params.id, reason: req.validatedBody.reason },
    throwOnError: true,
  })

  res.json({ company })
}
