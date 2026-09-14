import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { prepareAssistantFiles } from "../../../../../lib/assistant/file-input"
import { runAssistantTurn } from "../../../../../lib/assistant/orchestrator"
import { StoreAssistantChatType } from "../../validators"

// POST /store/assistant/chat/stream — тот же ход ассистента, что и
// `/store/assistant/chat`, но ответ печатается по мере генерации (T10.1d).
// Транспорт — SSE (Server-Sent Events): один POST, поток событий в ответ.
// Тело запроса и смысл токенов сессии (cart_id / order_id) — те же, роут так же
// тонкий: вся логика в lib/assistant.
//
// События потока:
// - `open`  — поток открыт (первый байт). По нему клиент понимает, что стриминг
//             поддерживается: НЕ получив его, он откатывается на обычный POST.
// - `delta` — `{ text }`: очередной фрагмент ответа, клиент дописывает его.
// - `reset` — сбросить напечатанное и печатать заново (модель написала
//             преамбулу перед вызовом инструмента — в ответ она не попадает).
// - `state` — `{ cart_id, order_id }`: токены сессии изменились посреди хода
//             (инструмент создал корзину / оформил заказ). Клиент запоминает их
//             сразу: если ход оборвут «Стопом», итог до него уже не доедет.
// - `done`  — `{ reply, messages, cart_id, order_id, attachments, aborted }`:
//             тот же payload, что у обычного POST, и он АВТОРИТЕТЕН — клиент
//             берёт историю, токены и вставки отсюда, а не из склеенных дельт.
// - `error` — `{ message }`: ход не удался (после `open` откат на POST не
//             делаем: инструменты хода могли уже сработать, повтор их
//             продублировал бы).
//
// «Стоп» покупателя = обрыв соединения клиентом: ход прекращается
// (AbortController), уже исполненные инструменты НЕ откатываются — корзина и
// заказ живут на бэкенде, а не в черновике ответа.
export async function POST(
  req: AuthenticatedMedusaRequest<StoreAssistantChatType>,
  res: MedusaResponse
) {
  // Вложения проверяем ДО открытия потока: негодный файл должен получить
  // честный 400, а не `event: error` внутри уже открытого потока — по контракту
  // после `open` клиент на обычный POST не откатывается (T10.1d).
  const files = prepareAssistantFiles(
    (req.validatedBody.files ?? []).map((f) => ({
      mimeType: f.mime_type,
      data: f.data,
      name: f.name,
    }))
  )

  const abort = new AbortController()
  res.on("close", () => {
    if (!res.writableEnded) {
      abort.abort()
    }
  })

  res.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    // no-transform — чтобы прокси (nginx на VPS) не буферизовал и не сжимал
    // поток: иначе покупатель увидит ответ целиком в самом конце.
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "x-accel-buffering": "no",
  })

  const send = (event: string, data: Record<string, unknown>) => {
    if (res.writableEnded) {
      return
    }
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  send("open", {})

  try {
    const result = await runAssistantTurn(
      req.scope,
      req.validatedBody.messages,
      {
        cartId: req.validatedBody.cart_id,
        customerId: req.auth_context?.actor_id,
        lastOrderId: req.validatedBody.order_id,
        files,
      },
      {
        onTextDelta: (text) => send("delta", { text }),
        onTextReset: () => send("reset", {}),
        onState: (tokens) =>
          send("state", {
            cart_id: tokens.cartId,
            order_id: tokens.orderId,
          }),
        signal: abort.signal,
      }
    )
    send("done", {
      reply: result.reply,
      messages: result.messages,
      cart_id: result.cartId,
      order_id: result.orderId,
      attachments: result.attachments,
      aborted: result.aborted === true,
    })
  } catch (e) {
    send("error", { message: (e as Error).message })
  } finally {
    res.end()
  }
}
