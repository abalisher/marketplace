import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BONUS_EXPIRED_EVENT } from "../modules/bonus/events"

type BonusExpiredPayload = {
  account_id: string
  amount: number
  transaction_id: string
}

// Уведомление покупателя о сгоревших бонусах (ТЗ 4.16). Пока
// notification-провайдера (push/SMS/email) нет — заглушка логирует событие
// (идиома order-status-changed). Событийный контракт bonus.expired
// (account/amount/expiry-транзакция) останется прежним.
export default async function notifyBonusExpired({
  event: { data },
  container,
}: SubscriberArgs<BonusExpiredPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info(
    `[bonus-notification stub] account ${data.account_id}: ${data.amount} ` +
      `bonus(es) expired (tx ${data.transaction_id}) — notify buyer`
  )
}

export const config: SubscriberConfig = {
  event: BONUS_EXPIRED_EVENT,
}
