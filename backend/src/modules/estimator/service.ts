import { MedusaService } from "@medusajs/framework/utils"
import MaterialNorm from "./models/material-norm"
import Estimate from "./models/estimate"
import EstimateLine from "./models/estimate-line"
import {
  buildEstimateLines,
  EstimateParams,
  EstimateSource,
  NormForCalc,
} from "./models/constants"

// Сервис домена estimator. CRUD генерируется MedusaService; здесь — расчёт
// материалов по ручным параметрам и нормативной базе (MVP; ИИ-распознавание
// файлов/голоса — отдельный этап). Подборка товаров/цен по сегментам и учёт
// остатков — в workflow с каталогом (подзадача 2). См. docs/modules/estimator.md.
class EstimatorModuleService extends MedusaService({
  MaterialNorm,
  Estimate,
  EstimateLine,
}) {
  // Активные нормативы (все либо по кодам).
  async getActiveNorms(codes?: string[]) {
    const filters: Record<string, unknown> = { active: true }
    if (codes && codes.length) {
      filters.code = codes
    }
    return await this.listMaterialNorms(filters)
  }

  // Ручной расчёт: по параметрам и активным нормативам (все либо выбранные)
  // строит смету со строками-количествами. Результат рекомендательный —
  // покупатель правит позже. Пустой список нормативов → смета без строк.
  async createManualEstimate(input: {
    customer_id?: string | null
    params: EstimateParams
    norm_codes?: string[]
    source?: EstimateSource
    note?: string | null
  }) {
    const norms = await this.getActiveNorms(input.norm_codes)
    const drafts = buildEstimateLines(
      norms.map(
        (n): NormForCalc => ({
          code: n.code,
          material_kind: n.material_kind,
          base: n.base,
          consumption_per_unit: Number(n.consumption_per_unit),
          unit: n.unit,
        })
      ),
      input.params
    )

    const estimate = await this.createEstimates({
      customer_id: input.customer_id ?? null,
      source: input.source ?? "manual",
      status: "calculated",
      params: input.params,
      note: input.note ?? null,
    })

    if (drafts.length) {
      await this.createEstimateLines(
        drafts.map((d) => ({ ...d, estimate_id: estimate.id }))
      )
    }

    return await this.retrieveEstimate(estimate.id, { relations: ["lines"] })
  }
}

export default EstimatorModuleService
