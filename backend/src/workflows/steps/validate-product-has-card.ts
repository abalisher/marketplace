import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

export type ValidateProductHasCardStepInput = {
  product_id: string
}

// Проверяет, что товар ядра существует и у него уже есть карточка каталога.
// Возвращает статус товара и карточку — они нужны дальше по workflow правки
// (id карточки для update, статус — для решения о повторной модерации).
export const validateProductHasCardStep = createStep(
  "validate-product-has-card",
  async (input: ValidateProductHasCardStepInput, { container }) => {
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

    return new StepResponse({
      product_id: product.id,
      status: product.status,
      card: product.product_card,
    })
  }
)
