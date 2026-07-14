import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { CATALOG_MODULE } from "../modules/catalog"
import { ProductSegment } from "../modules/catalog/models/product-card"
import { createProductCardStep } from "./steps/create-product-card"
import { validateProductHasNoCardStep } from "./steps/validate-product-has-no-card"

export type CreateProductCardWorkflowInput = {
  product_id: string
  segment: ProductSegment
  unit: string
  certificates?: { name: string; url: string }[]
}

// Кастомная часть карточки к существующему товару ядра (сам товар создаёт
// ядро). Карточка привязывается link'ом 1:1; статус модерации остаётся на
// product.status ядра (draft по умолчанию) — отправка на модерацию отдельным
// workflow (submit-product-for-moderation).
export const createProductCardWorkflow = createWorkflow(
  "create-product-card",
  (input: WorkflowData<CreateProductCardWorkflowInput>) => {
    validateProductHasNoCardStep({ product_id: input.product_id })

    const card = createProductCardStep({
      segment: input.segment,
      unit: input.unit,
      certificates: input.certificates,
    })

    const links = transform({ card, input }, (data) => [
      {
        [Modules.PRODUCT]: { product_id: data.input.product_id },
        [CATALOG_MODULE]: { product_card_id: data.card.id },
      },
    ])
    createRemoteLinkStep(links)

    return new WorkflowResponse(card)
  }
)
