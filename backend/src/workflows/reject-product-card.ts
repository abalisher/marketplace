import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ProductStatus } from "@medusajs/framework/utils"
import { validateProductForModerationStep } from "./steps/validate-product-for-moderation"
import { updateProductStatusStep } from "./steps/update-product-status"
import { setCardRejectionReasonStep } from "./steps/set-card-rejection-reason"

export type RejectProductCardWorkflowInput = {
  product_id: string
  reason: string
}

// Модерация: отклонение карточки админом — proposed → rejected, комментарий
// обязателен (инвариант сервиса модуля catalog). Продавец видит причину и
// может исправить карточку и отправить снова (submit-product-for-moderation).
export const rejectProductCardWorkflow = createWorkflow(
  "reject-product-card",
  (input: WorkflowData<RejectProductCardWorkflowInput>) => {
    const card = validateProductForModerationStep({
      product_id: input.product_id,
    })

    const product = updateProductStatusStep({
      product_id: input.product_id,
      status: ProductStatus.REJECTED,
    })

    setCardRejectionReasonStep(
      transform({ card, input }, (data) => ({
        product_card_id: data.card.id,
        reason: data.input.reason,
      }))
    )

    return new WorkflowResponse(product)
  }
)
