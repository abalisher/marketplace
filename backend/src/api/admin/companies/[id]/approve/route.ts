import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { approveCompanyWorkflow } from "../../../../../workflows/approve-company"

// POST /admin/companies/:id/approve — одобрить компанию (модерация).
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { result: company } = await approveCompanyWorkflow(req.scope).run({
    input: { id: req.params.id },
    throwOnError: true,
  })

  res.json({ company })
}
