import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { SCORE_RECOMPUTED_EVENT } from "../modules/scoring/events"
import { gatherCompanyScoringInputsStep } from "./steps/gather-company-scoring-inputs"
import { upsertScoreCardStep } from "./steps/upsert-score-card"

export type RecomputeCompanyScoringWorkflowInput = {
  company_id: string
}

// Пересчёт рейтинга компании: сбор факторов из истории заказов → пересчёт и
// сохранение карточки → событие scoring.recomputed. Вызывается джобой (крон) и
// подписчиком на закрытие заказа (см. subscribers/recompute-scoring-on-order-closed).
export const recomputeCompanyScoringWorkflow = createWorkflow(
  "recompute-company-scoring",
  (input: WorkflowData<RecomputeCompanyScoringWorkflowInput>) => {
    const { inputs } = gatherCompanyScoringInputsStep({
      company_id: input.company_id,
    })

    const card = upsertScoreCardStep(
      transform({ input, inputs }, (d) => ({
        company_id: d.input.company_id,
        inputs: d.inputs,
      }))
    )

    emitEventStep({
      eventName: SCORE_RECOMPUTED_EVENT,
      data: transform({ input, card }, (d) => ({
        company_id: d.input.company_id,
        score_card_id: d.card.id,
        score: d.card.score,
      })),
    })

    return new WorkflowResponse(card)
  }
)
