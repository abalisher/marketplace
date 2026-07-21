import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { SCORING_MODULE } from "../../modules/scoring"
import ScoringModuleService from "../../modules/scoring/service"

export type SetCompanyCreditLimitStepInput = {
  company_id: string
  manual_limit: number | null
  note?: string | null
}

// Ручная корректировка лимита отсрочки компании (перекрывает вычисленный).
// Компенсация — возврат прежних manual_limit/note (или удаление созданной
// карточки, если её не было).
export const setCompanyCreditLimitStep = createStep(
  "set-company-credit-limit",
  async (input: SetCompanyCreditLimitStepInput, { container }) => {
    const scoringService =
      container.resolve<ScoringModuleService>(SCORING_MODULE)
    const existing = await scoringService.getScoreCard(input.company_id)
    const card = await scoringService.setManualLimit(input)
    return new StepResponse(card, {
      created: !existing,
      card_id: card.id,
      manual_limit: existing ? (existing.manual_limit ?? null) : null,
      note: existing ? (existing.note ?? null) : null,
    })
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const scoringService =
      container.resolve<ScoringModuleService>(SCORING_MODULE)
    if (previous.created) {
      await scoringService.deleteScoreCards(previous.card_id)
      return
    }
    await scoringService.updateScoreCards({
      id: previous.card_id,
      manual_limit: previous.manual_limit,
      note: previous.note,
    })
  }
)
