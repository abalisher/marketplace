import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { loadCartPaymentView } from "../../../../../lib/payments/cart-payment-view"
import { initCartKaspiPaymentWorkflow } from "../../../../../workflows/init-cart-kaspi-payment"
import { initCartOfflinePaymentWorkflow } from "../../../../../workflows/payments/init-cart-offline-payment"
import { requireCartPaymentAccess } from "../../cart-payment-access"
import { requireOwnCart, sellerUsesStaticKaspiQr } from "../../helpers"
import { StoreSelectPaymentMethodType } from "../../validators"

// GET /store/carts/:id/payment-method — способы оплаты продавца корзины и
// выбранный способ (Kaspi QR, перевод по номеру Kaspi, в долг). Доступ — как у
// поллинга оплаты: гостю по cart_id, покупателю — только его корзина.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await requireCartPaymentAccess(req.scope, req.params.id, req.auth_context?.actor_id)
  const payment = await loadCartPaymentView(req.scope, req.params.id)
  if (!payment) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Cart ${req.params.id} not found`)
  }
  res.json({ payment })
}

// POST /store/carts/:id/payment-method — выбрать способ оплаты. Kaspi QR
// выставляет счёт (QR и ссылка), перевод и долг только запоминают выбор: заказ
// оформится сразу, а деньги продавец отметит сам. Только вошедшему владельцу
// корзины (заказ и деньги принадлежат учётке, T10.8).
export async function POST(
  req: AuthenticatedMedusaRequest<StoreSelectPaymentMethodType>,
  res: MedusaResponse
) {
  await requireOwnCart(req.scope, req.params.id, req.auth_context.actor_id)
  const { method, scenario } = req.validatedBody

  // Kaspi QR продавца с постоянным QR магазина (без API) — только «сначала
  // заказ, потом оплата»: заказ оформляется, QR и сумма — на странице заказа.
  if (method === "kaspi_qr" && (await sellerUsesStaticKaspiQr(req.scope, req.params.id))) {
    await initCartOfflinePaymentWorkflow(req.scope).run({
      input: { cart_id: req.params.id, method },
      throwOnError: true,
    })
  } else if (method === "kaspi_qr") {
    await initCartKaspiPaymentWorkflow(req.scope).run({
      input: { cart_id: req.params.id, scenario },
      throwOnError: true,
    })
  } else {
    await initCartOfflinePaymentWorkflow(req.scope).run({
      input: { cart_id: req.params.id, method },
      throwOnError: true,
    })
  }

  res.json({ payment: await loadCartPaymentView(req.scope, req.params.id) })
}
