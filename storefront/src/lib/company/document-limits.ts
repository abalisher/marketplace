// Ограничения приёма учредительных документов юрлица. Повторяют бэкенд
// (backend/src/api/store/companies/document-files.ts): считаем их и на витрине,
// чтобы покупатель узнал о проблеме до отправки нескольких мегабайт.
// Отдельный модуль, а не lib/data/company.ts: тот помечен "use server" и может
// экспортировать только асинхронные функции.

export const MAX_COMPANY_DOCUMENTS = 4
export const MAX_COMPANY_DOCUMENT_BYTES = 3 * 1024 * 1024
export const COMPANY_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
]
