import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { prepareAssistantFiles } from "../../../../lib/assistant/file-input"
import { assistantStorefrontContext } from "../../../../lib/tenants/storefront"
import { runAssistantTurn } from "../../../../lib/assistant/orchestrator"
import { StoreAssistantChatType } from "../validators"

// POST /store/assistant/chat — один ход разговорного ассистента покупателя
// (пивот №3, провайдер — Gemini function-calling). Гость допускается (покупатель
// начинает как гость, авторизуется перед оформлением; идиома estimator). Роут
// тонкий: валидация тела в middleware, tool-use loop — в lib/assistant. Stateless:
// клиент шлёт историю + держит cart_id между ходами, получает ответ ассистента,
// дополненную историю и актуальный cart_id (создаётся инструментом add_to_cart).
// customer_id берём из auth_context, если запрос авторизован (middleware пускает
// и гостя — allowUnregistered); гость → корзина без привязки к покупателю.
//
// `files` — вложения этого хода (T10.4): проверяются здесь (тип, размер, число)
// и уходят в ход как есть; нигде не сохраняются и в ответ не возвращаются —
// вложение видно модели ровно в том ходе, с которым его прислали.
export async function POST(
  req: AuthenticatedMedusaRequest<StoreAssistantChatType>,
  res: MedusaResponse
) {
  const { reply, messages, cartId, orderId, attachments } =
    await runAssistantTurn(req.scope, req.validatedBody.messages, {
      // Канал и продавец витрины — из publishable key запроса.
      ...(await assistantStorefrontContext(req.scope, req)),
      cartId: req.validatedBody.cart_id,
      customerId: req.auth_context?.actor_id,
      lastOrderId: req.validatedBody.order_id,
      files: prepareAssistantFiles(
        (req.validatedBody.files ?? []).map((f) => ({
          mimeType: f.mime_type,
          data: f.data,
          name: f.name,
        }))
      ),
    })
  res.json({
    reply,
    messages,
    cart_id: cartId,
    order_id: orderId,
    attachments,
  })
}
