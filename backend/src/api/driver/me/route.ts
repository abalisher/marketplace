import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { DRIVER_MODULE } from "../../../modules/driver"
import DriverModuleService from "../../../modules/driver/service"
import { DriverRecord } from "../../../modules/driver/types"
import { updateDriverProfileWorkflow } from "../../../workflows/update-driver-profile"
import { toDriverView } from "../driver-view"
import { DriverUpdateProfileType } from "./validators"

// GET /driver/me — свой профиль и свой допуск (T5.1). Водитель ходит только за
// собой: id берётся из токена (actor_id), параметром его передать нельзя.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<DriverModuleService>(DRIVER_MODULE)
  const driver = (await service.retrieveDriver(
    req.auth_context.actor_id
  )) as DriverRecord

  res.json({ driver: toDriverView(driver) })
}

// POST /driver/me — водитель заполняет/правит профиль: ФИО, машина,
// грузоподъёмность. Допуск здесь не меняется: заявку рассматривает продавец
// (POST /admin/drivers/:id/status) — иначе водитель допускал бы себя сам.
export async function POST(
  req: AuthenticatedMedusaRequest<DriverUpdateProfileType>,
  res: MedusaResponse
) {
  const { result } = await updateDriverProfileWorkflow(req.scope).run({
    input: {
      driver_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
    throwOnError: true,
  })

  res.json({ driver: toDriverView(result) })
}
