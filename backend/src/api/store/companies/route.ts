import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createCompanyWorkflow } from "../../../workflows/create-company"
import { StoreCreateCompanyType } from "./validators"

// POST /store/companies — регистрация юрлица текущим покупателем.
// Компания создаётся в статусе pending, покупатель становится сотрудником-админом.
export async function POST(
  req: AuthenticatedMedusaRequest<StoreCreateCompanyType>,
  res: MedusaResponse
) {
  const { result } = await createCompanyWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      customer_id: req.auth_context.actor_id,
    },
    throwOnError: true,
  })

  res.status(201).json(result)
}
