import { getAuthHeaders } from "@lib/data/cookies"
import { getStorefrontPublishableKey } from "@lib/data/tenant"
import { getLocaleHeader } from "@lib/util/get-locale-header"

// Прокси обычного (непотокового) хода ассистента: браузер → этот route handler
// → `POST /store/assistant/chat` бэкенда. Нужен как ОТКАТ, когда поток не
// открылся (старый бэкенд, прокси стрима недоступен).
//
// Server action здесь не годится по той же причине, что и у распознавания
// голоса: с вложением (T10.4) тело хода — до 12 МБ base64, а у действий Next
// предел 1 МБ, и ход с фотографией отваливался бы молча. Логики диалога здесь
// нет — только проброс тела и заголовков.

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function POST(request: Request) {
  const headers: Record<string, string> = { "content-type": "application/json" }
  // Ключ витрины текущего продавца: по нему бэкенд выбирает канал корзины.
  const publishableKey = await getStorefrontPublishableKey()
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

  const upstream = await fetch(`${MEDUSA_BACKEND_URL}/store/assistant/chat`, {
    method: "POST",
    headers,
    body: await request.text(),
    // Покупатель ушёл со страницы → обрываем и обращение к бэкенду.
    signal: request.signal,
    cache: "no-store",
  })

  return new Response(await upstream.text().catch(() => ""), {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
