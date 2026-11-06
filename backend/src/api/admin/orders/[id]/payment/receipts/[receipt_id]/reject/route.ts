import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { reviewPaymentReceiptWorkflow } from "../../../../../../../../workflows/payments/review-payment-receipt"
import { paymentActor } from "../../../actor"
import { AdminRejectPaymentReceiptType } from "../../../validators"
import { loadOrderPaymentView } from "../../../view"
import { requireOrderReceipt } from "../../helpers"

// POST /admin/orders/:id/payment/receipts/:receipt_id/reject — продавец
// отклонил чек (денег нет, чек чужой…); причину видит покупатель.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminRejectPaymentReceiptType>,
  res: MedusaResponse
) {
  await requireOrderReceipt(req.scope, req.params.id, req.params.receipt_id)
  await reviewPaymentReceiptWorkflow(req.scope).run({
    input: {
      receipt_id: req.params.receipt_id,
      decision: "reject",
      note: req.validatedBody.note,
      ...paymentActor(req),
    },
    throwOnError: true,
  })
  res.json({ payment: await loadOrderPaymentView(req.scope, req.params.id) })
}
