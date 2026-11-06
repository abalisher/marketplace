import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { resolveMode } from "../../../../../../modules/payment-kaspi/create-kaspi-client"
import { setMockInvoiceState } from "../../../../../../modules/payment-kaspi/kaspi-mock-client"
import { findPendingOrderKaspiSession } from "../../../../../../lib/payments/order-kaspi"
import { loadBuyerOrderPayment } from "../../../../../../lib/payments/order-payment-buyer-view"
import { settleOrderKaspiPaymentWorkflow } from "../../../../../../workflows/payments/settle-order-kaspi-payment"
import { requireOwnOrder } from "../../../helpers"

// POST /store/orders/:id/payment/mock-pay — DEV-ТОЛЬКО: отмечает тестовый счёт
// Kaspi заказа оплаченным (как mock-pay корзины). Вне KASPI_MODE=mock — 404.
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  if (resolveMode() !== "mock") {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Not found")
  }
  await requireOwnOrder(req.scope, req.params.id, req.auth_context.actor_id)
  const session = await findPendingOrderKaspiSession(req.scope, req.params.id)
  const invoiceId = session?.data.kaspi_invoice_id as string | undefined
  if (!invoiceId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Kaspi payment is not initialized for this order"
    )
  }
  setMockInvoiceState(invoiceId, "paid")
  await settleOrderKaspiPaymentWorkflow(req.scope).run({
    input: { order_id: req.params.id },
    throwOnError: true,
  })
  res.json({ payment: await loadBuyerOrderPayment(req.scope, req.params.id) })
}
