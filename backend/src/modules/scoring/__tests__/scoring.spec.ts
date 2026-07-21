import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { SCORING_MODULE } from ".."
import ScoringModuleService from "../service"
import ScoringConfig from "../models/scoring-config"
import ScoreCard from "../models/score-card"
import {
  calculateScore,
  scoreToLimit,
  ScoringWeights,
} from "../models/constants"

jest.setTimeout(120000)

// Веса для чистых функций (совпадают с дефолтами модели ScoringConfig).
const WEIGHTS: ScoringWeights = {
  points_per_order: 5,
  max_orders_points: 40,
  volume_per_point: 100000,
  max_volume_points: 30,
  days_per_point: 30,
  max_tenure_points: 20,
  penalty_per_return: 10,
  min_score_for_credit: 30,
  base_limit: 0,
  limit_per_score_point: 5000,
  max_limit: 5000000,
}

// Интеграционный тест модуля scoring: чистые функции расчёта (балл/лимит),
// singleton конфига, пересчёт карточки (upsert по компании), ручной лимит и
// свободный кредит. Инварианты — docs/modules/scoring.md.
moduleIntegrationTestRunner<ScoringModuleService>({
  moduleName: SCORING_MODULE,
  moduleModels: [ScoringConfig, ScoreCard],
  resolve: "./src/modules/scoring",
  testSuite: ({ service }) => {
    describe("pure scoring functions", () => {
      it("weights components, caps each, and clamps score to 0..100", async () => {
        // Много заказов → компонент orders упирается в потолок 40.
        const many = calculateScore(
          { orders_count: 100, orders_total: 0, returns_count: 0, tenure_days: 0 },
          WEIGHTS
        )
        expect(many.components.orders).toEqual(40)
        expect(many.score).toEqual(40)

        // Возвраты штрафуют; балл не уходит ниже 0.
        const penalised = calculateScore(
          { orders_count: 0, orders_total: 0, returns_count: 100, tenure_days: 0 },
          WEIGHTS
        )
        expect(penalised.score).toEqual(0)
      })

      it("maps score to a deferral limit with a floor threshold", async () => {
        // Ниже порога (30) — кредита нет.
        expect(scoreToLimit(20, WEIGHTS)).toEqual(0)
        // Выше порога — линейно от балла, в пределах потолка.
        expect(scoreToLimit(50, WEIGHTS)).toEqual(250000)
        expect(scoreToLimit(100, WEIGHTS)).toEqual(500000)
      })
    })

    describe("ScoringModuleService", () => {
      it("creates the config singleton with defaults and reuses it", async () => {
        const config = await service.getOrCreateConfig()
        expect(config.id).toMatch(/^scoreconf_/)
        expect(config.min_score_for_credit).toEqual(30)

        const again = await service.getOrCreateConfig()
        expect(again.id).toEqual(config.id)
        const [, count] = await service.listAndCountScoringConfigs()
        expect(count).toEqual(1)
      })

      it("upserts one score card per company and recomputes it", async () => {
        const first = await service.upsertScoreCard({
          company_id: "comp_1",
          inputs: {
            orders_count: 4,
            orders_total: 500000,
            returns_count: 0,
            tenure_days: 90,
          },
        })
        expect(first.id).toMatch(/^scorecard_/)
        // orders 4*5=20, volume 500000/100000=5, tenure 90/30=3 → 28.
        expect(first.score).toEqual(28)
        // 28 < порог 30 → лимит 0.
        expect(Number(first.credit_limit)).toEqual(0)

        // Пересчёт с лучшими показателями — та же карточка (одна на компанию).
        const recomputed = await service.upsertScoreCard({
          company_id: "comp_1",
          inputs: {
            orders_count: 10,
            orders_total: 3000000,
            returns_count: 0,
            tenure_days: 365,
          },
        })
        expect(recomputed.id).toEqual(first.id)
        // orders 40(cap), volume 30(cap), tenure 12 → 82.
        expect(recomputed.score).toEqual(82)
        expect(Number(recomputed.credit_limit)).toEqual(410000)

        const [, count] = await service.listAndCountScoreCards({
          company_id: "comp_1",
        })
        expect(count).toEqual(1)
      })

      it("applies a manual limit that overrides the computed one for available credit", async () => {
        await service.upsertScoreCard({
          company_id: "comp_2",
          inputs: {
            orders_count: 10,
            orders_total: 3000000,
            returns_count: 0,
            tenure_days: 365,
          },
        })
        // Вычисленный лимит 410000; ручной перекрывает.
        expect(await service.availableCredit("comp_2")).toEqual(410000)

        await service.setManualLimit({
          company_id: "comp_2",
          manual_limit: 1000000,
          note: "Increased by manager",
        })
        expect(await service.availableCredit("comp_2")).toEqual(1000000)

        // Сброс ручного лимита — снова действует вычисленный.
        await service.setManualLimit({
          company_id: "comp_2",
          manual_limit: null,
        })
        expect(await service.availableCredit("comp_2")).toEqual(410000)
      })

      it("returns zero available credit for an unknown company", async () => {
        expect(await service.availableCredit("comp_unknown")).toEqual(0)
      })
    })
  },
})
