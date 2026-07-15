import { transform } from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { ORDER_STATUS_CHANGED_EVENT } from "../modules/order-lifecycle/events"
import {
  recordStatusTransitionStep,
  RecordStatusTransitionStepInput,
} from "./steps/record-status-transition"

// Применяет переход статуса внутри workflow: пишет переход через общий шаг и
// эмитит order_lifecycle.status_changed. НЕ workflow сам по себе — вызывается
// в теле createWorkflow (обычная композиция шагов), поэтому переиспользуется
// всеми сценарными переходами без дублирования emit. Событие emitEventStep
// доставляется подписчикам только после успешного завершения workflow.
export const applyOrderTransition = (
  input: RecordStatusTransitionStepInput
) => {
  const result = recordStatusTransitionStep(input)

  emitEventStep({
    eventName: ORDER_STATUS_CHANGED_EVENT,
    data: transform({ input, result }, (data) => ({
      order_id: data.input.order_id,
      order_lifecycle_id: data.result.order_lifecycle_id,
      from: data.result.from,
      to: data.result.to,
      actor_type: data.input.actor_type,
    })),
  })

  return result
}
