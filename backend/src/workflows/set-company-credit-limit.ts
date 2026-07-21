import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { CREDIT_LIMIT_CHANGED_EVENT } from "../modules/scoring/events"
import { setCompanyCreditLimitStep } from "./steps/set-company-credit-limit"

export type SetCompanyCreditLimitWorkflowInput = {
  company_id: string
  manual_limit: number | null
  note?: string | null
}

// Ручная корректировка лимита отсрочки компании продавцом/админом: правка
// карточки (с компенсацией) → событие scoring.limit_changed (аудит/уведомление).
export const setCompanyCreditLimitWorkflow = createWorkflow(
  "set-company-credit-limit",
  (input: WorkflowData<SetCompanyCreditLimitWorkflowInput>) => {
    const card = setCompanyCreditLimitStep(input)

    emitEventStep({
      eventName: CREDIT_LIMIT_CHANGED_EVENT,
      data: transform({ input, card }, (d) => ({
        company_id: d.input.company_id,
        manual_limit: d.input.manual_limit,
        score_card_id: d.card.id,
      })),
    })

    return new WorkflowResponse(card)
  }
)
