import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { applyCartQuantities } from "../../../../../lib/assistant/cart-write"
import { StoreAssistantCartItemsType } from "../../validators"

// POST /store/assistant/cart/items — счётчики «−/+» на карточках подбора
// (T10.15, решение владельца 2026-08-31). Карточка перестала быть «выбором,
// который отправляет реплику»: покупатель набирает состав кнопками, и это НЕ
// ход модели — иначе каждое нажатие стоило бы 5–8 секунд и токенов.
//
// Роут тонкий: валидация тела в middleware, запись — общий `applyCartQuantities`
// (та же логика корзины, что у инструментов модели). Гость допускается: первое
// «+» создаёт корзину, как это делает add_to_cart. Ассистент про эти изменения
// узнаёт на следующем ходе — оркестратор кладёт в контекст снимок корзины.
export async function POST(
  req: AuthenticatedMedusaRequest<StoreAssistantCartItemsType>,
  res: MedusaResponse
) {
  const { cartId, summary } = await applyCartQuantities(req.scope, {
    cartId: req.validatedBody.cart_id,
    customerId: req.auth_context?.actor_id,
    items: req.validatedBody.items,
  })

  res.json({ cart_id: cartId ?? null, cart: summary })
}
