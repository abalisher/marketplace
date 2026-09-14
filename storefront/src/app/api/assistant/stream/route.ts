import { getAuthHeaders } from "@lib/data/cookies"
import { getLocaleHeader } from "@lib/util/get-locale-header"

// Прокси потокового хода ассистента (T10.1d): браузер → этот route handler →
// `POST /store/assistant/chat/stream` бэкенда, поток SSE отдаётся клиенту как
// есть. Прокси нужен по двум причинам:
// 1) токен покупателя лежит в httpOnly-cookie — браузер его не читает, а
//    подставить заголовок авторизации может только сервер;
// 2) publishable-ключ и адрес бэкенда остаются серверными.
// Логики диалога здесь нет — ни строчки: только проброс тела и заголовков.

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function POST(request: Request) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "text/event-stream",
  }
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (publishableKey) {
    headers["x-publishable-api-key"] = publishableKey
  }
  const auth = (await getAuthHeaders()) as { authorization?: string }
  if (auth.authorization) {
    headers.authorization = auth.authorization
  }
  try {
    const locale = await getLocaleHeader()
    if (locale["x-medusa-locale"]) {
      headers["x-medusa-locale"] = locale["x-medusa-locale"]
    }
  } catch {
    // Локаль не критична для хода — молча продолжаем.
  }

  const upstream = await fetch(
    `${MEDUSA_BACKEND_URL}/store/assistant/chat/stream`,
    {
      method: "POST",
      headers,
      body: await request.text(),
      // Покупатель нажал «Стоп» → браузер оборвал этот запрос → обрываем и
      // обращение к бэкенду, а тот гасит ход у модели.
      signal: request.signal,
      cache: "no-store",
    }
  )

  if (!upstream.ok || !upstream.body) {
    // Стрима нет (роут недоступен/ошибка до открытия потока) — клиент по
    // не-200 откатится на обычный POST.
    return new Response(await upstream.text().catch(() => ""), {
      status: upstream.status,
    })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  })
}
