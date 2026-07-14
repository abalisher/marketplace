import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CATALOG_MODULE } from "../../modules/catalog"
import CatalogModuleService from "../../modules/catalog/service"

export type ClearCardRejectionReasonStepInput = {
  product_card_id: string
}

// Сбрасывает комментарий отклонения (approve и повторная отправка на
// модерацию). Компенсация — возврат прежнего комментария.
export const clearCardRejectionReasonStep = createStep(
  "clear-card-rejection-reason",
  async (input: ClearCardRejectionReasonStepInput, { container }) => {
    const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
    const previous = await service.retrieveProductCard(input.product_card_id)

    const card = await service.clearRejectionReason(input.product_card_id)

    return new StepResponse(card, {
      id: previous.id,
      rejection_reason: previous.rejection_reason,
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
