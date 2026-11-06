import { model } from "@medusajs/framework/utils"

// Позиция номенклатуры 1С ↔ товар площадки. По этой таблице синхронизация
// узнаёт, что позиция уже заведена (и обновляет товар, а не плодит второй), и
// какие товары компании ведутся из 1С (их цену и остаток руками не правят).
//
// external_key — устойчивый ключ позиции в 1С: GUID ссылки, иначе код, иначе
// артикул (lib/onec/parse-items.ts). Уникален в пределах компании: у двух
// компаний могут совпадать коды, и это разные товары.
const OnecItem = model
  .define("onec_item", {
    id: model.id({ prefix: "onecitm" }).primaryKey(),
    tenant_id: model.text(),
    external_key: model.text(),
    external_code: model.text().nullable(),
    product_id: model.text(),
    variant_id: model.text(),
    // Себестоимость единицы — учётная цена 1С (rate). Хранится здесь, а не в
    // метаданных варианта: витрина отдаёт покупателю варианты целиком
    // (`*variants`), и себестоимость утекла бы наружу.
    cost: model.bigNumber().nullable(),
    // Была ли позиция в последнем ответе 1С. false — товар снят с витрины.
    present: model.boolean().default(true),
    last_seen_at: model.dateTime().nullable(),
  })
  .indexes([
    {
      on: ["tenant_id", "external_key"],
      unique: true,
      where: "deleted_at IS NULL",
    },
    { on: ["product_id"], where: "deleted_at IS NULL" },
  ])

export default OnecItem
