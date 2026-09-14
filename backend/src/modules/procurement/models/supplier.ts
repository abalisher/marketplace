import { model } from "@medusajs/framework/utils"

// Поставщик закупа (lean-реестр): ровно чтобы атрибутировать приход. Без
// договоров/долгов/платежей на MVP. bin — БИН/ИИН поставщика (опц.). Приход
// ссылается опазной колонкой supplier_id (модули не связываем FK на MVP; при
// необходимости — link позже). См. docs/modules/procurement.md.
const Supplier = model.define("supplier", {
  id: model.id({ prefix: "sup" }).primaryKey(),
  name: model.text(),
  bin: model.text().nullable(),
  contact_phone: model.text().nullable(),
  contact_email: model.text().nullable(),
  note: model.text().nullable(),
  active: model.boolean().default(true),
})

export default Supplier
