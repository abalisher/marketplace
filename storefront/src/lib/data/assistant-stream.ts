import type {
  AssistantChatResponse,
  AssistantChatRequest,
  AssistantMessage,
} from "@lib/data/assistant"

// Потоковый ход ассистента на клиенте (T10.1d). Запрос идёт в наш route handler
// `/api/assistant/stream` (он добавляет авторизацию и publishable-ключ и
// проксирует SSE бэкенда), ответ читается по событиям:
// - `open`  — поток открыт: стриминг поддерживается;
// - `delta` — фрагмент текста ответа (печатаем);
// - `reset` — сбросить напечатанное (была преамбула перед вызовом инструмента);
// - `state` — токены сессии изменились посреди хода (инструмент создал корзину
//   или оформил заказ): запоминаем сразу, иначе «Стоп» их потеряет;
// - `done`  — авторитетный итог хода (история, токены, вставки);
// - `error` — ход не удался.
// Бизнес-логики здесь нет: только транспорт.

// Поток недоступен (бэкенд без стриминга, прокси недоступен, соединение
// оборвалось ДО первого события) — вызывающий код откатывается на обычный POST.
// После `open` откат запрещён: инструменты хода могли уже сработать, и повтор
// продублировал бы их.
export class AssistantStreamUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AssistantStreamUnavailableError"
  }
}

export type AssistantStreamResult = Omit<AssistantChatResponse, "messages"> & {
  // Авторитетная история хода из события `done`. `null` — итога не было:
  // покупатель нажал «Стоп», и ленту клиент склеивает сам из напечатанного.
  messages: AssistantMessage[] | null
  // Ход оборван покупателем («Стоп»): `reply` — то, что успело напечататься.
  aborted?: boolean
}

export type AssistantStreamHandlers = {
  // Дописать фрагмент к напечатанному.
  onDelta: (text: string) => void
  // Сбросить напечатанное и печатать заново.
  onReset: () => void
  // Запомнить токены сессии, пришедшие посреди хода.
  onState: (tokens: { cart_id?: string; order_id?: string }) => void
  // «Стоп» покупателя: обрывает и запрос к нашему прокси, и ход на бэкенде.
  signal?: AbortSignal
}

// Разбор одного события SSE: строки `event:` и `data:` (данные могут быть
// разбиты на несколько строк — склеиваем).
const parseEvent = (raw: string): { event: string; data: string } => {
  let event = "message"
  const data: string[] = []
  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim()
    } else if (line.startsWith("data:")) {
      data.push(line.slice(5).trim())
    }
  }
  return { event, data: data.join("") }
}

export const streamAssistantMessage = async (
  request: AssistantChatRequest,
  handlers: AssistantStreamHandlers
): Promise<AssistantStreamResult> => {
  // То, что покупатель видит напечатанным ПРЯМО СЕЙЧАС: на этом строится ответ,
  // если ход оборвали «Стопом» (событие `done` в этом случае не придёт —
  // соединение уже разорвано).
  let printed = ""
  const abortedResult = (): AssistantStreamResult => ({
    reply: printed.trim(),
    messages: null,
    aborted: true,
  })

  let response: Response
  try {
    response = await fetch("/api/assistant/stream", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      signal: handlers.signal,
    })
  } catch (error) {
    if (handlers.signal?.aborted) {
      return abortedResult()
    }
    throw new AssistantStreamUnavailableError((error as Error).message)
  }

  // Тело хода забраковано (негодное вложение — бэкенд отклоняет его ДО открытия
  // потока, T10.4): откатываться на обычный POST незачем — он забракует то же
  // самое, а покупатель второй раз отправит те же мегабайты.
  if (response.status === 400) {
    throw new Error(`assistant turn rejected: ${response.status}`)
  }

  if (!response.ok || !response.body) {
    throw new AssistantStreamUnavailableError(
      `stream unavailable: ${response.status}`
    )
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let opened = false
  let done: AssistantStreamResult | undefined
  let failure: string | undefined

  const consume = (raw: string) => {
    const { event, data } = parseEvent(raw)
    switch (event) {
      case "open":
        opened = true
        return
      case "delta": {
        opened = true
        const { text } = JSON.parse(data) as { text: string }
        printed += text
        handlers.onDelta(text)
        return
      }
      case "reset":
        printed = ""
        handlers.onReset()
        return
      case "state":
        handlers.onState(
          JSON.parse(data) as { cart_id?: string; order_id?: string }
        )
        return
      case "done":
        done = JSON.parse(data) as AssistantStreamResult
        return
      case "error":
        failure = (JSON.parse(data) as { message: string }).message
        return
      default:
        return
    }
  }

  try {
    for (;;) {
      const chunk = await reader.read()
      if (chunk.done) {
        break
      }
      buffer += decoder.decode(chunk.value, { stream: true })
      const events = buffer.split(/\r?\n\r?\n/)
      buffer = events.pop() ?? ""
      for (const event of events) {
        consume(event)
      }
      if (done || failure) {
        break
      }
    }
    if (!done && !failure && buffer.trim()) {
      consume(buffer)
    }
  } catch (error) {
    // «Стоп» рвёт чтение — это штатный конец потока, а не сбой.
    if (handlers.signal?.aborted) {
      return abortedResult()
    }
    throw opened
      ? (error as Error)
      : new AssistantStreamUnavailableError((error as Error).message)
  } finally {
    // Читать больше нечего: отпускаем соединение (при «Стопе» — рвём его).
    void reader.cancel().catch(() => undefined)
  }

  if (done) {
    return done
  }
  if (failure) {
    throw new Error(failure)
  }
  if (handlers.signal?.aborted) {
    return abortedResult()
  }
  // Поток закрылся без итога хода: до `open` — считаем стриминг недоступным
  // (откат на POST), после — честная ошибка хода.
  if (!opened) {
    throw new AssistantStreamUnavailableError("stream closed without events")
  }
  throw new Error("assistant stream ended without a result")
}
