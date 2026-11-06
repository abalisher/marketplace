import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { loadOrderPaymentView } from "./view"

// GET /admin/orders/:id/payment — оплата заказа: способ, суммы, срок долга и
// журнал движений денег. payment: null — заказ оформлен до появления способов
// оплаты.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.json({ payment: await loadOrderPaymentView(req.scope, req.params.id) })
}
