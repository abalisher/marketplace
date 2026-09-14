// DTO admin-API estimator (справочник нормативов) для браузерного бандла.

export type NormBase = "area" | "volume" | "length" | "count"

export type AdminMaterialNorm = {
  id: string
  code: string
  name: string
  work_type: string
  material_kind: string
  base: NormBase
  consumption_per_unit: number
  unit: string
  category_id: string | null
  active: boolean
  note: string | null
}

export type AdminMaterialNormsResponse = { material_norms: AdminMaterialNorm[] }
export type AdminMaterialNormResponse = { material_norm: AdminMaterialNorm }

export const NORM_BASES: NormBase[] = ["area", "volume", "length", "count"]

// Значения — i18n-ключи (react-i18next); потребители подписи оборачивают в t(...).
export const NORM_BASE_LABELS: Record<NormBase, string> = {
  area: "estimator.base.area",
  volume: "estimator.base.volume",
  length: "estimator.base.length",
  count: "estimator.base.count",
}
