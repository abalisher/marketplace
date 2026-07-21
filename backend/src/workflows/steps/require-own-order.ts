import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

export type RequireOwnOrderStepInput = {
  order_id: string
  customer_id: string
}

// Гейт принадлежности заказа покупателю (для открытия диспута — проблему можно
// заявить на любой свой заказ, в т.ч. до доставки, напр. «не доставлен»). Чужой/
// несуществующий заказ → 404. Отдельный шаг от validate-review-eligibility:
// у диспута нет требования «доставлен».
export const requireOwnOrderStep = createStep(
  "require-own-order",
  async (input: RequireOwnOrderStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "customer_id"],
      filters: { id: input.order_id, customer_id: input.customer_id },
    })
    if (!orders?.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Order ${input.order_id} not found`
      )
    }
    return new StepResponse({ ok: true })
  }
)
