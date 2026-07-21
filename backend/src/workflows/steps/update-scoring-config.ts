import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { SCORING_MODULE } from "../../modules/scoring"
import ScoringModuleService from "../../modules/scoring/service"

export type UpdateScoringConfigStepInput = {
  points_per_order?: number
  max_orders_points?: number
  volume_per_point?: number
  max_volume_points?: number
  days_per_point?: number
  max_tenure_points?: number
  penalty_per_return?: number
  min_score_for_credit?: number
  base_limit?: number
  limit_per_score_point?: number
  max_limit?: number
}

// Правка конфига-singleton скоринга (создаётся лениво с дефолтами). Компенсация —
// откат изменённых полей к значениям на момент шага (идиома update-bonus-config).
export const updateScoringConfigStep = createStep(
  "update-scoring-config",
  async (input: UpdateScoringConfigStepInput, { container }) => {
    const scoringService =
      container.resolve<ScoringModuleService>(SCORING_MODULE)
    const config = await scoringService.getOrCreateConfig()

    const previous = {
      id: config.id,
      points_per_order: config.points_per_order,
      max_orders_points: config.max_orders_points,
      volume_per_point: config.volume_per_point,
      max_volume_points: config.max_volume_points,
      days_per_point: config.days_per_point,
      max_tenure_points: config.max_tenure_points,
      penalty_per_return: config.penalty_per_return,
      min_score_for_credit: config.min_score_for_credit,
      base_limit: config.base_limit,
      limit_per_score_point: config.limit_per_score_point,
      max_limit: config.max_limit,
    }
    const updated = await scoringService.updateScoringConfigs({
      id: config.id,
      ...input,
    })
    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const scoringService =
      container.resolve<ScoringModuleService>(SCORING_MODULE)
    await scoringService.updateScoringConfigs(previous)
  }
)
