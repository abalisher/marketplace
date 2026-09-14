// Вложения композера (T10.4b): что покупатель вправе приложить к реплике и в
// каком виде это уходит в `POST /store/assistant/chat`. Правила ЗЕРКАЛЯТ
// серверные (backend/src/lib/assistant/file-input.ts) — не потому, что клиенту
// доверяют, а чтобы отказ был виден ДО отправки: «файл великоват» после
// восьмимегабайтной загрузки покупатель читает как поломку.
//
// Разбора содержимого здесь нет и не будет: файл уходит в модель как есть,
// нигде не сохраняется и живёт ровно один ход (то же обещание, что у голоса).

export const MAX_FILE_BYTES = 8 * 1024 * 1024
export const MAX_TURN_BYTES = 12 * 1024 * 1024
export const MAX_FILES_PER_TURN = 3

// Почему файл не взяли. Текст выбирает UI — здесь только причина, тексты
// локализованы.
export type AttachmentFailure =
  // Формат, который зрительная модель не читает (видео, архив, exe).
  | "type"
  // Таблица или документ с текстовым слоем: цифры сметы берёт парсер (T11.1),
  // а не картинка. Отказ отдельный — покупателю есть что сделать прямо сейчас.
  | "table"
  // Один файл больше 8 МБ.
  | "tooLarge"
  // Файлы за ход суммарно больше 12 МБ.
  | "turnTooLarge"
  // Файлов больше трёх.
  | "tooMany"
  // Файл не прочитался (нет прав, устройство отключили).
  | "failed"

export class AttachmentError extends Error {
  constructor(readonly reason: AttachmentFailure) {
    super(`attachment: ${reason}`)
    this.name = "AttachmentError"
  }
}

// Готовое вложение в том виде, в каком его принимает бэкенд, плюс то, что нужно
// показать в ленте (имя и признак картинки — превью рисуется из тех же данных).
export type ChatAttachment = {
  id: string
  name: string
  mimeType: string
  // Тело файла в base64 БЕЗ префикса data:.
  data: string
  size: number
  isImage: boolean
}

// Что принимаем: снимки с телефона и из галереи + PDF. Ключ — тип от системного
// выбора файла, значение — то, что уходит на бэкенд.
const MIME_MAP: Record<string, string> = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
  "image/heic": "image/heic",
  "image/heif": "image/heif",
  "application/pdf": "application/pdf",
}

// Расширения на случай, когда система отдала файл БЕЗ типа: Windows отдаёт
// пустой `type` для .heic, а часть файловых менеджеров Android — и для jpeg.
const EXTENSION_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
}

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

const TABLE_EXTENSIONS = new Set([
  "csv",
  "xls",
  "xlsx",
  "ods",
  "doc",
  "docx",
  "odt",
])

// Что предлагает системный диалог выбора. Расширения указаны рядом с типами:
// без них файловые менеджеры, не знающие heic, прячут снимки iPhone.
export const ATTACHMENT_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf"

const extensionOf = (name: string) => {
  const dot = name.lastIndexOf(".")
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase()
}

const baseType = (raw: string) => raw.split(";")[0]?.trim().toLowerCase() ?? ""

// Таблицу узнаём и по типу, и по расширению: покупатель, который тянет
// «смета.xlsx», должен получить осмысленный ответ, а не «неизвестный формат».
const isTable = (file: File) =>
  TABLE_MIME_TYPES.has(baseType(file.type)) ||
  TABLE_EXTENSIONS.has(extensionOf(file.name))

const resolveMimeType = (file: File): string | null =>
  MIME_MAP[baseType(file.type)] ?? EXTENSION_MAP[extensionOf(file.name)] ?? null

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new AttachmentError("failed"))
    reader.onload = () => {
      const result = String(reader.result)
      // FileReader отдаёт `data:<mime>;base64,<данные>` — бэкенду нужны только
      // данные.
      resolve(result.slice(result.indexOf(",") + 1))
    }
    reader.readAsDataURL(file)
  })

const newAttachmentId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `file-${Date.now()}-${Math.round(Math.random() * 1e6)}`

// Прочитать один выбранный файл. `turnBytes` — сколько уже набрано вложениями
// этого хода: предел на ход проверяется здесь же, иначе покупатель узнал бы о
// нём от сервера после отправки.
export const readAttachment = async (
  file: File,
  turnBytes: number
): Promise<ChatAttachment> => {
  if (isTable(file)) {
    throw new AttachmentError("table")
  }
  const mimeType = resolveMimeType(file)
  if (!mimeType) {
    throw new AttachmentError("type")
  }
  if (file.size === 0) {
    throw new AttachmentError("failed")
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new AttachmentError("tooLarge")
  }
  if (turnBytes + file.size > MAX_TURN_BYTES) {
    throw new AttachmentError("turnTooLarge")
  }
  return {
    id: newAttachmentId(),
    name: file.name,
    mimeType,
    data: await toBase64(file),
    size: file.size,
    isImage: mimeType !== "application/pdf",
  }
}

// Источник превью: те же данные, что уходят на бэкенд. Object URL завёл бы
// жизненный цикл (кто и когда его отзывает), а вложений за ход — три.
export const attachmentPreviewUrl = (attachment: ChatAttachment) =>
  `data:${attachment.mimeType};base64,${attachment.data}`
