import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ProductStatus } from "@medusajs/framework/utils"
import { validateProductForSubmissionStep } from "./steps/validate-product-for-submission"
import { updateProductStatusStep } from "./steps/update-product-status"
import { clearCardRejectionReasonStep } from "./steps/clear-card-rejection-reason"

export type SubmitProductForModerationWorkflowInput = {
  product_id: string
}

// Отправка карточки на модерацию продавцом: draft|rejected → proposed.
// Сертификаты обязательны (валидация в шаге), комментарий прошлого
// отклонения сбрасывается.
export const submitProductForModerationWorkflow = createWorkflow(
  "submit-product-for-moderation",
  (input: WorkflowData<SubmitProductForModerationWorkflowInput>) => {
    const card = validateProductForSubmissionStep({
      product_id: input.product_id,
    })

    const product = updateProductStatusStep({
      product_id: input.product_id,
      status: ProductStatus.PROPOSED,
    })

    clearCardRejectionReasonStep(
      transform({ card }, (data) => ({ product_card_id: data.card.id }))
    )

    return new WorkflowResponse(product)
  }
)
