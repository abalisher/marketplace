import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ProductStatus } from "@medusajs/framework/utils"
import { ProductSegment } from "../modules/catalog/models/product-card"
import { validateProductHasCardStep } from "./steps/validate-product-has-card"
import { updateProductCardStep } from "./steps/update-product-card"
import { updateProductStatusStep } from "./steps/update-product-status"

export type UpdateProductCardWorkflowInput = {
  product_id: string
  segment?: ProductSegment
  unit?: string
  certificates?: { name: string; url: string }[]
}

// Правка кастомной части карточки (сегмент, ед. изм., сертификаты).
// По ТЗ изменение ключевых характеристик ОДОБРЕННОЙ карточки возвращает её на
// модерацию: для published-товара статус переводится в proposed. Правка
// карточки ядровое событие product.updated не эмитит (меняется наша модель,
// не product), поэтому subscriber повторной модерации здесь не участвует —
// переход статуса делаем явно внутри workflow.
export const updateProductCardWorkflow = createWorkflow(
  "update-product-card",
  (input: WorkflowData<UpdateProductCardWorkflowInput>) => {
    const product = validateProductHasCardStep({
      product_id: input.product_id,
    })

    const card = updateProductCardStep(
      transform({ product, input }, (data) => ({
        product_card_id: data.product.card.id,
        segment: data.input.segment,
        unit: data.input.unit,
        certificates: data.input.certificates,
      }))
    )

    when(product, (data) => data.status === ProductStatus.PUBLISHED).then(() =>
      updateProductStatusStep({
        product_id: input.product_id,
        status: ProductStatus.PROPOSED,
      })
    )

    return new WorkflowResponse(card)
  }
)
