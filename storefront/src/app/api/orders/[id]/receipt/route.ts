import { getAuthHeaders } from "@lib/data/cookies"
import { getStorefrontPublishableKey } from "@lib/data/tenant"

// Прокси чека Kaspi покупателя: браузер → этот route handler →
// `POST /store/orders/:id/payment/receipts`. Server action не годится по той же
// причине, что у ходов с вложением: снимок чека — до 8 МБ base64, у действий
// Next предел 1 МБ. Логики нет — только тело, ключ витрины и сессия.

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const headers: Record<string, string> = { "content-type": "application/json" }
  const publishableKey = await getStorefrontPublishableKey()
  if (publishableKey) {
    headers["x-publishable-api-key"] = publishableKey
  }
  const auth = (await getAuthHeaders()) as { authorization?: string }
  if (auth.authorization) {
    headers.authorization = auth.authorization
  }

  const upstream = await fetch(
    `${MEDUSA_BACKEND_URL}/store/orders/${encodeURIComponent(id)}/payment/receipts`,
    {
      method: "POST",
      headers,
      body: await request.text(),
      signal: request.signal,
      cache: "no-store",
    }
  )

  return new Response(await upstream.text().catch(() => ""), {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
