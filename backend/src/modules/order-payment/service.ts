import { MedusaService } from "@medusajs/framework/utils"
import OrderPayment from "./models/order-payment"
import PaymentEntry from "./models/payment-entry"
import PaymentReceipt from "./models/payment-receipt"
import PaymentSettings from "./models/payment-settings"

// Оплаты заказов: способы оплаты продавцов, оплата каждого заказа и журнал
// движений денег. Правила (какой способ доступен, как считается состояние) —
// чистые функции в lib/payments, сценарии — в workflows/payments.
class OrderPaymentModuleService extends MedusaService({
  PaymentSettings,
  OrderPayment,
  PaymentEntry,
  PaymentReceipt,
}) {
  async getSettingsByChannel(salesChannelId: string) {
    const [settings] = await this.listPaymentSettings(
      { sales_channel_id: salesChannelId },
      { take: 1 }
    )
    return settings ?? null
  }

  async getByOrder(orderId: string) {
    const [payment] = await this.listOrderPayments(
      { order_id: orderId },
      { take: 1, relations: ["entries"] }
    )
    return payment ?? null
  }
}

export default OrderPaymentModuleService
