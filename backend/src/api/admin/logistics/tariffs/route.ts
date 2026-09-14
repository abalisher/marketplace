import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { LOGISTICS_MODULE } from "../../../../modules/logistics"
import LogisticsModuleService from "../../../../modules/logistics/service"
import { upsertDeliveryTariffWorkflow } from "../../../../workflows/upsert-delivery-tariff"
import { AdminUpsertDeliveryTariffType } from "../validators"
import { serializeTariff } from "../serializers"

// GET /admin/logistics/tariffs — администрируемая сетка тарифов доставки.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
  const tariffs = await service.listDeliveryTariffs(
    {},
    { order: { zone: "ASC" } }
  )
  res.json({ tariffs: tariffs.map(serializeTariff) })
}

// POST /admin/logistics/tariffs — создать/править тариф (upsert по zone).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpsertDeliveryTariffType>,
  res: MedusaResponse
) {
  const { result } = await upsertDeliveryTariffWorkflow(req.scope).run({
    input: req.validatedBody,
    throwOnError: true,
  })
  res.json({ tariff: serializeTariff(result) })
}
