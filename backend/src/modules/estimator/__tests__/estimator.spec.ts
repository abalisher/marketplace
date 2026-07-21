import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { ESTIMATOR_MODULE } from ".."
import EstimatorModuleService from "../service"
import MaterialNorm from "../models/material-norm"
import Estimate from "../models/estimate"
import EstimateLine from "../models/estimate-line"
import {
  buildEstimateLines,
  calculateMaterialQuantity,
} from "../models/constants"

jest.setTimeout(120000)

// Интеграционный тест модуля estimator: чистый расчёт количества по нормативу,
// сборка строк (отсев нулевых), ручной расчёт сметы из нормативной базы.
// Инварианты — docs/modules/estimator.md. Подборка товаров/цен по сегментам —
// подзадача 2 (workflow с каталогом), здесь не тестируется.
moduleIntegrationTestRunner<EstimatorModuleService>({
  moduleName: ESTIMATOR_MODULE,
  moduleModels: [MaterialNorm, Estimate, EstimateLine],
  resolve: "./src/modules/estimator",
  testSuite: ({ service }) => {
    describe("pure estimator functions", () => {
      it("computes quantity per base (area/volume/count) and rounds up", async () => {
        expect(calculateMaterialQuantity("area", 10, { area: 100 })).toEqual(
          1000
        )
        // volume выводится из area×height, если volume не задан.
        expect(
          calculateMaterialQuantity("volume", 50, { area: 100, height: 3 })
        ).toEqual(15000)
        expect(calculateMaterialQuantity("count", 4, { count: 5 })).toEqual(20)
        // Округление вверх до 2 знаков.
        expect(
          calculateMaterialQuantity("area", 0.333, { area: 10 })
        ).toEqual(3.33)
        // Нет измерителя → 0.
        expect(calculateMaterialQuantity("length", 5, {})).toEqual(0)
      })

      it("rejects an unknown base", async () => {
        expect(() =>
          // @ts-expect-error — проверяем защиту рантайма.
          calculateMaterialQuantity("weight", 1, { area: 1 })
        ).toThrow(/Unknown norm base/)
      })

      it("builds lines and drops zero-quantity ones", async () => {
        const lines = buildEstimateLines(
          [
            {
              code: "CEM",
              material_kind: "cement",
              base: "area",
              consumption_per_unit: 10,
              unit: "kg",
            },
            {
              code: "REBAR",
              material_kind: "rebar",
              base: "length",
              consumption_per_unit: 2,
              unit: "m",
            },
          ],
          { area: 100 } // length не задан → строка REBAR отсеивается
        )
        expect(lines).toHaveLength(1)
        expect(lines[0]).toMatchObject({
          material_kind: "cement",
          quantity: 1000,
          norm_code: "CEM",
        })
      })
    })

    describe("EstimatorModuleService.createManualEstimate", () => {
      const seedNorms = async () => {
        await service.createMaterialNorms([
          {
            code: "CEM",
            name: "Цемент на стяжку",
            work_type: "screed",
            material_kind: "cement",
            base: "area",
            consumption_per_unit: 10,
            unit: "kg",
          },
          {
            code: "SAND",
            name: "Песок на стяжку",
            work_type: "screed",
            material_kind: "sand",
            base: "volume",
            consumption_per_unit: 50,
            unit: "kg",
          },
        ])
      }

      it("computes a calculated estimate with lines from all active norms", async () => {
        await seedNorms()
        const estimate = await service.createManualEstimate({
          params: { area: 100, height: 3 },
        })

        expect(estimate.status).toEqual("calculated")
        expect(estimate.lines).toHaveLength(2)
        const byKind = Object.fromEntries(
          estimate.lines.map((l) => [l.material_kind, Number(l.quantity)])
        )
        expect(byKind.cement).toEqual(1000) // 10 × area 100
        expect(byKind.sand).toEqual(15000) // 50 × volume (100×3)
      })

      it("restricts to selected norm codes", async () => {
        await seedNorms()
        const estimate = await service.createManualEstimate({
          params: { area: 100, height: 3 },
          norm_codes: ["CEM"],
        })
        expect(estimate.lines).toHaveLength(1)
        expect(estimate.lines[0].material_kind).toEqual("cement")
      })

      it("creates a calculated estimate with no lines when measures are missing", async () => {
        await seedNorms()
        const estimate = await service.createManualEstimate({ params: {} })
        expect(estimate.status).toEqual("calculated")
        expect(estimate.lines).toHaveLength(0)
      })
    })
  },
})
