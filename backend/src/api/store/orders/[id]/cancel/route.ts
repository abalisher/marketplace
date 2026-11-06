import { MedusaError } from "@medusajs/framework/utils"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { cancelOrderWorkflow } from "../../../../../workflows/cancel-order"
import { requireOwnOrder } from "../../helpers"
import { StoreCancelOrderType } from "../../validators"

// POST /store/orders/:id/cancel — покупатель отменяет свой заказ, пока продавец
// его не подтвердил (статус new). Стейт-машина и ядро проверяют остальное.
// Чужой заказ — 404.
export async function POST(
  req: AuthenticatedMedusaRequest<StoreCancelOrderType>,
  res: MedusaResponse
) {
  const order = await requireOwnOrder(
    req.scope,
    req.params.id,
    req.auth_context.actor_id
  )

  // Сам покупатель отменяет только неподтверждённый заказ: подтверждённый
  // продавец уже взял в работу (собирает, везёт) — такую отмену покупатель
  // согласует с продавцом, а отменяет продавец в панели.
  const status = (order as { order_lifecycle?: { status?: string } | null })
    .order_lifecycle?.status
  if (status && status !== "new") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Заказ уже подтверждён продавцом — отменить его можно только через продавца"
    )
  }

  const { result } = await cancelOrderWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      actor_type: "buyer",
      actor_id: req.auth_context.actor_id,
      reason: req.validatedBody.reason ?? null,
    },
    throwOnError: true,
  })

  res.json({ order_id: req.params.id, status: result.to })
}
