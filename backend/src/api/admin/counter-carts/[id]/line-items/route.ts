import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { retrieveCounterCart } from "../../helpers"
import { AdminAddCounterCartItemType } from "../../validators"

// POST /admin/counter-carts/:id/line-items — добавить позицию в POS-корзину.
// Вся механика (цены региона, инвентарь канала, суммирование повторного
// варианта, пересчёт payment collection) — ядровый addToCartWorkflow.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminAddCounterCartItemType>,
  res: MedusaResponse
) {
  // Проверка «это POS-корзина» до мутации (не-POS → 404).
  await retrieveCounterCart(req.scope, req.params.id)

  await addToCartWorkflow(req.scope).run({
    input: {
      cart_id: req.params.id,
      items: [
        {
          variant_id: req.validatedBody.variant_id,
          quantity: req.validatedBody.quantity,
        },
      ],
    },
    throwOnError: true,
  })

  const cart = await retrieveCounterCart(req.scope, req.params.id)
  res.json({ cart })
}
