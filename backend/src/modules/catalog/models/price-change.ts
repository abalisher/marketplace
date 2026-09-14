import { model } from "@medusajs/framework/utils"

// Источник правки: руками в строке экрана «Цены и остатки» или загрузкой файла
// (T10.14c). По нему в журнале видно, чем объяснять массовый скачок цен.
export const PRICE_CHANGE_SOURCES = ["manual", "import"] as const
export type PriceChangeSource = (typeof PRICE_CHANGE_SOURCES)[number]

// Журнал правок цены и остатка: кто, когда, было → стало (T10.14).
// Ядро Medusa историю цены не хранит — price set перезаписывается, а
// inventory_level знает только текущее число. Поэтому факт правки пишем сами.
//
// Ссылки на вариант, товар и склад — опазные колонки (модули ядра не
// импортируем); название товара и вариант — снапшот на момент правки, чтобы
// журнал читался и после переименования или удаления позиции.
//
// Пара old_*/new_* заполняется ТОЛЬКО у того, что реально менялось: правка одной
// цены пишет строку с пустым остатком и наоборот. Пустая пара — это «не
// трогали», а не «стало пусто».
const PriceChange = model
  .define("price_change", {
  id: model.id({ prefix: "pchg" }).primaryKey(),
  variant_id: model.text(),
  product_id: model.text().nullable(),
  product_title: model.text(),
  variant_title: model.text().nullable(),
  sku: model.text().nullable(),
  currency_code: model.text().nullable(),
  old_price: model.bigNumber().nullable(),
  new_price: model.bigNumber().nullable(),
  // Остаток на складе: было → стало (абсолютные числа, не дельта).
  location_id: model.text().nullable(),
  old_stock: model.number().nullable(),
  new_stock: model.number().nullable(),
  // Кто правил: user_id админ-пользователя + снапшот имени для журнала.
  changed_by: model.text().nullable(),
  changed_by_name: model.text().nullable(),
  source: model.enum([...PRICE_CHANGE_SOURCES]).default("manual"),
  })
  // Журнал читается двумя способами: лента экрана (всё, свежее сверху) и
  // история одной позиции (карточка товара, T11.6) — по ней и индекс.
  .indexes([{ on: ["variant_id"], where: "deleted_at IS NULL" }])

export default PriceChange
