import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { assertCartWritable } from "../../../../lib/assistant/cart-write"
import {
  emptyCartSummary,
  summarizeCart,
} from "../../../../lib/assistant/tools/cart-summary"

// GET /store/assistant/cart?cart_id=… — состав корзины чата для полосы корзины
// над композером (T10.15). Нужен потому, что корзину меняют ДВА пути: кнопки
// «−/+» (ответ роута уже несёт свежую сводку) и сам ассистент инструментами —
// после хода модели клиент знает только cart_id, а показать обязан правду.
//
// Право смотреть — то же, что право писать: владение cart_id (капабилити-токен
// клиента) плюс отказ по чужой учётке зарегистрированного покупателя.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const cartId =
    typeof req.query.cart_id === "string" ? req.query.cart_id.trim() : ""
  if (!cartId) {
    res.json({ cart_id: null, cart: emptyCartSummary() })
    return
  }

  await assertCartWritable(req.scope, cartId, req.auth_context?.actor_id)
  const summary = await summarizeCart(req.scope, cartId)
  res.json({
    cart_id: summary ? cartId : null,
    cart: summary ?? emptyCartSummary(),
  })
}
