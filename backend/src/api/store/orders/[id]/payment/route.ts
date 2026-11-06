import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { loadBuyerOrderPayment } from "../../../../../lib/payments/order-payment-buyer-view"
import { changeOrderPaymentMethodWorkflow } from "../../../../../workflows/payments/change-order-payment-method"
import { settleOrderKaspiPaymentWorkflow } from "../../../../../workflows/payments/settle-order-kaspi-payment"
import { requireOwnOrder } from "../../helpers"
import { StoreChangeOrderPaymentMethodType } from "../../validators"

// GET /store/orders/:id/payment — оплата своего заказа: способ, сколько
// осталось, куда переводить (перевод, погашение долга), срок долга, счёт Kaspi
// (если способ сменён на Kaspi QR) и на что можно сменить способ. Счёт Kaspi
// заказа заодно опрашивается (поллинг страницы заказа): оплачен — заказ
// оплачен. Чужой заказ — 404 (requireOwnOrder). payment: null — заказ оформлен
// до появления способов оплаты (оплачен Kaspi QR).
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await requireOwnOrder(req.scope, req.params.id, req.auth_context.actor_id)
  await settleOrderKaspiPaymentWorkflow(req.scope).run({
    input: { order_id: req.params.id },
    throwOnError: true,
  })
  res.json({ payment: await loadBuyerOrderPayment(req.scope, req.params.id) })
}

// POST /store/orders/:id/payment — сменить способ оплаты своего заказа, пока
// продавец его не подтвердил и денег не было (см. change-order-payment-method).
export async function POST(
  req: AuthenticatedMedusaRequest<StoreChangeOrderPaymentMethodType>,
  res: MedusaResponse
) {
  await requireOwnOrder(req.scope, req.params.id, req.auth_context.actor_id)
  await changeOrderPaymentMethodWorkflow(req.scope).run({
    input: { order_id: req.params.id, method: req.validatedBody.method },
    throwOnError: true,
  })
  res.json({ payment: await loadBuyerOrderPayment(req.scope, req.params.id) })
}
