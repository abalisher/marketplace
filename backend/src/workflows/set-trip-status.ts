import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { TRIP_STATUS_CHANGED_EVENT } from "../modules/logistics/events"
import {
  setTripStatusStep,
  SetTripStatusStepInput,
} from "./steps/set-trip-status"

export type SetTripStatusWorkflowInput = SetTripStatusStepInput

// Перевод рейса по стейт-машине (planned→loading→en_route→completed, отмена из
// незавершённого). Правка с компенсацией → событие trip.status_changed
// (уведомление покупателю о выезде/прибытии — подписчик-заглушка до
// notification-провайдера).
export const setTripStatusWorkflow = createWorkflow(
  "set-trip-status",
  (input: WorkflowData<SetTripStatusWorkflowInput>) => {
    const trip = setTripStatusStep(input)

    emitEventStep({
      eventName: TRIP_STATUS_CHANGED_EVENT,
      data: transform({ trip }, (d) => ({
        trip_id: d.trip.id,
        status: d.trip.status,
      })),
    })

    return new WorkflowResponse(trip)
  }
)
