import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { IUserModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { DRIVER_MODULE } from "../../../modules/driver"
import DriverModuleService from "../../../modules/driver/service"
import { DriverRecord } from "../../../modules/driver/types"
import {
  loadDriverDeciderNames,
  toAdminDriverView,
} from "./driver-admin-view"
import { AdminGetDriversParamsType } from "./validators"

// GET /admin/drivers — водители и их заявки на допуск (T5.1). Водитель-gig
// регистрируется сам, поэтому очередь идёт FIFO: кто подал заявку раньше, тот
// и первый на проверку.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { status, q, limit, offset } =
    req.validatedQuery as unknown as AdminGetDriversParamsType

  const service = req.scope.resolve<DriverModuleService>(DRIVER_MODULE)

  const filters: Record<string, unknown> = {}
  if (status) {
    filters.status = status
  }
  if (q) {
    // Продавец ищет по тому, что знает: номер телефона или ФИО.
    filters.$or = [
      { phone: { $ilike: `%${q}%` } },
      { full_name: { $ilike: `%${q}%` } },
    ]
  }

  const [drivers, count] = await service.listAndCountDrivers(filters, {
    skip: offset,
    take: limit,
    order: { created_at: "ASC" },
  })

  // Имена решивших — одним запросом на страницу, а не по водителю в строке.
  const names = await loadDriverDeciderNames(
    req.scope.resolve<IUserModuleService>(Modules.USER),
    drivers as DriverRecord[]
  )

  res.json({
    drivers: (drivers as DriverRecord[]).map((driver) =>
      toAdminDriverView(driver, names)
    ),
    count,
    offset,
    limit,
  })
}
