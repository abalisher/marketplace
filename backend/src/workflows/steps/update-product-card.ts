import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CATALOG_MODULE } from "../../modules/catalog"
import CatalogModuleService from "../../modules/catalog/service"
import { ProductSegment } from "../../modules/catalog/models/product-card"

export type UpdateProductCardStepInput = {
  product_card_id: string
  segment?: ProductSegment
  unit?: string
  certificates?: { name: string; url: string }[]
}

// Обновляет кастомную часть карточки товара (сегмент, ед. изм., сертификаты).
// Компенсация — возврат прежних значений полей.
export const updateProductCardStep = createStep(
  "update-product-card",
  async (input: UpdateProductCardStepInput, { container }) => {
    const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
    const previous = await service.retrieveProductCard(input.product_card_id)

    const card = await service.updateProductCards({
      id: input.product_card_id,
      ...(input.segment !== undefined ? { segment: input.segment } : {}),
      ...(input.unit !== undefined ? { unit: input.unit } : {}),
      ...(input.certificates !== undefined
        ? {
            // model.json() типизируется как Record<string, unknown>, хотя
            // колонка хранит массив сертификатов — приводим тип, как в create.
            certificates:
              input.certificates as unknown as Record<string, unknown>,
          }
        : {}),
    })

    return new StepResponse(card, {
      id: previous.id,
      segment: previous.segment,
      unit: previous.unit,
      certificates: previous.certificates,
    })
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
    await service.updateProductCards(previous)
  }
)
