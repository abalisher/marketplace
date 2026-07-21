import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  deleteLineItemsWorkflow,
  updateLineItemInCartWorkflow,
} from "@medusajs/medusa/core-flows"
import { retrieveCounterCart } from "../../../helpers"
import { AdminUpdateCounterCartItemType } from "../../../validators"

// POST /admin/counter-carts/:id/line-items/:line_id — сменить количество
// позиции POS-корзины (ядровый updateLineItemInCartWorkflow: инвентарь,
// пересчёт тоталов и payment collection).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateCounterCartItemType>,
  res: MedusaResponse
) {
  await retrieveCounterCart(req.scope, req.params.id)

  await updateLineItemInCartWorkflow(req.scope).run({
    input: {
      cart_id: req.params.id,
      item_id: req.params.line_id,
      update: { quantity: req.validatedBody.quantity },
    },
    throwOnError: true,
  })

  const cart = await retrieveCounterCart(req.scope, req.params.id)
  res.json({ cart })
}

// DELETE /admin/counter-carts/:id/line-items/:line_id — убрать позицию.
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await retrieveCounterCart(req.scope, req.params.id)

  await deleteLineItemsWorkflow(req.scope).run({
    input: {
      cart_id: req.params.id,
      ids: [req.params.line_id],
    },
    throwOnError: true,
  })

  const cart = await retrieveCounterCart(req.scope, req.params.id)
  res.json({ cart })
}
