import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BONUS_EXPIRING_SOON_EVENT } from "../modules/bonus/events"

type BonusExpiringSoonPayload = {
  account_id: string
  amount: number
  expires_at: string
}

// Уведомление покупателя о скором сгорании бонусов (ТЗ 4.16). Пока
// notification-провайдера (push/SMS/email) нет — заглушка логирует событие
// (идиома order-status-changed). Событийный контракт bonus.expiring_soon
// (account/amount/ближайший expires_at) останется прежним.
export default async function notifyBonusExpiringSoon({
  event: { data },
  container,
}: SubscriberArgs<BonusExpiringSoonPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info(
    `[bonus-notification stub] account ${data.account_id}: ${data.amount} ` +
      `bonus(es) expiring at ${data.expires_at} — notify buyer`
  )
}

export const config: SubscriberConfig = {
  event: BONUS_EXPIRING_SOON_EVENT,
}
