import { model } from "@medusajs/framework/utils"

// Счётчик номеров документов по ключу "<type>:<year>" — источник человекочитаемых
// номеров (см. service.nextDocumentNumber). Отдельная строка на тип и год.
const DocumentSequence = model.define("document_sequence", {
  id: model.id({ prefix: "docseq" }).primaryKey(),
  key: model.text(),
  value: model.number().default(0),
})

export default DocumentSequence
