import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SCORING_MODULE } from "../../../modules/scoring"
import ScoringModuleService from "../../../modules/scoring/service"
import { updateScoringConfigWorkflow } from "../../../workflows/update-scoring-config"
import { AdminUpdateScoringConfigType } from "./validators"

// Числовые поля наружу — числами (bigNumber-поля модели приводим).
const serializeConfig = (config: Record<string, unknown> & { id: string }) => ({
  id: config.id,
  points_per_order: Number(config.points_per_order),
  max_orders_points: Number(config.max_orders_points),
  volume_per_point: Number(config.volume_per_point),
  max_volume_points: Number(config.max_volume_points),
  days_per_point: Number(config.days_per_point),
  max_tenure_points: Number(config.max_tenure_points),
  penalty_per_return: Number(config.penalty_per_return),
  min_score_for_credit: Number(config.min_score_for_credit),
  base_limit: Number(config.base_limit),
  limit_per_score_point: Number(config.limit_per_score_point),
  max_limit: Number(config.max_limit),
})

// GET /admin/scoring-config — настраиваемые правила скоринга (singleton, лениво
// с дефолтами). Admin-конфиг только для веб-админки — контракт/Dart не трогаем.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const scoringService =
    req.scope.resolve<ScoringModuleService>(SCORING_MODULE)
  const config = await scoringService.getOrCreateConfig()
  res.json({ scoring_config: serializeConfig(config) })
}

// POST /admin/scoring-config — частичная правка правил.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateScoringConfigType>,
  res: MedusaResponse
) {
  const { result } = await updateScoringConfigWorkflow(req.scope).run({
    input: req.validatedBody,
    throwOnError: true,
  })
  res.json({ scoring_config: serializeConfig(result) })
}
