import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { BONUS_MODULE } from "../../../modules/bonus"
import BonusModuleService from "../../../modules/bonus/service"
import { updateBonusConfigWorkflow } from "../../../workflows/update-bonus-config"
import { AdminUpdateBonusConfigType } from "./validators"

// Единый вид конфига наружу (без служебных полей mikro-orm).
const serializeConfig = (config: {
  id: string
  accrual_percent: number
  segment_percents: Record<string, unknown> | null
  max_spend_percent: number
  expiry_days: number | null
  expiry_notice_days: number
  return_window_days: number
  updated_at: Date | string
}) => ({
  id: config.id,
  accrual_percent: config.accrual_percent,
  segment_percents: (config.segment_percents ?? null) as Record<
    string,
    number
  > | null,
  max_spend_percent: config.max_spend_percent,
  expiry_days: config.expiry_days,
  expiry_notice_days: config.expiry_notice_days,
  return_window_days: config.return_window_days,
  updated_at: config.updated_at,
})

// GET /admin/bonus-config — настройки бонусной программы (singleton,
// создаётся лениво с дефолтами при первом обращении).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const bonusService = req.scope.resolve<BonusModuleService>(BONUS_MODULE)
  const config = await bonusService.getOrCreateConfig()
  res.json({ bonus_config: serializeConfig(config) })
}

// POST /admin/bonus-config — частичная правка настроек (проценты, потолок
// списания, сгорание, окно возврата).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateBonusConfigType>,
  res: MedusaResponse
) {
  const { result } = await updateBonusConfigWorkflow(req.scope).run({
    input: req.validatedBody,
    throwOnError: true,
  })
  res.json({ bonus_config: serializeConfig(result) })
}
