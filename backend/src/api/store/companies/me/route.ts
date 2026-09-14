import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { updateCompanyApplicationWorkflow } from "../../../../workflows/update-company-application"
import { requireCompanyAdmin, requireEmployee } from "../helpers"
import { StoreUpdateCompanyApplicationType } from "../validators"

// GET /store/companies/me — компания текущего покупателя и его роль в ней.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { company, ...employee } = await requireEmployee(
    req.scope,
    req.auth_context.actor_id
  )

  res.json({ company, employee })
}

// POST /store/companies/me — правка собственной заявки админом компании:
// исправить реквизиты после отказа модератора и/или догрузить учредительные
// документы. Отклонённая заявка при этом возвращается в очередь модерации.
export async function POST(
  req: AuthenticatedMedusaRequest<StoreUpdateCompanyApplicationType>,
  res: MedusaResponse
) {
  const employee = await requireCompanyAdmin(
    req.scope,
    req.auth_context.actor_id
  )

  const { result } = await updateCompanyApplicationWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      company_id: employee.company_id,
    },
    throwOnError: true,
  })

  res.json({ company: result })
}
