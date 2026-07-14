import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CATALOG_MODULE } from "../../modules/catalog"
import CatalogModuleService from "../../modules/catalog/service"

export type SetCardRejectionReasonStepInput = {
  product_card_id: string
  reason: string
}

// Пишет комментарий отклонения в карточку (обязательность и trim — инвариант
// сервиса модуля). Компенсация — возврат прежнего комментария.
export const setCardRejectionReasonStep = createStep(
  "set-card-rejection-reason",
  async (input: SetCardRejectionReasonStepInput, { container }) => {
    const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
    const previous = await service.retrieveProductCard(input.product_card_id)

    const card = await service.setRejectionReason(
      input.product_card_id,
      input.reason
    )

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
