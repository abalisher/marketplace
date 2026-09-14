import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import Review from "./models/review"
import Dispute from "./models/dispute"
import {
  assertDisputeTransition,
  disputeOutcomeForTransition,
  DisputeCategory,
  DisputeOutcome,
  DisputeSource,
  DisputeStatus,
  MAX_RATING,
  MIN_RATING,
  REVIEW_STATUSES,
  ReviewStatus,
  ReviewTarget,
} from "./models/constants"

// Сервис домена отзывов и диспутов. CRUD генерируется MedusaService; здесь —
// инварианты: границы оценки, «один отзыв на (заказ, покупатель, объект)»,
// стейт-машина диспута. Право оставить отзыв/открыть диспут (заказ принадлежит
// покупателю и доставлен/закрыт) проверяет слой API/workflow — см.
// docs/modules/reviews.md.
class ReviewsModuleService extends MedusaService({
  Review,
  Dispute,
}) {
  // Создать отзыв. Оценка — целое 1..5; повторный отзыв на тот же объект того же
  // заказа тем же покупателем запрещён (правит существующий вызывающий отдельно).
  async createReview(input: {
    order_id: string
    customer_id: string
    target: ReviewTarget
    rating: number
    comment?: string | null
  }) {
    if (
      !Number.isInteger(input.rating) ||
      input.rating < MIN_RATING ||
      input.rating > MAX_RATING
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Rating must be an integer between ${MIN_RATING} and ${MAX_RATING}`
      )
    }

    const [existing] = await this.listReviews(
      {
        order_id: input.order_id,
        customer_id: input.customer_id,
        target: input.target,
      },
      { take: 1 }
    )
    if (existing) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `A ${input.target} review for order ${input.order_id} already exists`
      )
    }

    return await this.createReviews({
      order_id: input.order_id,
      customer_id: input.customer_id,
      target: input.target,
      rating: input.rating,
      comment: input.comment ?? null,
    })
  }

  // Модерация видимости отзыва (скрыть/опубликовать).
  async setReviewStatus(input: { id: string; status: ReviewStatus }) {
    if (!(REVIEW_STATUSES as readonly string[]).includes(input.status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown review status: ${input.status}`
      )
    }
    return await this.updateReviews({ id: input.id, status: input.status })
  }

  // Сводка рейтинга по объекту: среднее и количество ТОЛЬКО опубликованных
  // отзывов. Для маркетплейса с одним продавцом — глобальная сводка по target.
  async getRatingSummary(target: ReviewTarget) {
    const reviews = await this.listReviews({ target, status: "published" })
    const count = reviews.length
    const average =
      count === 0
        ? 0
        : reviews.reduce((sum, r) => sum + Number(r.rating), 0) / count
    // Округление до одного знака (устойчиво к плавающей арифметике).
    return { target, count, average: Math.round(average * 10) / 10 }
  }

  // Открыть диспут по заказу. Повторный ОТКРЫТЫЙ диспут по тому же заказу
  // запрещён (незакрытая проблема уже ведётся); закрытые не мешают открыть новый.
  async openDispute(input: {
    order_id: string
    customer_id: string
    category: DisputeCategory
    description: string
    source?: DisputeSource
  }) {
    const [active] = await this.listDisputes(
      { order_id: input.order_id, status: ["open", "in_review"] },
      { take: 1 }
    )
    if (active) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `An active dispute for order ${input.order_id} already exists`
      )
    }

    return await this.createDisputes({
      order_id: input.order_id,
      customer_id: input.customer_id,
      category: input.category,
      description: input.description,
      status: "open",
      source: input.source ?? "buyer",
    })
  }

  // Перевод диспута по стейт-машине (оператор платформы). При переходе в
  // resolved/rejected сохраняется текст решения, если передан, и последствие
  // решения: удовлетворение требует названного последствия (возврат/довоз/
  // замена/бонусы/без компенсации), отказ — всегда «без компенсации».
  async recordDisputeTransition(input: {
    id: string
    to: DisputeStatus
    resolution?: string | null
    outcome?: DisputeOutcome | null
  }) {
    const dispute = await this.retrieveDispute(input.id)
    assertDisputeTransition(dispute.status as DisputeStatus, input.to)
    return await this.updateDisputes({
      id: input.id,
      status: input.to,
      resolution: input.resolution ?? dispute.resolution ?? null,
      outcome: disputeOutcomeForTransition(input.to, input.outcome),
    })
  }
}

export default ReviewsModuleService
