import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ORDER_PAYMENT_MODULE } from "../../../../modules/order-payment"
import OrderPaymentModuleService from "../../../../modules/order-payment/service"
import { adminReceiptView, ReceiptRow } from "../../../../lib/payments/receipt-view"
import { listPaymentSellers } from "../../payment-settings/helpers"
import { reportSalesChannel } from "../scope"
import { AdminGetReceiptsParamsType } from "../validators"

// GET /admin/payment-report/receipts — чеки покупателей: ждущие решения
// (с нарушениями — первыми) или все. Клик по строке открывает заказ, решение
// принимается в его карточке.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { state, sales_channel_id } = req.validatedQuery as AdminGetReceiptsParamsType
  const channel = reportSalesChannel(req, sales_channel_id)
  const service = req.scope.resolve<OrderPaymentModuleService>(ORDER_PAYMENT_MODULE)
  const rows = (await service.listPaymentReceipts(
    {
      ...(channel ? { sales_channel_id: channel } : {}),
      ...(state === "waiting" ? { status: ["pending", "flagged"] } : {}),
    } as never,
    { relations: ["order_payment"], take: 200, order: { created_at: "DESC" } }
  )) as unknown as (ReceiptRow & {
    sales_channel_id: string | null
    order_payment: {
      order_id: string
      order_display_id: number | null
      order_number?: string | null
      customer_name: string | null
      customer_phone: string | null
      method: string
    }
  })[]
  const sellers = new Map(
    (await listPaymentSellers(req.scope)).map((s) => [s.sales_channel_id, s.name])
  )
  const flaggedFirst = (r: { status: string }) => (r.status === "flagged" ? 0 : 1)
  res.json({
    receipts: [...rows]
      .sort((a, b) => flaggedFirst(a) - flaggedFirst(b))
      .map((row) => ({
        ...adminReceiptView(row),
        order_id: row.order_payment.order_id,
        order_display_id: row.order_payment.order_display_id,
        order_number: row.order_payment.order_number ?? null,
        customer_name: row.order_payment.customer_name,
        customer_phone: row.order_payment.customer_phone,
        method: row.order_payment.method,
        seller_name: row.sales_channel_id ? sellers.get(row.sales_channel_id) ?? null : null,
      })),
    waiting: rows.filter((r) => r.status === "pending" || r.status === "flagged").length,
  })
}
