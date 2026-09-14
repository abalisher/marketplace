// Сериализация строки документа для API. Покупателю (ЛК) — только публичные
// поля + ссылка на PDF (без внутренних file_id/snapshot); админу/продавцу —
// расширенно (версии, is_latest, file_id). Снапшот наружу в списках не отдаём —
// он крупный и предназначен для экспорта 1С (см. /admin/orders/:id/documents/export).

type DocumentRow = {
  id: string
  type: string
  number: string
  version: number
  is_latest: boolean
  file_id: string | null
  file_url: string | null
  total_money: unknown
  total_bonus: unknown
  currency_code: string
  note: string | null
  sent_to_buyer_at?: Date | string | null
  created_at?: Date | string | null
}

// Для покупателя: без file_id и snapshot; total'ы — числами.
export const serializeDocumentForBuyer = (doc: DocumentRow) => ({
  id: doc.id,
  type: doc.type,
  number: doc.number,
  version: doc.version,
  file_url: doc.file_url,
  total_money: Number(doc.total_money),
  total_bonus: Number(doc.total_bonus),
  currency_code: doc.currency_code,
  created_at: doc.created_at ?? null,
})

// Для админа/продавца: полнее (версии/is_latest/file_id), но всё ещё без
// снапшота — снапшот отдаёт отдельный экспорт-роут.
export const serializeDocumentForAdmin = (doc: DocumentRow) => ({
  id: doc.id,
  type: doc.type,
  number: doc.number,
  version: doc.version,
  is_latest: doc.is_latest,
  file_id: doc.file_id,
  file_url: doc.file_url,
  total_money: Number(doc.total_money),
  total_bonus: Number(doc.total_bonus),
  currency_code: doc.currency_code,
  note: doc.note,
  // Отметка «отправлен покупателю» (T4.9) — только для продавца/админа:
  // покупателю документ и так виден в ЛК.
  sent_to_buyer_at: doc.sent_to_buyer_at ?? null,
  created_at: doc.created_at ?? null,
})
