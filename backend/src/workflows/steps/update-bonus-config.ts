import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BONUS_MODULE } from "../../modules/bonus"
import BonusModuleService from "../../modules/bonus/service"

export type UpdateBonusConfigStepInput = {
  accrual_percent?: number
  segment_percents?: Record<string, number> | null
  max_spend_percent?: number
  expiry_days?: number | null
  expiry_notice_days?: number
  return_window_days?: number
}

// Правка конфига-singleton бонусной программы (строка создаётся лениво с
// дефолтами, если её ещё нет). Компенсация — откат изменённых полей к
// значениям на момент шага.
export const updateBonusConfigStep = createStep(
  "update-bonus-config",
  async (input: UpdateBonusConfigStepInput, { container }) => {
    const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)
    const config = await bonusService.getOrCreateConfig()

    const previous = {
      id: config.id,
      accrual_percent: config.accrual_percent,
      segment_percents: config.segment_percents,
      max_spend_percent: config.max_spend_percent,
      expiry_days: config.expiry_days,
      expiry_notice_days: config.expiry_notice_days,
      return_window_days: config.return_window_days,
    }
    const updated = await bonusService.updateBonusConfigs({
      id: config.id,
      ...input,
    })

    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)
    await bonusService.updateBonusConfigs(previous)
  }
)
