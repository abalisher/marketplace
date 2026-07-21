import { MedusaService } from "@medusajs/framework/utils"
import ScoringConfig from "./models/scoring-config"
import ScoreCard from "./models/score-card"
import {
  calculateScore,
  scoreToLimit,
  ScoringInputs,
  ScoringWeights,
} from "./models/constants"

// Собирает веса из конфига (bigNumber-поля → number для чистых функций).
// Standalone-функция (не метод — правило service-methods-must-be-async).
const buildWeights = (config: {
  points_per_order: number
  max_orders_points: number
  volume_per_point: unknown
  max_volume_points: number
  days_per_point: number
  max_tenure_points: number
  penalty_per_return: number
  min_score_for_credit: number
  base_limit: unknown
  limit_per_score_point: unknown
  max_limit: unknown
}): ScoringWeights => ({
  points_per_order: config.points_per_order,
  max_orders_points: config.max_orders_points,
  volume_per_point: Number(config.volume_per_point),
  max_volume_points: config.max_volume_points,
  days_per_point: config.days_per_point,
  max_tenure_points: config.max_tenure_points,
  penalty_per_return: config.penalty_per_return,
  min_score_for_credit: config.min_score_for_credit,
  base_limit: Number(config.base_limit),
  limit_per_score_point: Number(config.limit_per_score_point),
  max_limit: Number(config.max_limit),
})

// Сервис домена скоринга. CRUD генерируется MedusaService; здесь — singleton
// конфига, пересчёт карточки рейтинга (по чистым функциям + конфиг), ручная
// корректировка лимита и свободный лимит. Сбор входных данных истории компании —
// в workflow/джобе (подзадача 2). См. docs/modules/scoring.md.
class ScoringModuleService extends MedusaService({
  ScoringConfig,
  ScoreCard,
}) {
  // Настраиваемые правила — singleton (создаётся лениво с дефолтами модели).
  async getOrCreateConfig() {
    const [existing] = await this.listScoringConfigs({}, { take: 1 })
    if (existing) {
      return existing
    }
    return await this.createScoringConfigs({})
  }

  async getScoreCard(companyId: string) {
    const [card] = await this.listScoreCards(
      { company_id: companyId },
      { take: 1 }
    )
    return card ?? null
  }

  // Пересчитать и сохранить карточку рейтинга компании по входным факторам.
  // Ручной лимит (manual_limit), если был задан, НЕ трогаем — он приоритетнее.
  async upsertScoreCard(input: {
    company_id: string
    inputs: ScoringInputs
    note?: string | null
  }) {
    const config = await this.getOrCreateConfig()
    const weights = buildWeights(config)
    const { score, components } = calculateScore(input.inputs, weights)
    const credit_limit = scoreToLimit(score, weights)

    const existing = await this.getScoreCard(input.company_id)
    if (existing) {
      return await this.updateScoreCards({
        id: existing.id,
        score,
        credit_limit,
        components,
        note: input.note ?? existing.note ?? null,
      })
    }
    return await this.createScoreCards({
      company_id: input.company_id,
      score,
      credit_limit,
      components,
      note: input.note ?? null,
    })
  }

  // Ручная корректировка лимита продавцом (перекрывает вычисленный; аудит — note).
  // Сброс — manual_limit=null (действует вычисленный credit_limit).
  async setManualLimit(input: {
    company_id: string
    manual_limit: number | null
    note?: string | null
  }) {
    const existing = await this.getScoreCard(input.company_id)
    if (existing) {
      return await this.updateScoreCards({
        id: existing.id,
        manual_limit: input.manual_limit,
        note: input.note ?? existing.note ?? null,
      })
    }
    return await this.createScoreCards({
      company_id: input.company_id,
      manual_limit: input.manual_limit,
      note: input.note ?? null,
    })
  }

  // Свободный лимит отсрочки: эффективный (ручной, если задан, иначе вычисленный)
  // минус занятая часть. Нет карточки → 0.
  async availableCredit(companyId: string) {
    const card = await this.getScoreCard(companyId)
    if (!card) {
      return 0
    }
    const effective =
      card.manual_limit != null
        ? Number(card.manual_limit)
        : Number(card.credit_limit)
    return Math.max(0, effective - Number(card.reserved))
  }
}

export default ScoringModuleService
