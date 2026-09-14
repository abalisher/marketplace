import { model } from "@medusajs/framework/utils"
import ReceiptLine from "./receipt-line"
import { RECEIPT_SOURCES, RECEIPT_STATUSES } from "./constants"

// Приход (накладная закупа): факт получения товара от поставщика. supplier_id/
// location_id — опазные ссылки-колонки (поставщик — своя сущность, склад — stock
// location ядра; модули не импортируем, идиома logistics.trip.location_id). status
// draft→posted: проводка порождает партии (Batch) и увеличивает остаток ядра —
// это слой workflow post-receipt (подзадача 1b), не модуль. source=invoice_ai/
// photo_ai — ИИ-приёмка (подзадача 2). document_file_id — скан накладной.
const Receipt = model.define("receipt", {
  id: model.id({ prefix: "rcpt" }).primaryKey(),
  supplier_id: model.text().nullable(),
  location_id: model.text(),
  // Номер накладной поставщика (внешний), для сверки.
  reference: model.text().nullable(),
  status: model.enum([...RECEIPT_STATUSES]).default("draft"),
  source: model.enum([...RECEIPT_SOURCES]).default("manual"),
  document_file_id: model.text().nullable(),
  received_at: model.dateTime().nullable(),
  // Сумма по строкам (минорные единицы, тиын). Считается при создании/правке.
  total_cost: model.number().default(0),
  note: model.text().nullable(),
  lines: model.hasMany(() => ReceiptLine, { mappedBy: "receipt" }),
})

export default Receipt
