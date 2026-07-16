import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BONUS_ACCRUED_EVENT } from "../modules/bonus/events"

type BonusAccruedPayload = {
  order_id: string
  account_id: string
  transaction_id: string
  amount: number
}

// Уведомление покупателя о начисленных бонусах (ТЗ 4.16). Пока
// notification-провайдера (push/SMS/email) нет — заглушка логирует событие
// (идиома order-status-changed). Событийный контракт bonus.accrued
// (order/account/transaction/amount) останется прежним.
export default async function notifyBonusAccrued({
  event: { data },
  container,
}: SubscriberArgs<BonusAccruedPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info(
    `[bonus-notification stub] order ${data.order_id}: accrued ${data.amount} ` +
      `to account ${data.account_id} (tx ${data.transaction_id}) — notify buyer`
  )
}

export const config: SubscriberConfig = {
  event: BONUS_ACCRUED_EVENT,
}
