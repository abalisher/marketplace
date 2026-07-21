import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createCounterCartWorkflow } from "../../../workflows/create-counter-cart"
import { retrieveCounterCart } from "./helpers"
import { AdminCreateCounterCartType } from "./validators"

// POST /admin/counter-carts — POS-корзина продавца (продажа у окна склада,
// гэп 1 сверки partner-раунда): создаётся с контекстом склада (регион, канал,
// адрес) и pickup-опцией 0 ₸ этого склада. Дальше продавец наполняет её
// line-items-роутами, принимает оплату (payment/kaspi | payment/cash) и
// пробивает продажу через POST /admin/counter-orders.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateCounterCartType>,
  res: MedusaResponse
) {
  const { result } = await createCounterCartWorkflow(req.scope).run({
    input: req.validatedBody,
    throwOnError: true,
  })

  const cart = await retrieveCounterCart(req.scope, result.cart_id)
  res.status(201).json({ cart })
}
