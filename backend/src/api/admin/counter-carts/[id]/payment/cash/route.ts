import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { initCartCashPaymentWorkflow } from "../../../../../../workflows/init-cart-cash-payment"
import { retrieveCounterCart } from "../../../helpers"

// POST /admin/counter-carts/:id/payment/cash — оплата наличными/переводом у
// окна: сессия pp_system_default (авторизуется сама в completeCart, деньги
// продавец принимает физически). Идемпотентен; вызов после инициализации Kaspi
// переключает способ оплаты (ядро заменяет сессию коллекции). Механики QR нет —
// ответ короче Kaspi-варианта.
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await retrieveCounterCart(req.scope, req.params.id)

  const { result } = await initCartCashPaymentWorkflow(req.scope).run({
    input: { cart_id: req.params.id },
    throwOnError: true,
  })

  if (!result.payment_collection_id || !result.session) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Cash payment session was not created"
    )
  }

  res.status(200).json({
    payment: {
      payment_collection_id: result.payment_collection_id,
      payment_session_id: result.session.id,
      status: result.session.status,
    },
  })
}
