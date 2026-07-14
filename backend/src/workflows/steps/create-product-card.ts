import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CATALOG_MODULE } from "../../modules/catalog"
import CatalogModuleService from "../../modules/catalog/service"
import { ProductSegment } from "../../modules/catalog/models/product-card"

export type CreateProductCardStepInput = {
  segment: ProductSegment
  unit: string
  certificates?: { name: string; url: string }[]
}

// Создаёт кастомную часть карточки товара (сегмент, ед. изм., сертификаты).
// Компенсация — удаление созданной записи.
export const createProductCardStep = createStep(
  "create-product-card",
  async (input: CreateProductCardStepInput, { container }) => {
    const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
    const card = await service.createProductCards({
      segment: input.segment,
      unit: input.unit,
      // model.json() типизируется как Record<string, unknown>, хотя колонка
      // хранит массив сертификатов — приводим тип, структура описана в модели.
      certificates: input.certificates as unknown as Record<string, unknown>,
    })

    return new StepResponse(card, card.id)
  },
  async (cardId, { container }) => {
    if (!cardId) {
      return
    }
    const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
    await service.deleteProductCards(cardId)
  }
)
