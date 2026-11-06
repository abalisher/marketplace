import type { RemoteQueryFunction } from "@medusajs/framework/types"
import type {
  OrderPaymentStatus,
  PaymentMethod,
} from "../../modules/order-payment/models/values"
import { isDebtOverdue } from "./order-payment-state"

type Query = Omit<RemoteQueryFunction, symbol>

// Оплата заказа в очереди, карточке и дашборде панели: способ и состояние.
// Для заказов с записью оплаты (оформлены со способами оплаты) состояние — из
// неё; у прежних заказов — по платёжной коллекции ядра, как раньше.
export type PanelPaymentState =
  | "paid"
  | "awaiting"
  | "canceled"
  | "debt_requested"
  | "debt"
  | "debt_overdue"
  | "refund_due"
  | "refunded"
  // Покупатель прислал чек — ждёт решения продавца.
  | "receipt_review"

export type PanelOrderPayment = {
  method: PaymentMethod
  state: PanelPaymentState
}

export const panelPaymentState = (
  status: OrderPaymentStatus,
  dueDate: Date | string | null,
  now: Date = new Date(),
  receiptPending = false
): PanelPaymentState => {
  if (receiptPending && ["awaiting", "debt_requested", "debt"].includes(status)) {
    return "receipt_review"
  }
  return status === "debt" && isDebtOverdue(status, dueDate, now) ? "debt_overdue" : status
}

export const loadOrderPaymentStates = async (
  query: Query,
  orderIds: string[],
  now: Date = new Date()
): Promise<Map<string, PanelOrderPayment>> => {
  if (!orderIds.length) {
    return new Map()
  }
  const { data } = await query.graph({
    entity: "order_payment",
    fields: ["order_id", "method", "status", "due_date", "receipt_pending"],
    filters: { order_id: orderIds },
  })
  return new Map(
    (
      data as {
        order_id: string
        method: PaymentMethod
        status: OrderPaymentStatus
        due_date: string | Date | null
        receipt_pending?: boolean
      }[]
    ).map((row) => [
      row.order_id,
      {
        method: row.method,
        state: panelPaymentState(row.status, row.due_date, now, !!row.receipt_pending),
      },
    ])
  )
}
