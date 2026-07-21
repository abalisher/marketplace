import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { KASPI_PROVIDER_ID } from "../../../../../../modules/payment-kaspi"
import { initCartKaspiPaymentWorkflow } from "../../../../../../workflows/init-cart-kaspi-payment"
import { syncCartKaspiPaymentWorkflow } from "../../../../../../workflows/sync-cart-kaspi-payment"
import { toKaspiPaymentResponse } from "../../../../../utils/kaspi-payment-response"
import { retrieveCounterCart } from "../../../helpers"
import { AdminInitCounterCartKaspiPaymentType } from "../../../validators"

// Kaspi-оплата POS-корзины с partner-стороны (гэп 2 сверки partner-раунда):
// store-вариант требует customer-auth + владение корзиной — админский JWT туда
// не проходит. Здесь те же workflows (init/sync-cart-kaspi-payment) за admin-
// аутентификацией ядра; доступ ограничен POS-корзинами (retrieveCounterCart →
// не-POS 404). Продавец показывает QR покупателю и поллит GET до authorized.

// POST /admin/counter-carts/:id/payment/kaspi — инициализация: payment
// collection + сессия Kaspi (инвойс + QR). Идемпотентен.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminInitCounterCartKaspiPaymentType>,
  res: MedusaResponse
) {
  await retrieveCounterCart(req.scope, req.params.id)

  const { result } = await initCartKaspiPaymentWorkflow(req.scope).run({
    input: {
      cart_id: req.params.id,
      scenario: req.validatedBody?.scenario,
    },
    throwOnError: true,
  })

  if (!result.payment_collection_id || !result.kaspi_session) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Kaspi payment session was not created"
    )
  }

  res.status(200).json({
    payment: toKaspiPaymentResponse({
      payment_collection_id: result.payment_collection_id,
      session: result.kaspi_session,
    }),
  })
}

// GET /admin/counter-carts/:id/payment/kaspi — статус оплаты (polling):
// синхронизирует сессию с инвойсом Kaspi; оплачено → authorized.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const cart = await retrieveCounterCart(req.scope, req.params.id)

  const kaspiSession = cart.payment_sessions.find(
    (session) => session.provider_id === KASPI_PROVIDER_ID
  )
  if (!kaspiSession) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Kaspi payment is not initialized for this cart"
    )
  }

  const { result } = await syncCartKaspiPaymentWorkflow(req.scope).run({
    input: { payment_session_id: kaspiSession.id },
    throwOnError: true,
  })

  res.json({
    payment: toKaspiPaymentResponse({
      payment_collection_id: cart.payment_collection_id!,
      session: result,
    }),
  })
}
