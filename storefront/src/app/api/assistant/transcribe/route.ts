import { getAuthHeaders } from "@lib/data/cookies"

// Прокси распознавания голоса (T10.3): браузер → этот route handler →
// `POST /store/assistant/transcribe` бэкенда. Причины те же, что у прокси
// стрима: токен покупателя лежит в httpOnly-cookie (браузеру он недоступен), а
// publishable-ключ и адрес бэкенда остаются серверными.
//
// Server action здесь не годится: тело — запись в base64 до 8 МБ, а у действий
// Next по умолчанию предел 1 МБ. Логики нет — только проброс тела и заголовков.

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function POST(request: Request) {
  const headers: Record<string, string> = { "content-type": "application/json" }
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (publishableKey) {
    headers["x-publishable-api-key"] = publishableKey
  }
  const auth = (await getAuthHeaders()) as { authorization?: string }
  if (auth.authorization) {
    headers.authorization = auth.authorization
  }

  const upstream = await fetch(
    `${MEDUSA_BACKEND_URL}/store/assistant/transcribe`,
    {
      method: "POST",
      headers,
      body: await request.text(),
      // Покупатель отменил распознавание → браузер оборвал этот запрос →
      // обрываем и обращение к бэкенду.
      signal: request.signal,
      cache: "no-store",
    }
  )

  return new Response(await upstream.text().catch(() => ""), {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
