import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { requireEmployee } from "../helpers"

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
