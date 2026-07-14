import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ProductStatus } from "@medusajs/framework/utils"

export type UpdateProductStatusStepInput = {
  product_id: string
  status: ProductStatus
}

// Переводит product.status ядра (draft/proposed/published/rejected) НАПРЯМУЮ
// через сервис модуля product, а не через ядровый updateProductsWorkflow:
// сервис не эмитит `product.updated`, поэтому переходы модерации не будят
// subscriber повторной модерации (иначе approve зациклился бы: published →
// событие → снова proposed). Компенсация — возврат прежнего статуса.
export const updateProductStatusStep = createStep(
  "update-product-status",
  async (input: UpdateProductStatusStepInput, { container }) => {
    const productService = container.resolve(Modules.PRODUCT)
    const previous = await productService.retrieveProduct(input.product_id)

    const product = await productService.updateProducts(input.product_id, {
      status: input.status,
    })

    return new StepResponse(product, {
      product_id: previous.id,
      status: previous.status,
    })
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const productService = container.resolve(Modules.PRODUCT)
    await productService.updateProducts(previous.product_id, {
      status: previous.status,
    })
  }
)
