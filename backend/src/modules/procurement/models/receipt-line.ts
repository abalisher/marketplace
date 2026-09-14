import { model } from "@medusajs/framework/utils"
import Receipt from "./receipt"

// Строка прихода: что и по какой цене закуплено. variant_id — опазная ссылка на
// вариант товара ядра; NULL, пока строка не сопоставлена с SKU (ИИ-черновик
// приходит с recognized_title/material_kind и пустым variant_id — продавец
// сопоставляет перед проводкой). Проводка строки с variant_id создаёт партию
// (Batch) со своей unit_cost/expires_at. Цены — минорные единицы (тиын), кол-во —
// дробное (материалы). См. docs/modules/procurement.md.
const ReceiptLine = model.define("receipt_line", {
  id: model.id({ prefix: "rcln" }).primaryKey(),
  variant_id: model.text().nullable(),
  // Что распознали до сопоставления с SKU (ИИ-приёмка) — вспомогательная подпись.
  recognized_title: model.text().nullable(),
  material_kind: model.text().nullable(),
  quantity: model.float(),
  unit: model.text(),
  unit_cost: model.number().default(0),
  line_cost: model.number().default(0),
  // Срок годности партии из этой строки (цемент и т.п.); переносится в Batch.
  expires_at: model.dateTime().nullable(),
  receipt: model.belongsTo(() => Receipt, { mappedBy: "lines" }),
})

export default ReceiptLine
