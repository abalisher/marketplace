import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { loadDebts } from "../load"
import { reportSalesChannel } from "../scope"
import { AdminGetDebtsParamsType } from "../validators"

// GET /admin/payment-report/debts — заказы «в долг»: кто, сколько должен, срок,
// просрочка; итоги — весь долг продавца, просроченный и ждущие решения.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { sales_channel_id, ...filter } = req.validatedQuery as AdminGetDebtsParamsType
  const { rows, totals } = await loadDebts(req.scope, {
    ...filter,
    sales_channel_id: reportSalesChannel(req, sales_channel_id),
  })
  res.json({ debts: rows, totals })
}
