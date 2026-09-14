import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { KASPI_PROVIDER_ID } from "../../../../../../modules/payment-kaspi"
import { initCartKaspiPaymentWorkflow } from "../../../../../../workflows/init-cart-kaspi-payment"
import { syncCartKaspiPaymentWorkflow } from "../../../../../../workflows/sync-cart-kaspi-payment"
import { toKaspiPaymentResponse } from "../../../../../utils/kaspi-payment-response"
import { requireCartPaymentAccess } from "../../../cart-payment-access"
import { requireOwnCart } from "../../../helpers"
import { StoreInitKaspiPaymentType } from "../../../validators"

// Оплата корзины через Kaspi. Тонкие роуты: владение корзиной — requireOwnCart
// (чужая → 404), вся логика — в workflows. Механика денег (collection/session/
// Payment/авторизация) — ядро @medusajs/payment; здесь только Kaspi-точка входа
// для тонких клиентов (mobile/web): один вызов → QR, второй → статус.
// GET (поллинг статуса) доступен и ГОСТЮ по капабилити cart_id (T2.4: авто-
// поллинг оплаты в чате гостевого checkout'а) — requireCartPaymentAccess;
// POST (инициализация) остаётся только залогиненному владельцу.

// POST /store/carts/:id/payment/kaspi — инициализация оплаты: payment
// collection на сумму корзины + сессия Kaspi (инвойс + QR). Идемпотентен —
// повторный вызов возвращает существующую сессию.
export async function POST(
  req: AuthenticatedMedusaRequest<StoreInitKaspiPaymentType>,
  res: MedusaResponse
) {
  await requireOwnCart(req.scope, req.params.id, req.auth_context.actor_id)

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

// GET /store/carts/:id/payment/kaspi — статус оплаты (polling): синхронизирует
// сессию с инвойсом Kaspi; оплачено → authorized (можно оформлять заказ).
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const cart = await requireCartPaymentAccess(
    req.scope,
    req.params.id,
    req.auth_context?.actor_id
  )

  const kaspiSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.provider_id === KASPI_PROVIDER_ID
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
      payment_collection_id: cart.payment_collection!.id,
      session: result,
    }),
  })
}
