import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { IUserModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { DRIVER_MODULE } from "../../../../modules/driver"
import DriverModuleService from "../../../../modules/driver/service"
import { DriverRecord } from "../../../../modules/driver/types"
import {
  loadDriverDeciderNames,
  toAdminDriverView,
} from "../driver-admin-view"

// GET /admin/drivers/:id — карточка водителя: профиль, который он заполнил
// сам, текущий допуск с причиной и кто это решение принял.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<DriverModuleService>(DRIVER_MODULE)
  const driver = (await service.retrieveDriver(req.params.id)) as DriverRecord

  const names = await loadDriverDeciderNames(
    req.scope.resolve<IUserModuleService>(Modules.USER),
    [driver]
  )

  res.json({ driver: toAdminDriverView(driver, names) })
}
