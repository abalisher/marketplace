import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

export type ValidateProductForSubmissionStepInput = {
  product_id: string
}

// Проверяет, что товар можно отправить на модерацию: карточка каталога есть,
// статус draft|rejected, сертификаты непусты (требование ТЗ; сегмент обязателен
// на уровне модели, отдельно не проверяем). Возвращает карточку — её id нужен
// дальше по workflow (сброс комментария отклонения).
export const validateProductForSubmissionStep = createStep(
  "validate-product-for-submission",
  async (input: ValidateProductForSubmissionStepInput, { container }) => {
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

    if (product.status !== "draft" && product.status !== "rejected") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Only draft or rejected products can be submitted for moderation (status: ${product.status})`
      )
    }

    const certificates = product.product_card.certificates
    if (!Array.isArray(certificates) || !certificates.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Certificates are required to submit a product for moderation"
      )
    }

    return new StepResponse(product.product_card)
  }
)
