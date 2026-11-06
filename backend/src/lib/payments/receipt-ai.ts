import { MedusaError } from "@medusajs/framework/utils"
import { geminiGenerateContent } from "../gemini"

// Распознавание чека Kaspi (перевод или платёж), присланного покупателем:
// снимок экрана или PDF-квитанция → поля чека. Только чтение — что делать с
// прочитанным, решают проверки (receipt-checks.ts) и продавец.

export type RecognizedReceipt = {
  is_receipt: boolean
  bank: string | null
  success: boolean | null
  amount: number | null
  paid_at: string | null
  receipt_number: string | null
  recipient_name: string | null
  recipient_phone: string | null
  // ИИН/БИН продавца — есть в чеке оплаты магазину (Kaspi QR), 12 цифр.
  recipient_bin: string | null
  sender_name: string | null
  comment: string | null
  // Что модели показалось признаком правки (разные шрифты, «плавающие» цифры,
  // суммы, не сходящиеся между строками). Подсказка продавцу, не доказательство.
  tamper_signs: string[]
}

export const RECEIPT_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    is_receipt: { type: "BOOLEAN" },
    bank: { type: "STRING", nullable: true },
    success: { type: "BOOLEAN", nullable: true },
    amount: { type: "NUMBER", nullable: true },
    paid_at: { type: "STRING", nullable: true },
    receipt_number: { type: "STRING", nullable: true },
    recipient_name: { type: "STRING", nullable: true },
    recipient_phone: { type: "STRING", nullable: true },
    recipient_bin: { type: "STRING", nullable: true },
    sender_name: { type: "STRING", nullable: true },
    comment: { type: "STRING", nullable: true },
    tamper_signs: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["is_receipt", "tamper_signs"],
} as const

const SYSTEM_PROMPT =
  "Ты проверяешь чеки об оплате для интернет-магазина в Казахстане. Тебе дают " +
  "снимок экрана или PDF. Определи, это ли чек/квитанция о переводе или платеже " +
  "(обычно из приложения Kaspi.kz), и выпиши поля ровно так, как они напечатаны. " +
  "Чеки Kaspi бывают трёх видов: перевод («Перевод успешно совершен», «Тип " +
  "перевода: Перевод клиенту Kaspi») — получатель напечатан крупно под суммой " +
  "(«Нұржігіт Е.»), номера получателя в квитанции обычно нет, отправитель — в " +
  "строке «Отправитель»; оплата магазину по Kaspi QR («Оплата совершена», номер " +
  "чека вида QR18290561703) — получатель в шапке: название магазина и под ним " +
  "юрлицо («SMALL», «ТОО \"Скиф трейд\"»), есть «ИИН/БИН продавца», покупатель — " +
  "в строке «ФИО покупателя»; оплата услуг («Платеж успешно совершен») — " +
  "получатель — название услуги в шапке. " +
  "bank — банк или приложение (Kaspi, Halyk…); success — операция успешна " +
  "(«Перевод успешно совершен», «Оплата совершена», «Платеж успешно совершен», " +
  "«Успешно», «Оплачено»), false — если видно «Отклонено», " +
  "«Ошибка», «В обработке»; amount — сумма перевода в тенге числом без пробелов и " +
  "знака ₸ (комиссия — не сумма перевода); paid_at — дата и время операции в " +
  "формате YYYY-MM-DDTHH:MM (местное время Казахстана), если видна только дата — " +
  "YYYY-MM-DD; receipt_number — номер квитанции/чека/операции; recipient_name — " +
  "получатель как напечатан («Нурлан Б.»; у магазина — название и юрлицо через " +
  "« / »: «SMALL / ТОО \"Скиф трейд\"»); recipient_phone — номер получателя как " +
  "напечатан, со звёздочками если скрыт; recipient_bin — «ИИН/БИН продавца» " +
  "(12 цифр), если напечатан; sender_name — отправитель или «ФИО покупателя»; comment — " +
  "сообщение/комментарий к переводу. Не видно поля — null, не выдумывай. " +
  "tamper_signs — короткие признаки возможной правки изображения: разные шрифты " +
  "или размеры цифр в одной строке, следы ретуши, суммы или даты, не сходящиеся " +
  "в разных местах чека, неестественные отступы. Нет признаков — пустой список. " +
  "Если это не чек об оплате — is_receipt=false."

const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null

// Ответ модели → чистый DTO. Граница доверия здесь: модель может прислать
// строку вместо числа, «12 500 ₸» или мусор.
export const sanitizeRecognizedReceipt = (raw: unknown): RecognizedReceipt => {
  const obj = (raw ?? {}) as Record<string, unknown>
  const amountRaw =
    typeof obj.amount === "number"
      ? obj.amount
      : typeof obj.amount === "string"
      ? Number(obj.amount.replace(/[^\d.,]/g, "").replace(",", "."))
      : NaN
  return {
    is_receipt: obj.is_receipt === true,
    bank: text(obj.bank),
    success: typeof obj.success === "boolean" ? obj.success : null,
    amount: Number.isFinite(amountRaw) && amountRaw > 0 ? Math.round(amountRaw * 100) / 100 : null,
    paid_at: text(obj.paid_at),
    receipt_number: text(obj.receipt_number)?.replace(/\s+/g, "") ?? null,
    recipient_name: text(obj.recipient_name),
    recipient_phone: text(obj.recipient_phone),
    recipient_bin: /^\d{12}$/.test((text(obj.recipient_bin) ?? "").replace(/\s+/g, ""))
      ? (text(obj.recipient_bin) as string).replace(/\s+/g, "")
      : null,
    sender_name: text(obj.sender_name),
    comment: text(obj.comment),
    tamper_signs: Array.isArray(obj.tamper_signs)
      ? obj.tamper_signs.map(text).filter((sign): sign is string => !!sign).slice(0, 5)
      : [],
  }
}

export const recognizeReceipt = async (input: {
  mimeType: string
  data: string
}): Promise<RecognizedReceipt> => {
  const reply = await geminiGenerateContent({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: "user",
        parts: [
          { text: "Разбери этот чек строго по заданной JSON-схеме." },
          { inlineData: { mimeType: input.mimeType, data: input.data } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RECEIPT_RESPONSE_SCHEMA,
    },
  })
  if (!reply) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "AI returned an empty response for the receipt"
    )
  }
  try {
    return sanitizeRecognizedReceipt(JSON.parse(reply))
  } catch {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "AI returned malformed JSON for the receipt"
    )
  }
}
