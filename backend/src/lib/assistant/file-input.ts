import { MedusaError } from "@medusajs/framework/utils"
import { base64ByteLength, base64CharsForBytes, stripDataUrlPrefix } from "../base64"

// Вложения хода ассистента (T10.4, п. 9 разворота 2026-08-25): покупатель шлёт
// фото списка от прораба, фото объекта, скрин сметы или PDF, и ассистент
// отвечает ПО НИМ — превращает список в позиции корзины. Здесь только граница
// приёма: типы, пределы и приведение к тому виду, в котором вложение уходит в
// модель (`inlineData`). Разбор содержимого делает сама модель в ходе
// оркестратора — отдельного «парсера фото» у нас нет и не нужно.
//
// НЕ путать с `attachments.ts`: там UI-вставки, которые ассистент кладёт в ленту
// (карточка товара, Kaspi, статус заказа) — движение в обратную сторону.
//
// Файл НИГДЕ не сохраняется (то же обещание, что и по голосу T10.2): приходит
// телом запроса, уходит в модель, живёт до конца запроса. Из этого следует
// главное правило хода: вложение видно модели ТОЛЬКО в том ходе, в котором его
// прислали — в истории диалога остаётся текст, а не картинка (см. system-prompt).

// Вложение как его прислал клиент: тип от системного выбора файла (с
// параметрами и в любом регистре), содержимое base64 (допустим префикс
// data-URL), имя файла — только для показа в ленте, модели оно не уходит.
export type AssistantFileInput = {
  mimeType: string
  data: string
  name?: string
}

// Вложение, приведённое к виду Gemini `inlineData`.
export type AssistantTurnFile = {
  mimeType: string
  data: string
}

// Пределы вложений хода. Один файл — 8 МБ (фото с телефона 2–5 МБ, скан-PDF
// бывает крупнее); файлов за ход — не больше трёх (список от прораба снимают
// в несколько кадров); суммарно — 12 МБ, потому что всё вложенное уходит в
// запрос к модели ОДНИМ телом, а инлайн-запрос Gemini ограничен 20 МБ, и
// в тот же лимит должны поместиться история диалога и инструкция.
export const MAX_FILE_BYTES = 8 * 1024 * 1024
export const MAX_TURN_FILES_BYTES = 12 * 1024 * 1024
export const MAX_FILES_PER_TURN = 3
// Тот же предел на один файл в символах base64 — им ограничено тело запроса в
// валидаторе роута, чтобы гигантская строка отваливалась до модели.
export const MAX_FILE_BASE64_CHARS = base64CharsForBytes(MAX_FILE_BYTES)

// Что принимаем: снимки с телефона и из галереи (jpeg/png/webp, heic/heif —
// формат камеры iPhone по умолчанию) и PDF (счёт, спецификация, скан сметы).
// Ключ — базовый тип БЕЗ параметров, значение — то, что уходит в Gemini.
const FILE_MIME_MAP: Record<string, string> = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
  "image/heic": "image/heic",
  "image/heif": "image/heif",
  "application/pdf": "application/pdf",
}

// Таблицы и документы с текстовым слоем: их зрительной моделью НЕ читаем —
// требование T11.1 (детерминированный парсер в модуле `estimator`, чтобы цифры
// в смете брались из ячеек, а не из догадки модели). Пока парсера нет, отказ
// должен быть ЧЕСТНЫМ и отдельным от «неизвестный формат»: покупателю есть что
// сделать прямо сейчас — прислать фото листа или продиктовать голосом.
const TABLE_MIME_TYPES = new Set([
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
])

// Тип приходит как его отдала система выбора файла — с параметрами и в любом
// регистре («image/jpeg», «IMAGE/PNG»). Неизвестный формат → null.
export const normalizeFileMimeType = (raw: string): string | null => {
  const base = raw.split(";")[0]?.trim().toLowerCase() ?? ""
  return FILE_MIME_MAP[base] ?? null
}

export const isTableMimeType = (raw: string): boolean => {
  const base = raw.split(";")[0]?.trim().toLowerCase() ?? ""
  return TABLE_MIME_TYPES.has(base)
}

// Проверить и привести вложения хода. Нарушенные пределы — понятные
// MedusaError (роут отдаст их как 400, а не 500); тексты разные для каждого
// случая, потому что покупателю в каждом надо сделать разное: сжать фото,
// убрать лишний файл, прислать снимок вместо таблицы.
export const prepareAssistantFiles = (
  files: AssistantFileInput[]
): AssistantTurnFile[] => {
  if (files.length > MAX_FILES_PER_TURN) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Too many attachments: ${files.length}, max ${MAX_FILES_PER_TURN}`
    )
  }

  let totalBytes = 0
  const prepared: AssistantTurnFile[] = []

  for (const file of files) {
    if (isTableMimeType(file.mimeType)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Spreadsheets and text documents are not supported yet: ${file.mimeType}`
      )
    }

    const mimeType = normalizeFileMimeType(file.mimeType)
    if (!mimeType) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unsupported attachment format: ${file.mimeType}`
      )
    }

    const bytes = base64ByteLength(file.data)
    if (bytes === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Attachment payload is empty"
      )
    }
    if (bytes > MAX_FILE_BYTES) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Attachment is too large: ${bytes} bytes, max ${MAX_FILE_BYTES}`
      )
    }

    totalBytes += bytes
    if (totalBytes > MAX_TURN_FILES_BYTES) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Attachments are too large: ${totalBytes} bytes, max ${MAX_TURN_FILES_BYTES}`
      )
    }

    prepared.push({ mimeType, data: stripDataUrlPrefix(file.data) })
  }

  return prepared
}
