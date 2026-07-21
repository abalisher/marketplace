import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { SCORING_MODULE } from "../../modules/scoring"
import ScoringModuleService from "../../modules/scoring/service"
import { ScoringInputs } from "../../modules/scoring/models/constants"

export type UpsertScoreCardStepInput = {
  company_id: string
  inputs: ScoringInputs
  note?: string | null
}

// Пересчёт и сохранение карточки рейтинга через сервис (по конфигу; ручной лимит
// не трогается). Компенсация: удалить созданную карточку (если её не было) или
// вернуть прежние вычисленные поля (score/credit_limit/components).
export const upsertScoreCardStep = createStep(
  "upsert-score-card",
  async (input: UpsertScoreCardStepInput, { container }) => {
    const scoringService =
      container.resolve<ScoringModuleService>(SCORING_MODULE)
    const before = await scoringService.getScoreCard(input.company_id)
    const card = await scoringService.upsertScoreCard(input)
    return new StepResponse(card, {
      created: !before,
      card_id: card.id,
      score: before ? before.score : 0,
      credit_limit: before ? before.credit_limit : 0,
      components: before ? before.components : null,
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
      score: previous.score,
      credit_limit: previous.credit_limit,
      components: previous.components,
    })
  }
)
