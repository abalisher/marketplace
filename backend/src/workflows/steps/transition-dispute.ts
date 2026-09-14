import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { REVIEWS_MODULE } from "../../modules/reviews"
import ReviewsModuleService from "../../modules/reviews/service"
import {
  DisputeOutcome,
  DisputeStatus,
} from "../../modules/reviews/models/constants"

export type TransitionDisputeStepInput = {
  id: string
  to: DisputeStatus
  resolution?: string | null
  // Последствие решения (возврат/довоз/замена/бонусы/без компенсации).
  // Обязательно при resolved — проверяет сервис.
  outcome?: DisputeOutcome | null
}

// Перевод диспута по стейт-машине через сервис (проверка перехода и требование
// последствия при удовлетворении — внутри). Компенсация — возврат прежних
// статуса, резолюции и последствия.
export const transitionDisputeStep = createStep(
  "transition-dispute",
  async (input: TransitionDisputeStepInput, { container }) => {
    const reviewsService =
      container.resolve<ReviewsModuleService>(REVIEWS_MODULE)
    const previous = await reviewsService.retrieveDispute(input.id)
    const updated = await reviewsService.recordDisputeTransition(input)
    return new StepResponse(
      { dispute: updated, from: previous.status as DisputeStatus },
      {
        id: input.id,
        status: previous.status as DisputeStatus,
        resolution: previous.resolution ?? null,
        outcome: (previous.outcome as DisputeOutcome | null) ?? null,
      }
    )
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const reviewsService =
      container.resolve<ReviewsModuleService>(REVIEWS_MODULE)
    await reviewsService.updateDisputes({
      id: previous.id,
      status: previous.status,
      resolution: previous.resolution,
      outcome: previous.outcome,
    })
  }
)
