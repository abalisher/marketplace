import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { placeOrderWorkflow } from "../../../workflows/place-order"
import { StorePlaceOrderType } from "./validators"

// POST /store/orders — оформление заказа текущим покупателем: завершает его
// корзину (ядровый completeCart + резерв остатков) и заводит жизненный цикл
// заказа (OrderLifecycle=new). Тонкий роут: вся логика — в placeOrderWorkflow.
// Список/детали заказов покупателя обслуживает ядро (GET /store/orders[/:id]);
// свой статус ТЗ — GET /store/orders/:id/lifecycle.
export async function POST(
  req: AuthenticatedMedusaRequest<StorePlaceOrderType>,
  res: MedusaResponse
) {
  const { result } = await placeOrderWorkflow(req.scope).run({
    input: { cart_id: req.validatedBody.cart_id },
    throwOnError: true,
  })

  res.status(201).json({ order: result.order, lifecycle: result.lifecycle })
}
