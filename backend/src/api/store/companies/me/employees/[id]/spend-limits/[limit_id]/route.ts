import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { deleteSpendLimitWorkflow } from "../../../../../../../../workflows/delete-spend-limit"
import {
  requireCompanyAdmin,
  requireEmployeeInCompany,
  requireSpendLimitOfEmployee,
} from "../../../../../helpers"

// DELETE /store/companies/me/employees/:id/spend-limits/:limit_id —
// снять лимит с сотрудника своей компании (только для админа).
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const admin = await requireCompanyAdmin(req.scope, req.auth_context.actor_id)
  await requireEmployeeInCompany(req.scope, req.params.id, admin.company.id)
  await requireSpendLimitOfEmployee(
    req.scope,
    req.params.limit_id,
    req.params.id
  )

  await deleteSpendLimitWorkflow(req.scope).run({
    input: { id: req.params.limit_id },
    throwOnError: true,
  })

  res.json({ id: req.params.limit_id, object: "spend_limit", deleted: true })
}
