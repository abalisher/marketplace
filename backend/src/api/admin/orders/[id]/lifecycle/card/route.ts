import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { buildOrderCard } from "./card"

// GET /admin/orders/:id/lifecycle/card — карточка заказа для drawer'а очереди
// (макет 1c, T4.2c): статус и таймлайн переходов, покупатель с лимитом отсрочки,
// позиции с итогами, доставка, документы и цели переходов — одним ответом.
// Сборка — в card.ts, роут тонкий. Namespace /lifecycle/ ядровые роуты заказа
// не перекрывает (как и остальные наши подпути).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  res.json({ order_card: await buildOrderCard(req.scope, req.params.id) })
}
