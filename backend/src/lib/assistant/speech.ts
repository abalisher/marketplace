import { MedusaError } from "@medusajs/framework/utils"
import { base64ByteLength, base64CharsForBytes, stripDataUrlPrefix } from "../base64"
import { geminiGenerate } from "../gemini"

// Распознавание голосового сообщения покупателя (T10.2, п. 2 разворота
// 2026-08-25: «покупатель говорит, а не печатает»). Внешний ИИ-адаптер поверх того
// же ключа и семейства моделей, что и разговорный ассистент (идиома invoice-ai):
// своего домена и БД нет, отдельного STT-провайдера до вывода T10.5 не заводим.
//
// Голос НЕ отдельный режим (требование T11.4): распознанный текст возвращается
// клиенту, падает в композер, покупатель может поправить его и отправляет обычным
// сообщением — разбор фразы делает существующий ассистент. Поэтому здесь только
// расшифровка: ни инструментов, ни истории диалога.
//
// Аудио НИГДЕ не сохраняется: приходит в теле запроса, уходит в модель, живёт
// ровно до конца запроса (обещание T10.2 — записи голоса не хранятся).

// Расшифровка: текст ровно как сказано + основной язык записи (для отчёта T10.5 и
// чтобы клиент мог честно сказать «не расслышали», а не молчать).
export type VoiceTranscript = {
  text: string
  // BCP-47 без региона: "ru" | "kk" | "en" | … null — модель не определила.
  language: string | null
}

// Пределы записи. Размер — единственная защита, которую сервер проверяет сам:
// длительность внутри контейнера opus/aac без декодера не прочитать, поэтому её
// присылает клиент (он же ограничивает запись), а сервер валидирует присланное.
// 8 МБ ≈ 60 с с большим запасом даже для несжатого wav-моно.
export const MAX_VOICE_BYTES = 8 * 1024 * 1024
export const MAX_VOICE_DURATION_MS = 60_000
// Тот же предел в символах base64 — им ограничено тело запроса в валидаторе
// роута, чтобы гигантская строка отваливалась до модели.
export const MAX_VOICE_BASE64_CHARS = base64CharsForBytes(MAX_VOICE_BYTES)

// Контейнеры, которые умеют писать клиенты: webm/opus (MediaRecorder в Chrome —
// витрина), ogg/opus (Firefox), mp4/m4a и aac (Android/iOS — buyer), wav (без
// сжатия; им же ходит live-smoke). Ключ — базовый тип БЕЗ параметров, значение —
// то, что уходит в Gemini.
//
// ВАЖНО про webm: в перечне аудиоформатов Gemini его нет (там wav/mp3/aiff/aac/
// ogg/flac), но именно его отдаёт Chrome. Пропускаем как есть и не подменяем
// контейнер: если модель откажется — это увидит прогон T10.5, и тогда развилка
// «свой STT-провайдер» решается с фактом на руках, а не догадкой.
const VOICE_MIME_MAP: Record<string, string> = {
  "audio/webm": "audio/webm",
  "audio/ogg": "audio/ogg",
  "audio/opus": "audio/ogg",
  "audio/mp4": "audio/mp4",
  "audio/x-m4a": "audio/mp4",
  "audio/m4a": "audio/mp4",
  "audio/aac": "audio/aac",
  "audio/wav": "audio/wav",
  "audio/x-wav": "audio/wav",
}

// Клиент присылает тип как его отдал рекордер — с параметрами и в любом регистре
// («audio/webm;codecs=opus», «AUDIO/MP4»). Отбрасываем параметры и приводим к
// тому, что понимает модель. Неизвестный контейнер → null (роут ответит 400).
export const normalizeVoiceMimeType = (raw: string): string | null => {
  const base = raw.split(";")[0]?.trim().toLowerCase() ?? ""
  return VOICE_MIME_MAP[base] ?? null
}

const SYSTEM_PROMPT =
  "Ты — расшифровщик голосовых сообщений покупателя магазина строительных " +
  "материалов (Астана, Казахстан). Верни РОВНО то, что человек сказал: без " +
  "перевода, пересказа, ответов и своих комментариев. Правила: (1) язык " +
  "оставляй как в записи — русский, казахский или английский; смешанную " +
  "казахско-русскую речь пиши смешанной, как сказали, ничего не выравнивая под " +
  "один язык. (2) Числа, размеры и единицы пиши цифрами: «сорок на сто» → " +
  "«40 на 100», «два куба» → «2 куба», «двадцать мешков» → «20 мешков». " +
  "(3) Строительные термины пиши правильно и полностью: гипсокартон, пеноблок, " +
  "пескобетон, стяжка, штукатурка, профиль, саморезы, ЦСП, ОСБ. (4) Знаки " +
  "препинания ставь минимально — так, чтобы фраза читалась. (5) Если запись " +
  "пустая, это тишина, шум или разобрать ничего нельзя — верни пустую строку в " +
  "text и НЕ придумывай слов. (6) language — основной язык записи кодом ru, kk " +
  "или en; определить нельзя — null."

const USER_PROMPT = "Расшифруй это голосовое сообщение покупателя."

// Схема структурированного ответа (Gemini Schema, тип UPPERCASE — см. gemini.ts).
export const VOICE_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    text: { type: "STRING" },
    language: { type: "STRING", nullable: true },
  },
  required: ["text"],
} as const

// Граница доверия к модели: она может вернуть число вместо строки, «Russian»
// вместо «ru» или язык с регионом. Чистая функция — тестируется без сети.
export const sanitizeTranscript = (raw: unknown): VoiceTranscript => {
  const obj = (raw ?? {}) as Record<string, unknown>
  const text = typeof obj.text === "string" ? obj.text.trim() : ""

  // Язык — только двухбуквенный код без региона («ru-RU» → «ru»); всё прочее
  // («Russian», «казахский», пусто) считаем неопределённым.
  const rawLanguage =
    typeof obj.language === "string" ? obj.language.trim().toLowerCase() : ""
  const code = rawLanguage.split(/[-_]/)[0] ?? ""
  const language = /^[a-z]{2}$/.test(code) ? code : null

  return { text, language }
}

export type TranscribeVoiceInput = {
  // Тип как его отдал рекордер (параметры допустимы).
  mimeType: string
  // Содержимое записи в base64 (допустим префикс data-URL).
  data: string
  // Длительность записи по данным клиента, мс. Необязательна.
  durationMs?: number
  signal?: AbortSignal
}

// Расшифровать голосовое сообщение: аудио (base64) → Gemini со structured output
// → текст + язык. Нарушенные пределы и нечитаемый ввод — понятные MedusaError
// (роут отдаст их клиенту как 400, а не 500). Пустой text — НЕ ошибка: значит
// не расслышали, и клиент честно скажет об этом, оставив покупателю ручной ввод
// (требование T11.4 — деградировать текстом, а не молчать).
export const transcribeVoiceMessage = async (
  input: TranscribeVoiceInput
): Promise<VoiceTranscript> => {
  const mimeType = normalizeVoiceMimeType(input.mimeType)
  if (!mimeType) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Unsupported audio format: ${input.mimeType}`
    )
  }

  if (input.durationMs !== undefined && input.durationMs > MAX_VOICE_DURATION_MS) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Voice message is too long: ${Math.round(input.durationMs / 1000)}s, ` +
        `max ${MAX_VOICE_DURATION_MS / 1000}s`
    )
  }

  const bytes = base64ByteLength(input.data)
  if (bytes === 0) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Audio payload is empty")
  }
  if (bytes > MAX_VOICE_BYTES) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Audio payload is too large: ${bytes} bytes, max ${MAX_VOICE_BYTES}`
    )
  }

  const { text } = await geminiGenerate(
    {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        {
          role: "user",
          parts: [
            { text: USER_PROMPT },
            {
              inlineData: { mimeType, data: stripDataUrlPrefix(input.data) },
            },
          ],
        },
      ],
      // Расшифровка — извлечение, а не рассуждение: уровень мыслей минимальный
      // (как у ИИ-приёмки накладной), иначе голос отвечает дольше, чем звучал.
      generationConfig: {
        thinkingConfig: { thinkingLevel: "minimal" },
        responseMimeType: "application/json",
        responseSchema: VOICE_RESPONSE_SCHEMA,
        maxOutputTokens: 2048,
      },
    },
    { signal: input.signal }
  )

  if (!text) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "AI returned an empty response for the voice message"
    )
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "AI returned malformed JSON for the voice message"
    )
  }

  return sanitizeTranscript(parsed)
}
