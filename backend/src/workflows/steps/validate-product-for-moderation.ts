import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

export type ValidateProductForModerationStepInput = {
  product_id: string
}

// Проверяет, что товар находится на модерации (status = proposed) и у него
// есть карточка каталога. Общий шаг approve/reject; возвращает карточку —
// её id нужен дальше по workflow (комментарий отклонения).
export const validateProductForModerationStep = createStep(
  "validate-product-for-moderation",
  async (input: ValidateProductForModerationStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "status", "product_card.*"],
      filters: { id: input.product_id },
    })

    if (!products.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Product with id ${input.product_id} not found`
      )
    }

    const product = products[0]

    if (!product.product_card) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Product has no product card"
      )
    }

    if (product.status !== "proposed") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Only products pending moderation can be approved or rejected (status: ${product.status})`
      )
    }

    return new StepResponse(product.product_card)
  }
)
