import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CREDIT_LIMIT_CHANGED_EVENT } from "../modules/scoring/events"

type CreditLimitChangedPayload = {
  company_id: string
  manual_limit: number | null
  score_card_id: string
}

// Уведомление/аудит изменения лимита отсрочки компании (ТЗ 5.3 — изменения
// лимитов логируются). Пока notification-провайдера нет — заглушка логирует
// событие (идиома order-lifecycle/bonus). Контракт scoring.limit_changed неизменен.
export default async function notifyCreditLimitChanged({
  event: { data },
  container,
}: SubscriberArgs<CreditLimitChangedPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info(
    `[scoring-audit stub] company ${data.company_id}: manual credit limit set to ` +
      `${data.manual_limit ?? "cleared"} (card ${data.score_card_id})`
  )
}

export const config: SubscriberConfig = {
  event: CREDIT_LIMIT_CHANGED_EVENT,
}
