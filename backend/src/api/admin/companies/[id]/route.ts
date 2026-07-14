import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

// GET /admin/companies/:id — карточка компании с сотрудниками
// (данные customer и лимиты) для экрана модерации.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "company",
    fields: [
      "*",
      "employees.id",
      "employees.role",
      "employees.created_at",
      "employees.customer.id",
      "employees.customer.email",
      "employees.customer.first_name",
      "employees.customer.last_name",
      "employees.spend_limits.*",
    ],
    filters: { id: req.params.id },
  })

  if (!data.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Company ${req.params.id} not found`
    )
  }

  res.json({ company: data[0] })
}
