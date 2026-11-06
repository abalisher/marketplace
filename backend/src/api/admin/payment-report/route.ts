import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { loadPaymentEntries } from "./load"
import { reportSalesChannel } from "./scope"
import { AdminGetPaymentEntriesParamsType } from "./validators"

// GET /admin/payment-report — журнал оплат: каждое поступление и возврат денег
// с заказом, покупателем и тем, кто отметил; итоги за период по каналам денег.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { limit, offset, sales_channel_id, ...filter } =
    req.validatedQuery as AdminGetPaymentEntriesParamsType
  const { rows, totals } = await loadPaymentEntries(req.scope, {
    ...filter,
    sales_channel_id: reportSalesChannel(req, sales_channel_id),
  })
  res.json({
    entries: rows.slice(offset, offset + limit),
    count: rows.length,
    limit,
    offset,
    totals,
  })
}
