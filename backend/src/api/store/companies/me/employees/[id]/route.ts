import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { deleteEmployeeWorkflow } from "../../../../../../workflows/delete-employee"
import { requireCompanyAdmin, requireEmployeeInCompany } from "../../../helpers"

// DELETE /store/companies/me/employees/:id — уволить сотрудника своей
// компании (только для админа). Админ не может удалить сам себя —
// компания осталась бы без управляющего.
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const admin = await requireCompanyAdmin(req.scope, req.auth_context.actor_id)

  if (req.params.id === admin.id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Company admin cannot remove themselves"
    )
  }
  await requireEmployeeInCompany(req.scope, req.params.id, admin.company.id)

  await deleteEmployeeWorkflow(req.scope).run({
    input: { id: req.params.id },
    throwOnError: true,
  })

  res.json({ id: req.params.id, object: "employee", deleted: true })
}
