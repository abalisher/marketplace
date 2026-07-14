import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ProductStatus } from "@medusajs/framework/utils"
import { updateProductStatusStep } from "./steps/update-product-status"

export type RemoderateProductWorkflowInput = {
  product_id: string
}

// Повторная модерация: изменение ключевых характеристик одобренной карточки
// возвращает её на модерацию (published → proposed). Вызывается subscriber'ом
// на product.updated (он же фильтрует события: только published-товары с
// карточкой каталога) — см. src/subscribers/product-updated.ts.
export const remoderateProductWorkflow = createWorkflow(
  "remoderate-product",
  (input: WorkflowData<RemoderateProductWorkflowInput>) => {
    const product = updateProductStatusStep({
      product_id: input.product_id,
      status: ProductStatus.PROPOSED,
    })

    return new WorkflowResponse(product)
  }
)
