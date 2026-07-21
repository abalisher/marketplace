import { model } from "@medusajs/framework/utils"
import { DOCUMENT_TYPES } from "./constants"

// Документ-основание по заказу (счёт / накладная / внутренний АВР). Генерируется
// автоматически из workflows заказа (подзадача 2) и хранится с версионностью.
// order_id — ОПАЗНАЯ ссылка на заказ ядра (не FK, модуль order не импортируем):
// документы всегда в рамках заказа, а нумерация/версионность/выборка группируются
// по заказу — это внутренняя логика домена документов. В отличие от
// order-lifecycle/bonus, где связь с заказом — забота workflow через module link,
// здесь заказ нужен самому сервису (issueDocument), поэтому храним ссылку колонкой.
// См. docs/modules/documents.md.
const Document = model.define("document", {
  id: model.id({ prefix: "doc" }).primaryKey(),
  order_id: model.text(),
  // Спред — копия readonly-кортежа: model.enum не принимает readonly-массив.
  type: model.enum([...DOCUMENT_TYPES]),
  // Человекочитаемый номер (INV-2026-000001). Присваивается при первой версии;
  // переиздание сохраняет номер и увеличивает version.
  number: model.text(),
  version: model.number().default(1),
  // Текущая версия документа по (order_id, type). Предыдущие версии остаются с
  // is_latest=false — версионность и история из ТЗ 4.10.
  is_latest: model.boolean().default(true),
  // Ссылка на отрендеренный PDF в File Module ядра; null пока не отрендерен.
  file_id: model.text().nullable(),
  file_url: model.text().nullable(),
  // Замороженные исходные данные на момент выпуска (реквизиты, позиции, суммы) —
  // для детерминированного ре-рендера и аудита.
  snapshot: model.json(),
  // Суммы «деньгами» и «бонусами» — раздельно (ТЗ 4.10; данные из модуля bonus).
  total_money: model.bigNumber(),
  total_bonus: model.bigNumber(),
  currency_code: model.text().default("kzt"),
  // Видимость в ЛК: по умолчанию обе стороны (ТЗ 4.10). Флаги позволяют скрыть
  // документ от одной стороны в будущем без миграции.
  visible_to_buyer: model.boolean().default(true),
  visible_to_seller: model.boolean().default(true),
  note: model.text().nullable(),
})

export default Document
