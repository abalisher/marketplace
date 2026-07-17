import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BONUS_SPENT_EVENT } from "../modules/bonus/events"

type BonusSpentPayload = {
  order_id: string
  account_id: string
  transaction_id: string
  amount: number
}

// Уведомление покупателя о списании бонусов при оформлении заказа (ТЗ 4.16).
// Пока notification-провайдера (push/SMS/email) нет — заглушка логирует событие
// (идиома bonus-accrued). Событийный контракт bonus.spent
// (order/account/transaction/amount) останется прежним.
export default async function notifyBonusSpent({
  event: { data },
  container,
}: SubscriberArgs<BonusSpentPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info(
    `[bonus-notification stub] order ${data.order_id}: spent ${data.amount} ` +
      `from account ${data.account_id} (tx ${data.transaction_id}) — notify buyer`
  )
}

export const config: SubscriberConfig = {
  event: BONUS_SPENT_EVENT,
}
