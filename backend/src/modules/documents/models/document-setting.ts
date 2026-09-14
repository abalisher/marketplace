import { model } from "@medusajs/framework/utils"

// Реквизиты продавца для рендера документов — singleton-строка (MVP: один
// продавец, платформа формирует документы от его имени). getOrCreateSettings
// создаёт её с дефолтами при первом обращении; редактируется в админке
// (подзадача 4). Идиома BonusConfig.
const DocumentSetting = model.define("document_setting", {
  id: model.id({ prefix: "docset" }).primaryKey(),
  seller_name: model.text().default("Marketplace"),
  seller_bin: model.text().nullable(),
  seller_address: model.text().nullable(),
  seller_phone: model.text().nullable(),
  seller_email: model.text().nullable(),
  seller_bank_name: model.text().nullable(),
  seller_bank_bik: model.text().nullable(),
  seller_iban: model.text().nullable(),
  // Кбе — код бенефициара платёжного поручения (17 у юрлиц-резидентов, 19 у ИП
  // и физлиц), КНП — код назначения платежа (710 — оплата за товар). Без них
  // банк покупателя платёж по счёту не проведёт, поэтому у полей есть типовые
  // дефолты, а не null.
  seller_kbe: model.text().default("17"),
  seller_knp: model.text().default("710"),
  // Ф.И.О. руководителя — расшифровка подписи под счётом и актом.
  director_name: model.text().nullable(),
  // Приписка в подвале документа (например, «не является официальным ЭСФ»).
  footer_note: model.text().nullable(),
})

export default DocumentSetting
