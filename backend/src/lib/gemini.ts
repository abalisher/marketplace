import { MedusaError } from "@medusajs/framework/utils"

// Инфраструктурный адаптер к Google Gemini — провайдер ИИ проекта (решение
// владельца 2026-07-23: Gemini Flash Lite для ИИ-приёмки накладных И для
// разговорного ассистента покупателя). Ключ и модель — ТОЛЬКО через env (секрет
// не в коде, правило CLAUDE.md). Модель вынесена в env, чтобы смена версии Gemini
// правилась без изменения кода.
//
// Вызов идёт через REST (generativelanguage API), а НЕ через @google/genai: тот
// пакет ESM-only, а рантайм Medusa — CommonJS (SWC) → статический импорт не
// заводится. fetch у Node 20 глобальный — SDK не нужен.

// Стабильный flash-lite на момент внедрения (ai.google.dev, thinking level
// "minimal", заточен под document extraction). Смена версии — через GEMINI_MODEL.
const DEFAULT_MODEL = "gemini-3.5-flash-lite"
const API_BASE = "https://generativelanguage.googleapis.com/v1beta"

export const getGeminiModel = (): string =>
  process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL

// Ключ из GEMINI_API_KEY (либо GOOGLE_API_KEY — вторая конвенция Google GenAI).
// Отсутствие — понятная ошибка (ИИ не сконфигурирована), а не «молчаливый» запрос
// с пустым ключом.
const getApiKey = (): string => {
  const key =
    process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim()
  if (!key) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "AI is not configured: set GEMINI_API_KEY"
    )
  }
  return key
}

// Вызов функции, который просит модель (function-calling / tool-use).
export type GeminiFunctionCall = {
  name: string
  args: Record<string, unknown>
}

// Часть контента: текст, inline-файл (base64), запрос вызова функции моделью
// (functionCall) либо результат исполнения инструмента, возвращаемый модели
// (functionResponse). Схема ответа/аргументов — плоский объект Gemini Schema
// (тип UPPERCASE: OBJECT/ARRAY/STRING/NUMBER).
//
// `thoughtSignature` — зашифрованная подпись рассуждения, которую Gemini 3
// возвращает на части хода модели. Её ОБЯЗАТЕЛЬНО вернуть обратно в истории:
// первый functionCall каждого шага без подписи → HTTP 400. Официальные SDK делают
// это сами, мы ходим по REST → подпись держится тем, что оркестратор дописывает в
// диалог сырые `candidate.parts` целиком (см. orchestrator.ts). Поле описано в
// типе, чтобы это условие было видно и не сломалось при рефакторинге «почистим
// лишние поля».
export type GeminiPart =
  | { text: string; thoughtSignature?: string }
  | { inlineData: { mimeType: string; data: string } }
  | { functionCall: GeminiFunctionCall; thoughtSignature?: string }
  | { functionResponse: { name: string; response: Record<string, unknown> } }

// Декларация инструмента для function-calling (parameters — Gemini Schema).
export type GeminiFunctionDeclaration = {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export type GeminiTool = {
  functionDeclarations: GeminiFunctionDeclaration[]
}

// ВАЖНО про generationConfig: `temperature`/`topP`/`topK` для Gemini 3 объявлены
// устаревшими и игнорируются, а Google прямо требует их НЕ передавать (будущие
// модели ответят 400). Крутить «температуру для живости ответа» здесь нечего —
// поведение задаётся системным промптом и `thinkingConfig`.
// Полезные поля: `thinkingConfig.thinkingLevel` ("minimal"|"medium"|"high") и
// `maxOutputTokens`. У flash-lite уровень по умолчанию "minimal" — для
// tool-use агента этого мало (Google: приводит к преждевременному прекращению
// вызова инструментов), поэтому вызывающий код задаёт уровень явно.
export type GeminiRequest = {
  systemInstruction?: { parts: { text: string }[] }
  contents: { role: string; parts: GeminiPart[] }[]
  tools?: GeminiTool[]
  generationConfig?: Record<string, unknown>
}

// Разобранный ответ первого кандидата: сырые части (для дозаписи хода модели в
// диалог), склеенный текст и извлечённые вызовы функций (для tool-use loop).
export type GeminiCandidate = {
  parts: GeminiPart[]
  text: string
  functionCalls: GeminiFunctionCall[]
}

// Опции транспорта, общие для обычного и потокового вызова. `signal` — отмена
// запроса извне: покупатель нажал «Стоп», клиент оборвал SSE-соединение, и
// держать открытым обращение к модели незачем (T10.1d).
export type GeminiCallOptions = {
  signal?: AbortSignal
}

// Низкоуровневый вызов generateContent. Возвращает разобранного первого
// кандидата. Ошибки сети/HTTP → понятный MedusaError.
export const geminiGenerate = async (
  body: GeminiRequest,
  options: GeminiCallOptions = {}
): Promise<GeminiCandidate> => {
  const key = getApiKey()
  const model = getGeminiModel()
  const url = `${API_BASE}/models/${encodeURIComponent(model)}:generateContent`

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
      signal: options.signal,
    })
  } catch (e) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Gemini request failed: ${(e as Error).message}`
    )
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Gemini HTTP ${res.status}: ${detail.slice(0, 500)}`
    )
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: GeminiPart[] } }[]
  }
  const parts = json.candidates?.[0]?.content?.parts ?? []

  const text = parts
    .map((p) => ("text" in p ? p.text : ""))
    .join("")
  const functionCalls = parts
    .filter((p): p is { functionCall: GeminiFunctionCall } => "functionCall" in p)
    .map((p) => p.functionCall)

  return { parts, text, functionCalls }
}

// Тонкая обёртка: вернуть только склеенный текст первого кандидата (для
// structured output — JSON-строка). Используется ИИ-приёмкой накладной.
export const geminiGenerateContent = async (
  body: GeminiRequest
): Promise<string> => {
  const { text } = await geminiGenerate(body)
  return text
}

// --- Потоковый вызов (T10.1d) ---

// Опции потокового вызова: [onText] получает КАЖДЫЙ текстовый дельта-фрагмент по
// мере поступления (клиент печатает ответ), `signal` отменяет запрос.
export type GeminiStreamOptions = GeminiCallOptions & {
  onText?: (delta: string) => void
}

// Дописать часть в аккумулятор хода модели. Соседние текстовые части СКЛЕИВАЕМ:
// поток режет ответ на десятки фрагментов, а в историю диалога он должен уйти
// одной частью (так же, как её вернул бы обычный generateContent). Подпись
// рассуждения (`thoughtSignature`) при склейке сохраняем — без неё Gemini 3
// отвечает 400 на следующем шаге tool-use loop (см. GeminiPart).
const appendPart = (parts: GeminiPart[], part: GeminiPart): void => {
  const last = parts[parts.length - 1]
  if (last && "text" in last && "text" in part) {
    last.text += part.text
    if (!last.thoughtSignature && part.thoughtSignature) {
      last.thoughtSignature = part.thoughtSignature
    }
    return
  }
  parts.push(part)
}

// Разобрать одно SSE-событие Gemini (`data: {...}`) и раздать части наружу.
const consumeStreamEvent = (
  raw: string,
  parts: GeminiPart[],
  onText?: (delta: string) => void
): void => {
  const payload = raw
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("")
  if (!payload || payload === "[DONE]") {
    return
  }
  let json: { candidates?: { content?: { parts?: GeminiPart[] } }[] }
  try {
    json = JSON.parse(payload)
  } catch {
    // Битый кусок потока не роняет ход: пропускаем событие.
    return
  }
  for (const part of json.candidates?.[0]?.content?.parts ?? []) {
    appendPart(parts, part)
    if ("text" in part && part.text) {
      onText?.(part.text)
    }
  }
}

// Потоковый generateContent (`?alt=sse`). Возвращает того же разобранного
// кандидата, что и [geminiGenerate] — поток нужен только чтобы отдавать текст по
// мере генерации; истина о ходе (части для истории, вызовы инструментов) собрана
// целиком к моменту возврата.
export const geminiStream = async (
  body: GeminiRequest,
  options: GeminiStreamOptions = {}
): Promise<GeminiCandidate> => {
  const key = getApiKey()
  const model = getGeminiModel()
  const url =
    `${API_BASE}/models/${encodeURIComponent(model)}` +
    `:streamGenerateContent?alt=sse`

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
      signal: options.signal,
    })
  } catch (e) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Gemini stream request failed: ${(e as Error).message}`
    )
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Gemini HTTP ${res.status}: ${detail.slice(0, 500)}`
    )
  }
  if (!res.body) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Gemini stream returned no body"
    )
  }

  const parts: GeminiPart[] = []
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    buffer += decoder.decode(value, { stream: true })
    // События SSE разделены пустой строкой; последний (возможно неполный)
    // фрагмент остаётся в буфере до следующего чтения.
    const events = buffer.split(/\r?\n\r?\n/)
    buffer = events.pop() ?? ""
    for (const event of events) {
      consumeStreamEvent(event, parts, options.onText)
    }
  }
  if (buffer.trim()) {
    consumeStreamEvent(buffer, parts, options.onText)
  }

  const text = parts.map((p) => ("text" in p ? p.text : "")).join("")
  const functionCalls = parts
    .filter((p): p is { functionCall: GeminiFunctionCall } => "functionCall" in p)
    .map((p) => p.functionCall)

  return { parts, text, functionCalls }
}
