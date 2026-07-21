import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SCORE_RECOMPUTED_EVENT } from "../modules/scoring/events"

type ScoreRecomputedPayload = {
  company_id: string
  score_card_id: string
  score: number
}

// Уведомление продавца об изменении рейтинга компании (ТЗ 4.7 — карточка перед
// одобрением отсрочки). Пока notification-провайдера нет — заглушка логирует
// событие (идиома order-lifecycle/bonus). Контракт scoring.recomputed неизменен.
export default async function notifyScoreRecomputed({
  event: { data },
  container,
}: SubscriberArgs<ScoreRecomputedPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info(
    `[scoring stub] company ${data.company_id}: score recomputed to ${data.score} ` +
      `(card ${data.score_card_id})`
  )
}

export const config: SubscriberConfig = {
  event: SCORE_RECOMPUTED_EVENT,
}
