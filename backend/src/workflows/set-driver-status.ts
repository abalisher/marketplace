import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { DRIVER_STATUS_CHANGED_EVENT } from "../modules/driver/events"
import {
  setDriverStatusStep,
  SetDriverStatusStepInput,
} from "./steps/set-driver-status"

export type SetDriverStatusWorkflowInput = SetDriverStatusStepInput

// Продавец закрывает заявку водителя или меняет его допуск: правка с
// компенсацией → событие driver.status_changed (уведомление водителю придёт с
// notification-провайдером, подписчика пока нет). Идиома set-trip-status.
export const setDriverStatusWorkflow = createWorkflow(
  "set-driver-status",
  (input: WorkflowData<SetDriverStatusWorkflowInput>) => {
    const result = setDriverStatusStep(input)

    emitEventStep({
      eventName: DRIVER_STATUS_CHANGED_EVENT,
      data: transform({ result }, (data) => ({
        driver_id: data.result.driver.id,
        from: data.result.from,
        to: data.result.driver.status,
        note: data.result.driver.status_note ?? null,
      })),
    })

    return new WorkflowResponse(transform({ result }, (d) => d.result.driver))
  }
)
