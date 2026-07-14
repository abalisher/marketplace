import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ProductStatus } from "@medusajs/framework/utils"
import { validateProductForModerationStep } from "./steps/validate-product-for-moderation"
import { updateProductStatusStep } from "./steps/update-product-status"
import { clearCardRejectionReasonStep } from "./steps/clear-card-rejection-reason"

export type ApproveProductCardWorkflowInput = {
  product_id: string
}

// Модерация: одобрение карточки админом — proposed → published (карточка
// становится видна покупателям через store API), комментарий отклонения
// сбрасывается.
export const approveProductCardWorkflow = createWorkflow(
  "approve-product-card",
  (input: WorkflowData<ApproveProductCardWorkflowInput>) => {
    const card = validateProductForModerationStep({
      product_id: input.product_id,
    })

    const product = updateProductStatusStep({
      product_id: input.product_id,
      status: ProductStatus.PUBLISHED,
    })

    clearCardRejectionReasonStep(
      transform({ card }, (data) => ({ product_card_id: data.card.id }))
    )

    return new WorkflowResponse(product)
  }
)
