import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { REVIEWS_MODULE } from "../../modules/reviews"
import ReviewsModuleService from "../../modules/reviews/service"
import {
  DisputeCategory,
  DisputeSource,
} from "../../modules/reviews/models/constants"

export type OpenDisputeStepInput = {
  order_id: string
  customer_id: string
  category: DisputeCategory
  description: string
  // Кто заявил проблему: покупатель (чат) или оператор с его слов (звонок).
  // Не передан — покупатель (store-роут и ассистент).
  source?: DisputeSource
}

// Открытие диспута через сервис (блок второго активного диспута — внутри
// сервиса). Компенсация удаляет созданную строку при откате workflow.
export const openDisputeStep = createStep(
  "open-dispute",
  async (input: OpenDisputeStepInput, { container }) => {
    const reviewsService =
      container.resolve<ReviewsModuleService>(REVIEWS_MODULE)
    const dispute = await reviewsService.openDispute(input)
    return new StepResponse(dispute, dispute.id)
  },
  async (disputeId, { container }) => {
    if (!disputeId) {
      return
    }
    const reviewsService =
      container.resolve<ReviewsModuleService>(REVIEWS_MODULE)
    await reviewsService.deleteDisputes(disputeId)
  }
)
