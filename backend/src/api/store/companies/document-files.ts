// Правила приёма учредительных документов от покупателя (заявка юрлица).
// Чистые функции: используются zod-схемой роута и шагом загрузки в File Module.
// Покупатель присылает СОДЕРЖИМОЕ файла (base64), а не ссылку: ссылку нельзя
// проверить, а модератор в панели открывает её как документ компании.

export const COMPANY_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const

export type CompanyDocumentMimeType =
  (typeof COMPANY_DOCUMENT_MIME_TYPES)[number]

// Ограничения заявки: четыре файла по 3 МБ — устав, свидетельство/справка о
// регистрации, приказ о директоре и доверенность помещаются с запасом. Лимит
// тела запроса задан в src/api/middlewares.ts (bodyParser) и должен быть больше
// суммы файлов в base64 (+ ~34 % к размеру).
export const MAX_COMPANY_DOCUMENTS = 4
export const MAX_COMPANY_DOCUMENT_BYTES = 3 * 1024 * 1024

export type CompanyDocument = { name: string; url: string }

// Разбор колонки `documents` компании: jsonb типизирован как Record, а хранит
// массив документов. Нужен догрузке файлов — она считает уже приложенные,
// чтобы не превысить общий лимит заявки. Битые записи отбрасываются: ссылка
// без имени модератору бесполезна.
export function parseCompanyDocuments(value: unknown): CompanyDocument[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter(
    (entry): entry is CompanyDocument =>
      !!entry &&
      typeof entry === "object" &&
      typeof (entry as CompanyDocument).name === "string" &&
      typeof (entry as CompanyDocument).url === "string"
  )
}

// Расширение по типу файла: имя от покупателя может прийти без расширения
// (например, из мобильной камеры), а модератор скачивает файл по ссылке.
const EXTENSION_BY_MIME: Record<CompanyDocumentMimeType, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
}

// Размер файла до кодирования: 4 символа base64 = 3 байта, хвостовые «=»
// добирают неполную группу.
export function decodedByteLength(contentBase64: string): number {
  const clean = contentBase64.trim()
  if (!clean) {
    return 0
  }
  const padding = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0
  return Math.floor((clean.length * 3) / 4) - padding
}

// Имя файла для File Module: без путей и служебных символов, с расширением по
// mime-типу. Пустое/полностью вычищенное имя заменяется на «document».
export function sanitizeDocumentFilename(
  name: string,
  mimeType: CompanyDocumentMimeType
): string {
  const base = name
    .split(/[\\/]/)
    .pop()!
    .replace(/\.[^.]+$/, "")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80)

  return `${base || "document"}.${EXTENSION_BY_MIME[mimeType]}`
}
