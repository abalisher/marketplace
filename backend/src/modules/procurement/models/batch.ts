import { model } from "@medusajs/framework/utils"

// Партия закупа — слой себестоимости FIFO (решение владельца 2026-07-22). Каждая
// проведённая строка прихода порождает партию: закуп-цена (unit_cost, минорные
// единицы) + принятое/оставшееся количество + срок годности. Списание при продаже
// идёт по FIFO от самой ранней received_at (чистая consumeFifo в constants);
// применение к реальной продаже — отдельная подзадача. variant_id/receipt_line_id
// — опазные ссылки-колонки (партия queryable standalone по variant_id для FIFO;
// не belongsTo, чтобы не тянуть строку при списании). См. docs/modules/procurement.md.
const Batch = model.define("procurement_batch", {
  id: model.id({ prefix: "batch" }).primaryKey(),
  variant_id: model.text(),
  receipt_line_id: model.text(),
  quantity_received: model.float(),
  quantity_remaining: model.float(),
  unit_cost: model.number().default(0),
  received_at: model.dateTime(),
  expires_at: model.dateTime().nullable(),
})

export default Batch
