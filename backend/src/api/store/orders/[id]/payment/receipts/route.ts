import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { stripDataUrlPrefix } from "../../../../../../lib/base64"
import { loadBuyerOrderPayment } from "../../../../../../lib/payments/order-payment-buyer-view"
import { submitPaymentReceiptWorkflow } from "../../../../../../workflows/payments/submit-payment-receipt"
import { requireOwnOrder } from "../../../helpers"
import { StoreSubmitPaymentReceiptType } from "../../../validators"

// POST /store/orders/:id/payment/receipts — покупатель присылает чек Kaspi по
// переводу или погашению долга: чек распознаётся и проверяется сразу, в ответе
// — оплата заказа с этим чеком (принят на проверку или почему не примут).
export async function POST(
  req: AuthenticatedMedusaRequest<StoreSubmitPaymentReceiptType>,
  res: MedusaResponse
) {
  await requireOwnOrder(req.scope, req.params.id, req.auth_context.actor_id)
  const { file } = req.validatedBody
  const { result } = await submitPaymentReceiptWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      file: {
        name: file.name ?? null,
        mime_type: file.mime_type,
        data: stripDataUrlPrefix(file.data),
      },
    },
    throwOnError: true,
  })
  res.json({
    receipt_id: result.receipt_id,
    payment: await loadBuyerOrderPayment(req.scope, req.params.id),
  })
}
