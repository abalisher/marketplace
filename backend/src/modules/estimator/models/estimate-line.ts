import { model } from "@medusajs/framework/utils"
import Estimate from "./estimate"
import { ESTIMATE_SEGMENTS } from "./constants"

// Позиция расчёта: вид материала + рассчитанное количество; при подборке —
// сегмент, привязка к товару каталога (product_id — опазная ссылка, не FK) и
// цена/сумма. Подборка/цены заполняются при расчёте с учётом каталога и остатков
// (workflow, подзадача 2); в подзадаче 1 хранится количество по нормативу.
const EstimateLine = model.define("estimate_line", {
  id: model.id({ prefix: "estline" }).primaryKey(),
  material_kind: model.text(),
  quantity: model.number(),
  unit: model.text(),
  // Норматив, по которому посчитано (для трассировки).
  norm_code: model.text().nullable(),
  // Подборка (заполняется при матчинге с каталогом, подзадача 2).
  segment: model.enum([...ESTIMATE_SEGMENTS]).nullable(),
  product_id: model.text().nullable(),
  unit_price: model.bigNumber().nullable(),
  total: model.bigNumber().nullable(),
  estimate: model.belongsTo(() => Estimate, { mappedBy: "lines" }),
})

export default EstimateLine
