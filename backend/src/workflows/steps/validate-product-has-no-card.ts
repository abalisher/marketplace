import { createStep } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

export type ValidateProductHasNoCardStepInput = {
  product_id: string
}

// Проверяет, что товар ядра существует и у него ещё нет карточки каталога
// (link product ↔ product_card — 1:1, у товара ровно одна карточка).
export const validateProductHasNoCardStep = createStep(
  "validate-product-has-no-card",
  async (input: ValidateProductHasNoCardStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "product_card.id"],
      filters: { id: input.product_id },
    })

    if (!products.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Product with id ${input.product_id} not found`
      )
    }

    if (products[0].product_card) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Product already has a product card"
      )
    }
  }
)
