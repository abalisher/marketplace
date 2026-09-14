import { model } from "@medusajs/framework/utils"
import AssemblyTask from "./assembly-task"
import { ASSEMBLY_ITEM_STATUSES } from "./constants"

// Позиция задания сборки — строка заказа, попавшая в эту категорию.
// order_item_id/variant_id — опазные ссылки-колонки (модуль order не
// импортируем): по order_item_id workflow собирает fulfillment ядра.
// title/sku — снапшот на момент распада, чтобы экран сборщика не ходил в
// каталог за названием. quantity — сколько надо; picked_quantity — сколько
// набрано по факту (0 при «нет в наличии», меньше quantity при «частично»).
const AssemblyTaskItem = model.define("assembly_task_item", {
  id: model.id({ prefix: "astski" }).primaryKey(),
  order_item_id: model.text(),
  variant_id: model.text().nullable(),
  title: model.text(),
  sku: model.text().nullable(),
  quantity: model.number(),
  picked_quantity: model.number().default(0),
  status: model.enum([...ASSEMBLY_ITEM_STATUSES]).default("pending"),
  marked_at: model.dateTime().nullable(),
  // Кто отметил позицию (user_id сборщика).
  marked_by: model.text().nullable(),
  note: model.text().nullable(),
  task: model.belongsTo(() => AssemblyTask, { mappedBy: "items" }),
})

export default AssemblyTaskItem
