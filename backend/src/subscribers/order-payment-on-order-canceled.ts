import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, OrderWorkflowEvents } from "@medusajs/framework/utils"
import { cancelOrderPaymentWorkflow } from "../workflows/payments/cancel-order-payment"

type OrderCanceledPayload = {
  id: string
}

// Заказ отменён (из панели или мимо неё) — его оплата тоже: долг снят,
// полученные деньги — к возврату покупателю (см. cancel-order-payment).
export default async function orderPaymentOnOrderCanceled({
  event: { data },
  container,
}: SubscriberArgs<OrderCanceledPayload>) {
  try {
    await cancelOrderPaymentWorkflow(container).run({
      input: { order_id: data.id },
    })
  } catch (e) {
    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .error(`[payments] cancel payment of order ${data.id} failed: ${(e as Error).message}`)
  }
}

export const config: SubscriberConfig = {
  event: OrderWorkflowEvents.CANCELED,
}
