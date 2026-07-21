import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { REVIEW_CREATED_EVENT } from "../modules/reviews/events"

type ReviewCreatedPayload = {
  review_id: string
  order_id: string
  target: string
  rating: number
}

// Уведомление продавца о новом отзыве покупателя (ТЗ). Пока notification-
// провайдера нет — заглушка логирует событие (идиома order-status-changed/
// bonus-accrued). Событийный контракт review.created останется прежним.
export default async function notifyReviewCreated({
  event: { data },
  container,
}: SubscriberArgs<ReviewCreatedPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info(
    `[review-notification stub] order ${data.order_id}: ${data.target} review ` +
      `${data.rating}★ (${data.review_id}) — notify seller`
  )
}

export const config: SubscriberConfig = {
  event: REVIEW_CREATED_EVENT,
}
