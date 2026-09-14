import { MedusaError } from "@medusajs/framework/utils"
import { base64CharsForBytes } from "./base64"
import { geminiGenerateContent } from "./gemini"

// ИИ-приёмка накладной (procurement подзадача 2): PDF/фото накладной закупа →
// Gemini извлекает товарные позиции. Результат РЕКОМЕНДАТЕЛЬНЫЙ: продавец
// сопоставляет позиции с SKU каталога и проводит через существующий флоу
// create-draft (source=invoice_ai). Ничего не персистит — только распознавание.
// Изоляция: не модуль (внешний адаптер, без домена/БД), зовётся из тонкого роута.

// Предел размера накладной. 8 МБ — снимок с телефона (2–5 МБ) и скан-PDF на
// несколько страниц помещаются, а инлайн-запрос к Gemini (20 МБ на всё тело)
// не переполняется. Тот же предел в символах base64 стоит в валидаторе роута,
// а лимит тела запроса (bodyParser в middlewares) взят с запасом над ним —
// иначе крупный файл отваливается 413 ещё ДО валидатора, без внятной причины.
export const MAX_INVOICE_BYTES = 8 * 1024 * 1024
export const MAX_INVOICE_BASE64_CHARS = base64CharsForBytes(MAX_INVOICE_BYTES)

// Распознанная позиция накладной (до сопоставления с SKU — variant_id пустой).
export type RecognizedLine = {
  recognized_title: string
  quantity: number
  unit: string
  unit_cost: number
}

// Поставщик, прочитанный в шапке накладной: по нему приход атрибутируется, а
// если такого в реестре нет — роут заводит его сам (замечание владельца
// 2026-08-12: «зачем лишний раз напрягать пользователя»).
export type RecognizedSupplier = {
  name: string
  bin: string | null
}

export type RecognizedInvoice = {
  reference: string | null
  received_at: string | null
  supplier: RecognizedSupplier | null
  lines: RecognizedLine[]
}

// Схема структурированного ответа Gemini (generationConfig.responseSchema). Тип —
// UPPERCASE-enum Gemini Schema (REST). Цена — целые тенге (major units, как
// sale-price ядра; DECISIONS 2026-07-23). received_at — ISO-дата накладной, если
// видна. Итоги/налоги/служебные строки модель исключает (см. промпт).
export const INVOICE_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    reference: { type: "STRING", nullable: true },
    received_at: { type: "STRING", nullable: true },
    supplier_name: { type: "STRING", nullable: true },
    supplier_bin: { type: "STRING", nullable: true },
    lines: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          recognized_title: { type: "STRING" },
          quantity: { type: "NUMBER" },
          unit: { type: "STRING" },
          unit_cost: { type: "NUMBER" },
        },
        required: ["recognized_title", "quantity", "unit", "unit_cost"],
      },
    },
  },
  required: ["lines"],
} as const

const SYSTEM_PROMPT =
  "Ты — ассистент приёмки на склад строительных материалов. Тебе дают накладную " +
  "поставщика (скан/фото/PDF). Извлеки ТОЛЬКО товарные позиции: наименование, " +
  "количество, единицу измерения и закупочную цену за единицу. Цену указывай в " +
  "тенге целым числом (без копеек, без разделителей). Не включай итоги, суммы НДС, " +
  "скидки, служебные и пустые строки. Если поле не читается — не выдумывай его: " +
  "пропусти такую позицию. reference — номер накладной, received_at — дата в " +
  "формате YYYY-MM-DD, если она видна, иначе null. supplier_name — название " +
  "ОТПРАВИТЕЛЯ/поставщика из шапки (не покупателя и не грузополучателя), " +
  "supplier_bin — его БИН/ИИН (12 цифр) при наличии; не видно — null."

const USER_PROMPT =
  "Разбери эту накладную закупа и верни позиции строго по заданной JSON-схеме."

const DEFAULT_UNIT = "шт"

// Санитизация ответа модели → чистый DTO: числа коерсим, отрицательные обнуляем,
// цену округляем к целым тенге, мусорные строки (без названия либо кол-во ≤ 0)
// отбрасываем. Чистая функция (тестируется без сети). Модель может вернуть строку
// вместо числа/мусор — граница доверия здесь, а не в UI.
export const sanitizeRecognizedInvoice = (raw: unknown): RecognizedInvoice => {
  const obj = (raw ?? {}) as Record<string, unknown>
  const rawLines = Array.isArray(obj.lines) ? obj.lines : []

  const lines: RecognizedLine[] = rawLines
    .map((entry): RecognizedLine => {
      const l = (entry ?? {}) as Record<string, unknown>
      const title = typeof l.recognized_title === "string" ? l.recognized_title.trim() : ""
      const quantity = Number(l.quantity)
      const unitCost = Number(l.unit_cost)
      const unit = typeof l.unit === "string" && l.unit.trim() ? l.unit.trim() : DEFAULT_UNIT
      return {
        recognized_title: title,
        quantity: Number.isFinite(quantity) ? Math.max(0, quantity) : 0,
        unit,
        unit_cost: Number.isFinite(unitCost) ? Math.max(0, Math.round(unitCost)) : 0,
      }
    })
    .filter((l) => l.recognized_title !== "" && l.quantity > 0)

  const reference =
    typeof obj.reference === "string" && obj.reference.trim()
      ? obj.reference.trim()
      : null
  const received_at =
    typeof obj.received_at === "string" && obj.received_at.trim()
      ? obj.received_at.trim()
      : null

  const supplierName =
    typeof obj.supplier_name === "string" && obj.supplier_name.trim()
      ? obj.supplier_name.trim()
      : ""
  // БИН — только цифры (модель иногда отдаёт «БИН 1405...» или с пробелами).
  const binDigits =
    typeof obj.supplier_bin === "string"
      ? obj.supplier_bin.replace(/\D/g, "")
      : ""
  const supplier: RecognizedSupplier | null = supplierName
    ? { name: supplierName, bin: binDigits.length === 12 ? binDigits : null }
    : null

  return { reference, received_at, supplier, lines }
}

// Распознать накладную: файл (base64) → Gemini со structured output → чистые
// позиции. Ошибки сети/модели/парсинга — понятные MedusaError (роут вернёт их
// продавцу; нечитаемый ввод → фолбэк на ручной ввод, идиома estimator).
export const parseInvoiceDocument = async (input: {
  mimeType: string
  data: string
}): Promise<RecognizedInvoice> => {
  const text = await geminiGenerateContent({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: "user",
        parts: [
          { text: USER_PROMPT },
          { inlineData: { mimeType: input.mimeType, data: input.data } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: INVOICE_RESPONSE_SCHEMA,
    },
  })

  if (!text) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "AI returned an empty response for the invoice"
    )
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "AI returned malformed JSON for the invoice"
    )
  }

  return sanitizeRecognizedInvoice(parsed)
}
