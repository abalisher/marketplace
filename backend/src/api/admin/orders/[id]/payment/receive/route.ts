import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { recordOrderPaymentWorkflow } from "../../../../../../workflows/payments/record-order-payment"
import { paymentActor } from "../actor"
import { AdminRecordOrderPaymentType } from "../validators"
import { loadOrderPaymentView } from "../view"

// POST /admin/orders/:id/payment/receive — продавец отметил поступление денег:
// перевод получен или долг погашен (полностью или частью).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminRecordOrderPaymentType>,
  res: MedusaResponse
) {
  const body = req.validatedBody
  await recordOrderPaymentWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      kind: "payment",
      amount: body.amount,
      channel: body.channel,
      note: body.note ?? null,
      occurred_at: body.occurred_at ?? null,
      ...paymentActor(req),
    },
    throwOnError: true,
  })
  res.json({ payment: await loadOrderPaymentView(req.scope, req.params.id) })
}
