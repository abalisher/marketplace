// Сериализация расчёта материалов для store API (без служебных полей).

type EstimateLineRow = {
  id: string
  material_kind: string
  quantity: number
  unit: string
  norm_code: string | null
  segment: string | null
  product_id: string | null
  unit_price: unknown
  total: unknown
}

type EstimateRow = {
  id: string
  source: string
  status: string
  params: unknown
  note: string | null
  created_at?: Date | string | null
  lines?: EstimateLineRow[]
}

export const serializeEstimate = (estimate: EstimateRow) => ({
  id: estimate.id,
  source: estimate.source,
  status: estimate.status,
  params: estimate.params ?? {},
  note: estimate.note,
  created_at: estimate.created_at ?? null,
  lines: (estimate.lines ?? []).map((line) => ({
    id: line.id,
    material_kind: line.material_kind,
    quantity: Number(line.quantity),
    unit: line.unit,
    norm_code: line.norm_code,
    segment: line.segment,
    product_id: line.product_id,
    unit_price: line.unit_price != null ? Number(line.unit_price) : null,
    total: line.total != null ? Number(line.total) : null,
  })),
})
