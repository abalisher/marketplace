import { MedusaError } from "@medusajs/framework/utils"

// Источник расчёта. MVP — ручной ввод параметров (ТЗ «упрощённый первый шаг»);
// file/voice (ИИ-распознавание через Claude API / STT) — отдельный этап после
// базового MVP (DECISIONS 2026-07-10, docs/modules/estimator.md).
export const ESTIMATE_SOURCES = ["manual", "file", "voice"] as const
export type EstimateSource = (typeof ESTIMATE_SOURCES)[number]

export const ESTIMATE_STATUSES = ["draft", "calculated"] as const
export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number]

// Сегменты подборки материалов (те же, что в catalog/product_card).
export const ESTIMATE_SEGMENTS = ["economy", "comfort", "business"] as const
export type EstimateSegment = (typeof ESTIMATE_SEGMENTS)[number]

// База норматива расхода: расход задан НА единицу площади/объёма/длины/штуки.
export const NORM_BASES = ["area", "volume", "length", "count"] as const
export type NormBase = (typeof NORM_BASES)[number]

// Параметры помещения/работы, вводимые вручную (MVP). Объём при базе volume
// вычисляется из area×height, если volume не задан явно.
export type EstimateParams = {
  area?: number
  volume?: number
  length?: number
  height?: number
  count?: number
}

// Чистый расчёт количества материала: расход норматива × соответствующий базе
// измеритель. Standalone-функция (не метод сервиса: правило
// service-methods-must-be-async; идиома bonus/scoring). Отрицательный/нулевой
// измеритель → 0. Неизвестная база → ошибка данных.
export const calculateMaterialQuantity = (
  base: NormBase,
  consumptionPerUnit: number,
  params: EstimateParams
): number => {
  let measure = 0
  switch (base) {
    case "area":
      measure = params.area ?? 0
      break
    case "volume":
      measure =
        params.volume ??
        (params.area != null && params.height != null
          ? params.area * params.height
          : 0)
      break
    case "length":
      measure = params.length ?? 0
      break
    case "count":
      measure = params.count ?? 0
      break
    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown norm base: ${base}`
      )
  }
  const quantity = consumptionPerUnit * Math.max(0, measure)
  // Округление вверх до 2 знаков (материалы не заказывают «в минус»).
  return Math.ceil(quantity * 100) / 100
}

// Норматив в минимальной форме для расчёта строк (из строки MaterialNorm).
export type NormForCalc = {
  code: string
  material_kind: string
  base: NormBase
  consumption_per_unit: number
  unit: string
}

export type EstimateLineDraft = {
  material_kind: string
  quantity: number
  unit: string
  norm_code: string
}

// Строит черновые позиции расчёта из нормативов и параметров (без каталога/цен —
// подборка и цены заполняются при матчинге, подзадача 2). Позиции с нулевым
// количеством отбрасываются. Чистая функция (идиома bonus/scoring).
export const buildEstimateLines = (
  norms: NormForCalc[],
  params: EstimateParams
): EstimateLineDraft[] =>
  norms
    .map((norm) => ({
      material_kind: norm.material_kind,
      quantity: calculateMaterialQuantity(
        norm.base,
        Number(norm.consumption_per_unit),
        params
      ),
      unit: norm.unit,
      norm_code: norm.code,
    }))
    .filter((line) => line.quantity > 0)
