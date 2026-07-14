import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { COMPANY_MODULE } from "../../../modules/company"
import CompanyModuleService from "../../../modules/company/service"
import { AdminGetCompaniesParamsType } from "./validators"

// GET /admin/companies — список компаний для модерации: фильтр по статусу,
// поиск q (по searchable-полям name/bin), сортировка (дефолт — очередь FIFO
// по created_at). Через сервис модуля, а не query.graph: q поддерживают
// только сгенерированные list-методы.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { status, q, order, limit, offset } =
    req.validatedQuery as AdminGetCompaniesParamsType

  const field = order.replace(/^-/, "")
  const direction = order.startsWith("-") ? ("DESC" as const) : ("ASC" as const)

  const service = req.scope.resolve<CompanyModuleService>(COMPANY_MODULE)
  const [companies, count] = await service.listAndCountCompanies(
    {
      ...(status ? { status } : {}),
      ...(q ? { q } : {}),
    },
    {
      take: limit,
      skip: offset,
      order: { [field]: direction },
    }
  )

  res.json({ companies, count, offset, limit })
}
