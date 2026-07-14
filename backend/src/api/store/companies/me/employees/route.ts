import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createEmployeeWorkflow } from "../../../../../workflows/create-employee"
import { requireCompanyAdmin } from "../../helpers"
import { StoreCreateEmployeeType } from "../../validators"

// GET /store/companies/me/employees — сотрудники компании с их лимитами
// и данными customer (только для админа компании).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const admin = await requireCompanyAdmin(req.scope, req.auth_context.actor_id)

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: employees } = await query.graph({
    entity: "employee",
    fields: [
      "id",
      "role",
      "created_at",
      "customer.id",
      "customer.email",
      "customer.first_name",
      "customer.last_name",
      "spend_limits.*",
    ],
    filters: { company_id: admin.company.id },
  })

  res.json({ employees })
}

// POST /store/companies/me/employees — принять существующего customer
// в компанию (только для админа компании).
export async function POST(
  req: AuthenticatedMedusaRequest<StoreCreateEmployeeType>,
  res: MedusaResponse
) {
  const admin = await requireCompanyAdmin(req.scope, req.auth_context.actor_id)

  const { result: employee } = await createEmployeeWorkflow(req.scope).run({
    input: {
      company_id: admin.company.id,
      ...req.validatedBody,
    },
    throwOnError: true,
  })

  res.status(201).json({ employee })
}
