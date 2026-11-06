import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { reviewPaymentReceiptWorkflow } from "../../../../../../../../workflows/payments/review-payment-receipt"
import { paymentActor } from "../../../actor"
import { AdminAcceptPaymentReceiptType } from "../../../validators"
import { loadOrderPaymentView } from "../../../view"
import { requireOrderReceipt } from "../../helpers"

// POST /admin/orders/:id/payment/receipts/:receipt_id/accept — продавец
// засчитал чек покупателя: поступление в журнал (сумма из чека или
// поправленная).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminAcceptPaymentReceiptType>,
  res: MedusaResponse
) {
  await requireOrderReceipt(req.scope, req.params.id, req.params.receipt_id)
  await reviewPaymentReceiptWorkflow(req.scope).run({
    input: {
      receipt_id: req.params.receipt_id,
      decision: "accept",
      amount: req.validatedBody.amount ?? null,
      note: req.validatedBody.note ?? null,
      ...paymentActor(req),
    },
    throwOnError: true,
  })
  res.json({ payment: await loadOrderPaymentView(req.scope, req.params.id) })
}
