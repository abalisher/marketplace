import { MedusaContainer } from "@medusajs/framework/types"
import {
  GeminiFunctionCall,
  GeminiPart,
  GeminiRequest,
  geminiGenerate,
  geminiStream,
} from "../gemini"
import { dedupeAttachments } from "./attachments"
import { attachCartToCustomer } from "./cart-ownership"
import { isCompaniesEnabled } from "../feature-flags"
import { buildAssistantSystemPrompt } from "./system-prompt"
import { summarizeCart } from "./tools/cart-summary"
import { findAssistantTool, getAssistantTools } from "./tools/registry"
import {
  AssistantContext,
  AssistantMessage,
  AssistantStreamHooks,
  AssistantTurnResult,
} from "./types"

// Оркестрация одного хода разговорного ассистента (пивот №3, провайдер — Gemini
// function-calling). Stateless: история приходит от клиента, тут же исполняется
// tool-use loop, наружу — ответ ассистента + дополненная история. Логика ТОЛЬКО
// в бэкенде (CLAUDE.md): клиент — тонкая чат-оболочка.

// Предел итераций tool-use loop (защита от зацикливания модели на вызовах).
const MAX_TOOL_HOPS = 8

// Параметры генерации для разговорного хода.
//
// `thinkingLevel: "medium"` — ключевая настройка: у flash-lite уровень по
// умолчанию "minimal", а Google рекомендует medium/high для агентов с вызовом
// инструментов, иначе модель преждевременно прекращает вызовы (у нас это
// проявлялось исчерпанием MAX_TOOL_HOPS и фолбэком «ответ не сформировался»,
// а также тем, что часть правил промпта роняется). ИИ-приёмка накладной
// (invoice-ai) остаётся на "minimal" — там извлечение из документа, за чем
// flash-lite и брали.
//
// `maxOutputTokens` — мысли модели расходуют бюджет вывода, поэтому лимит с
// запасом: при обрезании ответ приходит пустым, и покупатель видит фолбэк.
//
// temperature/topP/topK НЕ задаём осознанно — см. комментарий в gemini.ts.
const ASSISTANT_GENERATION_CONFIG = {
  thinkingConfig: { thinkingLevel: "medium" },
  maxOutputTokens: 4096,
}

// Роль клиента → роль Gemini (принимает только user|model).
const toGeminiRole = (role: AssistantMessage["role"]): "user" | "model" =>
  role === "assistant" ? "model" : "user"

// Снимок корзины на начало хода (T10.15). Нужен потому, что покупатель теперь
// меняет состав САМ — счётчиками «−/+» на карточках, без единого слова в чате
// (`POST /store/assistant/cart/items`). Из переписки этих изменений не видно, и
// без снимка модель говорила бы о корзине по памяти диалога — ровно то
// расхождение слов с состоянием, которое чинил T2.3a. Снимок детерминированный:
// не полагаемся на то, что модель догадается вызвать view_cart.
const describeCartSnapshot = async (
  container: MedusaContainer,
  cartId: string
): Promise<string | null> => {
  let summary
  try {
    summary = await summarizeCart(container, cartId)
  } catch {
    // Прочитать не удалось — ход из-за этого падать не должен: у модели
    // остаётся view_cart.
    return null
  }
  if (!summary) {
    return null
  }

  const header =
    "СОСТАВ КОРЗИНЫ НА НАЧАЛО ХОДА (прочитан из базы; покупатель мог менять " +
    "его кнопками «−/+» на карточках, ничего не написав в чате — это правда " +
    "состояния, переписка тут не источник):"
  if (summary.items.length === 0) {
    return `${header}\nКорзина пуста.`
  }

  const lines = summary.items.map(
    (it) =>
      `- ${it.title}: ${it.quantity} × ${it.unit_price} = ${it.total} ` +
      `${summary.currency.toUpperCase()} (variant_id: ${it.variant_id})`
  )
  return (
    `${header}\n${lines.join("\n")}\n` +
    `Итого: ${summary.total} ${summary.currency.toUpperCase()}.\n` +
    "Говори о корзине по этим цифрам. Если покупатель только что набрал " +
    "состав кнопками — не пересказывай ему весь список заново, просто продолжай " +
    "разговор с учётом того, что позиции уже в корзине."
  )
}

// Исполнить вызов инструмента; ошибку не глушим наружу как 500, а возвращаем
// модели как functionResponse.error — пусть переспросит/извинится.
const runToolCall = async (
  container: MedusaContainer,
  call: GeminiFunctionCall,
  context: AssistantContext
): Promise<GeminiPart> => {
  const tool = findAssistantTool(call.name)
  if (!tool) {
    return {
      functionResponse: {
        name: call.name,
        response: { error: `Unknown tool: ${call.name}` },
      },
    }
  }
  try {
    const result = await tool.execute(container, call.args ?? {}, context)
    return { functionResponse: { name: call.name, response: result } }
  } catch (e) {
    return {
      functionResponse: {
        name: call.name,
        response: { error: (e as Error).message },
      },
    }
  }
}

// След реплики, состоявшей из ОДНОГО вложения без подписи (T10.4). В истории
// такая реплика остаётся пустой строкой, а Gemini пустые `parts` не принимает —
// на следующем ходе на её место встаёт эта пометка.
const PAST_ATTACHMENT_MARK = "[вложение покупателя, в этом ходе не показано]"

export const runAssistantTurn = async (
  container: MedusaContainer,
  history: AssistantMessage[],
  context: AssistantContext = {},
  stream?: AssistantStreamHooks
): Promise<AssistantTurnResult> => {
  // Инструменты копят UI-вложения хода сюда (payment/order_status/documents/auth_prompt).
  context.attachments = []
  // Пер-ходовый guard сильного округления add_to_cart (см. types.ts).
  context.roundingGuardVariants = new Set()

  // Покупатель вошёл посреди диалога (кнопка входа в ленте, T10.8) — корзина,
  // собранная гостем, переезжает на него до того, как отработают инструменты.
  if (context.cartId && context.customerId) {
    await attachCartToCustomer(container, context.cartId, context.customerId)
  }

  // Вложения хода (T10.4) кладём частями к ПОСЛЕДНЕЙ реплике покупателя — той,
  // с которой их прислали, — и перед её текстом: так модель сначала смотрит на
  // фото, а потом читает подпись к нему (рекомендация Gemini для одного
  // изображения). Пустой текст реплики допустим: покупатель прислал один снимок
  // без слов, и придумывать за него подпись нечестно.
  const files = context.files ?? []
  const contents: { role: string; parts: GeminiPart[] }[] = history.map(
    (m, index) => {
      const parts: GeminiPart[] = []
      if (index === history.length - 1) {
        for (const file of files) {
          parts.push({
            inlineData: { mimeType: file.mimeType, data: file.data },
          })
        }
      }
      if (m.content) {
        parts.push({ text: m.content })
      }
      // Прошлый ход был снимком без подписи: текста в истории нет, а файла уже
      // нет тоже — вложение живёт ровно один ход. Пустые `parts` Gemini не
      // принимает, поэтому на место реплики встаёт след: модель обязана знать,
      // что вложение БЫЛО (в её ответе оно выписано словами), но пересказать
      // его заново ей не по чему.
      if (parts.length === 0) {
        parts.push({ text: PAST_ATTACHMENT_MARK })
      }
      return { role: toGeminiRole(m.role), parts }
    }
  )

  // Инструменты и инструкция собираются под текущие фича-флаги (T10.9):
  // замороженный домен не объявляется модели вовсе.
  const cartSnapshot = context.cartId
    ? await describeCartSnapshot(container, context.cartId)
    : null
  const systemInstruction = {
    parts: [
      { text: buildAssistantSystemPrompt({ companiesEnabled: isCompaniesEnabled() }) },
      ...(cartSnapshot ? [{ text: cartSnapshot }] : []),
    ],
  }
  const tools = [
    { functionDeclarations: getAssistantTools().map((t) => t.declaration) },
  ]

  // Один ход модели: со стримингом (T10.1d) — текст уходит клиенту дельтами по
  // мере генерации, без него — обычный generateContent. Текст-ПРЕАМБУЛА перед
  // вызовом инструмента («сейчас поищу…») в ответ не попадает — она нужна была
  // модели, а не покупателю; клиент уже напечатал её, поэтому просим сбросить
  // напечатанное (`onTextReset`) и печатать заново то, что придёт после
  // инструментов. `printed` — то, что покупатель видит на экране ПРЯМО СЕЙЧАС:
  // на нём строится ответ, если ход оборвали кнопкой «Стоп».
  let printed = ""
  // Токены сессии, о которых клиент уже знает: как только инструмент создаёт
  // корзину или оформляет заказ, досылаем их событием, не дожидаясь итога хода
  // (иначе «Стоп» посреди хода потерял бы созданную корзину).
  let sentTokens = `${context.cartId ?? ""}|${context.lastOrderId ?? ""}`
  const publishTokens = () => {
    if (!stream) {
      return
    }
    const tokens = `${context.cartId ?? ""}|${context.lastOrderId ?? ""}`
    if (tokens === sentTokens) {
      return
    }
    sentTokens = tokens
    stream.onState({ cartId: context.cartId, orderId: context.lastOrderId })
  }
  const generate = async (body: GeminiRequest) => {
    if (!stream) {
      return geminiGenerate(body)
    }
    const before = printed
    const candidate = await geminiStream(body, {
      signal: stream.signal,
      onText: (delta) => {
        printed += delta
        stream.onTextDelta(delta)
      },
    })
    if (candidate.functionCalls.length > 0 && printed !== before) {
      printed = ""
      stream.onTextReset()
    }
    return candidate
  }

  const toolCalls: GeminiFunctionCall[] = []
  // Успешные исполнения (без поля error в ответе инструмента): фолбэк
  // «действия выполнены» честен, только если что-то реально выполнилось —
  // заблокированные guard'ами вызовы не в счёт (ревью T2.3a).
  let successfulToolRuns = 0
  // Оформлен ли заказ на этом ходе: после place_order платёжная карточка в ленте
  // не нужна (см. attachments.ts).
  let orderPlaced = false
  let reply = ""
  // Покупатель нажал «Стоп» (клиент оборвал SSE): ход прекращаем там, где он
  // есть, уже исполненные инструменты НЕ откатываем (корзина, оплата и заказ —
  // состояние бэкенда, а не черновик ответа).
  let aborted = false

  for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
    if (stream?.signal?.aborted) {
      aborted = true
      break
    }
    let candidate
    try {
      candidate = await generate({
        systemInstruction,
        contents,
        tools,
        generationConfig: ASSISTANT_GENERATION_CONFIG,
      })
    } catch (e) {
      // Обрыв по «Стопу» — не ошибка хода: выходим с тем, что напечатано.
      if (stream?.signal?.aborted) {
        aborted = true
        break
      }
      throw e
    }

    if (candidate.functionCalls.length === 0) {
      reply = candidate.text.trim()
      break
    }

    // Дописываем ход модели (с functionCall) и результаты инструментов (ролью
    // user — Gemini принимает только user|model, functionResponse идёт от «нас»).
    contents.push({ role: "model", parts: candidate.parts })
    const responseParts: GeminiPart[] = []
    for (const call of candidate.functionCalls) {
      toolCalls.push(call)
      const part = await runToolCall(container, call, context)
      if (
        "functionResponse" in part &&
        !("error" in part.functionResponse.response)
      ) {
        successfulToolRuns++
        if (call.name === "place_order") {
          orderPlaced = true
        }
      }
      responseParts.push(part)
    }
    contents.push({ role: "user", parts: responseParts })
    publishTokens()
  }

  // Свёртка дублей вложений: за ход guard'ы и статусы могли положить одну и ту
  // же вставку несколько раз (см. attachments.ts).
  const buildAttachments = () =>
    dedupeAttachments(context.attachments ?? [], { orderPlaced })

  if (aborted) {
    // Ход оборван покупателем: ответом становится РОВНО то, что он успел
    // увидеть напечатанным. Ничего не напечаталось — ответа в ленте не будет
    // (историю возвращаем как пришла), фолбэки тут неуместны: покупатель сам
    // остановил ход.
    const partial = printed.trim()
    return {
      reply: partial,
      messages: partial
        ? [...history, { role: "assistant" as const, content: partial }]
        : history,
      cartId: context.cartId,
      orderId: context.lastOrderId,
      attachments: buildAttachments(),
      toolCalls,
      aborted: true,
    }
  }

  if (!reply) {
    // Лимит ходов исчерпан, а модель на последнем ходе снова вернула вызов
    // инструмента — текстового ответа так и нет. Делаем ФИНАЛЬНЫЙ проход БЕЗ
    // инструментов: модель обязана ответить текстом по уже собранным результатам.
    // Без этого покупатель видел бы аварийный фолбэк на валидном диалоге (баг,
    // пойманный вживую 2026-07-24: наращивание стены гипсокартоном → фолбэк).
    const closing = await generate({
      systemInstruction,
      contents,
      generationConfig: ASSISTANT_GENERATION_CONFIG,
    })
    reply = closing.text.trim()
  }

  if (!reply) {
    // Даже финальный проход не дал текста — последний понятный фолбэк.
    // Если на этом ходе выполнялись инструменты — действия УЖЕ произошли
    // (Ф-прогон T2.3: «давай в корзину» → фолбэк, а корзина создалась);
    // честно говорим об этом, а не делаем вид, что ничего не было.
    reply = successfulToolRuns > 0
      ? "Действия выполнены, но ответ не сформировался. Спросите «что в " +
        "корзине?» — покажу актуальный состав и итог."
      : "Не удалось подобрать ответ. Уточните, какой материал вы ищете."
  }

  // Фолбэчный текст (модель не дала ответа) клиент ещё не печатал — досылаем
  // его дельтой, иначе покупатель увидит пустой ответ до события `done`.
  if (stream && reply && printed.trim() !== reply) {
    stream.onTextReset()
    stream.onTextDelta(reply)
  }

  return {
    reply,
    messages: [...history, { role: "assistant", content: reply }],
    cartId: context.cartId,
    orderId: context.lastOrderId,
    attachments: buildAttachments(),
    toolCalls,
  }
}
