import { MedusaError } from "@medusajs/framework/utils"
import { ORDER_PAYMENT_MODULE } from "../../../modules/order-payment"
import OrderPaymentModuleService from "../../../modules/order-payment/service"
import type {
  OrderPaymentStatus,
  PaymentMethod,
} from "../../../modules/order-payment/models/values"
import { numericAmount } from "../../../lib/payments/amount"
import { OrderPaymentFacts } from "../../../lib/payments/order-payment-state"

// Строка оплаты заказа в той форме, в какой её читают шаги.
export type OrderPaymentRow = {
  id: string
  order_id: string
  sales_channel_id: string | null
  method: PaymentMethod
  status: OrderPaymentStatus
  amount: unknown
  paid_amount: unknown
  refunded_amount: unknown
  due_date: Date | string | null
  approved_at: Date | string | null
  approved_by: string | null
  canceled_at: Date | string | null
}

export const factsOf = (row: OrderPaymentRow): OrderPaymentFacts => ({
  method: row.method,
  amount: numericAmount(row.amount) ?? 0,
  paid_amount: numericAmount(row.paid_amount) ?? 0,
  refunded_amount: numericAmount(row.refunded_amount) ?? 0,
  approved: !!row.approved_at,
  canceled: !!row.canceled_at,
})

export const resolveOrderPaymentService = (container: {
  resolve<T>(key: string): T
}) => container.resolve<OrderPaymentModuleService>(ORDER_PAYMENT_MODULE)

export const requireOrderPayment = async (
  service: OrderPaymentModuleService,
  orderId: string
): Promise<OrderPaymentRow> => {
  const [row] = await service.listOrderPayments({ order_id: orderId }, { take: 1 })
  if (!row) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "У заказа нет записи об оплате (заказ оформлен до появления способов оплаты)"
    )
  }
  return row as unknown as OrderPaymentRow
}
