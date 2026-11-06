import { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { ORDER_PAYMENT_MODULE } from "../../../../../../modules/order-payment"
import OrderPaymentModuleService from "../../../../../../modules/order-payment/service"

// Чек принадлежит именно этому заказу (доступ к заказу проверил middleware
// продавца компании) — иначе 404, как на несуществующий.
export const requireOrderReceipt = async (
  container: MedusaContainer,
  orderId: string,
  receiptId: string
) => {
  const service = container.resolve<OrderPaymentModuleService>(ORDER_PAYMENT_MODULE)
  const [receipt] = await service.listPaymentReceipts(
    { id: receiptId },
    { relations: ["order_payment"], take: 1 }
  )
  const owner = (receipt as unknown as { order_payment?: { order_id?: string } } | undefined)
    ?.order_payment?.order_id
  if (!receipt || owner !== orderId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Чек не найден")
  }
}
