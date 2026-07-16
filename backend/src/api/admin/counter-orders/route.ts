import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { placeCounterOrderWorkflow } from "../../../workflows/place-counter-order"
import { AdminPlaceCounterOrderType } from "../orders/validators"

// POST /admin/counter-orders — продажа у окна склада (POS): продавец собрал
// корзину покупателя на месте, оплата авторизована — заказ создаётся сразу
// выданным (свёрнутый путь new → delivered, только способ counter).
// Отдельный ресурс: статический сегмент под /admin/orders конфликтовал бы с
// ядровым /admin/orders/:id (как и очередь /admin/order-lifecycles).
// Пока вызывается админом; POS partner-приложения — отдельный дизайн-раунд.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminPlaceCounterOrderType>,
  res: MedusaResponse
) {
  const { result } = await placeCounterOrderWorkflow(req.scope).run({
    input: {
      cart_id: req.validatedBody.cart_id,
      location_id: req.validatedBody.location_id,
      actor_type: "admin",
      actor_id: req.auth_context.actor_id,
    },
    throwOnError: true,
  })

  res.status(201).json({ order: result.order, lifecycle: result.lifecycle })
}
