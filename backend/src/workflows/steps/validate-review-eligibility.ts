import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { ReviewTarget } from "../../modules/reviews/models/constants"

export type ValidateReviewEligibilityStepInput = {
  order_id: string
  customer_id: string
  target: ReviewTarget
}

// Гейт права оставить отзыв: заказ принадлежит покупателю и уже доставлен/закрыт;
// доставку (target=delivery) оценивает только заказ со способом delivery
// (у самовывоза/counter доставки не было — оценивать нечего). Проверка вне модуля
// reviews — через query.graph по заказу и его жизненному циклу (модуль reviews
// заказ не знает). Чужой/несуществующий заказ → 404 (не раскрываем чужие заказы).
export const validateReviewEligibilityStep = createStep(
  "validate-review-eligibility",
  async (input: ValidateReviewEligibilityStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "customer_id",
        "order_lifecycle.status",
        "order_lifecycle.delivery_method",
      ],
      filters: { id: input.order_id, customer_id: input.customer_id },
    })

    const order = orders?.[0] as
      | {
          order_lifecycle?: { status?: string; delivery_method?: string }
        }
      | undefined
    if (!order) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Order ${input.order_id} not found`
      )
    }

    const status = order.order_lifecycle?.status
    if (status !== "delivered" && status !== "closed") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Order can be reviewed only after it is delivered"
      )
    }

    if (
      input.target === "delivery" &&
      order.order_lifecycle?.delivery_method !== "delivery"
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Delivery can be reviewed only for delivered (not pickup/counter) orders"
      )
    }

    return new StepResponse({ eligible: true })
  }
)
