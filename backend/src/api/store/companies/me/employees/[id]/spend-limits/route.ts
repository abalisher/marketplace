import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createSpendLimitWorkflow } from "../../../../../../../workflows/create-spend-limit"
import {
  requireCompanyAdmin,
  requireEmployeeInCompany,
} from "../../../../helpers"
import { StoreCreateSpendLimitType } from "../../../../validators"

// POST /store/companies/me/employees/:id/spend-limits — назначить лимит
// сотруднику своей компании (только для админа).
export async function POST(
  req: AuthenticatedMedusaRequest<StoreCreateSpendLimitType>,
  res: MedusaResponse
) {
  const admin = await requireCompanyAdmin(req.scope, req.auth_context.actor_id)
  await requireEmployeeInCompany(req.scope, req.params.id, admin.company.id)

  const { result: spendLimit } = await createSpendLimitWorkflow(req.scope).run({
    input: {
      employee_id: req.params.id,
      ...req.validatedBody,
    },
    throwOnError: true,
  })

  res.status(201).json({ spend_limit: spendLimit })
}
