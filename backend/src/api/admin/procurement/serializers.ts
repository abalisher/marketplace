// Сериализаторы ответов admin API закупа: строки модуля → плоские DTO (даты →
// ISO, decimal/BigNumber → number). Один файл по назначению (идиома logistics),
// роуты остаются тонкими.

const iso = (d: Date | string | null): string | null =>
  d ? new Date(d).toISOString() : null

export const serializeSupplier = (s: {
  id: string
  name: string
  bin: string | null
  contact_phone: string | null
  contact_email: string | null
  note: string | null
  active: boolean
}) => ({
  id: s.id,
  name: s.name,
  bin: s.bin,
  contact_phone: s.contact_phone,
  contact_email: s.contact_email,
  note: s.note,
  active: s.active,
})

export const serializeReceiptLine = (l: {
  id: string
  variant_id: string | null
  recognized_title: string | null
  material_kind: string | null
  quantity: number
  unit: string
  unit_cost: number
  line_cost: number
  expires_at: Date | null
}) => ({
  id: l.id,
  variant_id: l.variant_id,
  recognized_title: l.recognized_title,
  material_kind: l.material_kind,
  quantity: Number(l.quantity),
  unit: l.unit,
  unit_cost: Number(l.unit_cost),
  line_cost: Number(l.line_cost),
  expires_at: iso(l.expires_at),
})

export const serializeBatch = (b: {
  id: string
  variant_id: string
  receipt_line_id: string
  quantity_received: number
  quantity_remaining: number
  unit_cost: number
  received_at: Date | null
  expires_at: Date | null
}) => ({
  id: b.id,
  variant_id: b.variant_id,
  receipt_line_id: b.receipt_line_id,
  quantity_received: Number(b.quantity_received),
  quantity_remaining: Number(b.quantity_remaining),
  unit_cost: Number(b.unit_cost),
  received_at: iso(b.received_at),
  expires_at: iso(b.expires_at),
})

export const serializeReceipt = (
  r: {
    id: string
    supplier_id: string | null
    location_id: string
    reference: string | null
    status: string
    source: string
    document_file_id: string | null
    received_at: Date | null
    total_cost: number
    note: string | null
    lines?: Parameters<typeof serializeReceiptLine>[0][] | null
  },
  batches?: Parameters<typeof serializeBatch>[0][]
) => ({
  id: r.id,
  supplier_id: r.supplier_id,
  location_id: r.location_id,
  reference: r.reference,
  status: r.status,
  source: r.source,
  document_file_id: r.document_file_id,
  received_at: iso(r.received_at),
  total_cost: Number(r.total_cost),
  note: r.note,
  lines: (r.lines ?? []).map(serializeReceiptLine),
  batches: (batches ?? []).map(serializeBatch),
})
