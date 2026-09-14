import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { TRIP_STOP_STATUS_CHANGED_EVENT } from "../modules/logistics/events"
import {
  setTripStopStatusStep,
  SetTripStopStatusStepInput,
} from "./steps/set-trip-stop-status"
import { deliverOrderWorkflow } from "./deliver-order"
import { StatusActorType } from "../modules/order-lifecycle/models/statuses"

export type SetTripStopStatusWorkflowInput = SetTripStopStatusStepInput & {
  // Для завершения delivery-точки (status=done, type=delivery): передав
  // fulfillment_id + delivery_code, отметка «выдано» на точке ТРИГГЕРИТ
  // существующий deliver-order (order-lifecycle → delivered по коду покупателя).
  // Не дублируем ядровый fulfillment — переиспользуем deliver-order-workflow.
  fulfillment_id?: string
  delivery_code?: string | null
  // Кто отметил выдачу: диспетчер из панели (`admin`) или сам водитель из
  // приложения (`driver`, T5.2b) — попадает в лог переходов заказа, поэтому
  // подставлять одно за другое нельзя.
  actor_type?: StatusActorType
  actor_id?: string | null
}

// Перевод точки рейса по стейт-машине + proof/checklist. При выдаче delivery-
// точки (done) с переданным fulfillment_id — триггерит deliver-order (заказ
// становится delivered). Событие trip_stop.status_changed — для уведомлений
// (подписчик-заглушка). Порядок как в deliver-order: наш переход и его
// компенсация внутри deliverOrderWorkflow идут первыми.
export const setTripStopStatusWorkflow = createWorkflow(
  "set-trip-stop-status",
  (input: WorkflowData<SetTripStopStatusWorkflowInput>) => {
    const stop = setTripStopStatusStep(
      transform({ input }, (d) => ({
        id: d.input.id,
        status: d.input.status,
        proof: d.input.proof,
        checklist: d.input.checklist,
        note: d.input.note,
      }))
    )

    when(
      "delivery-stop-completed",
      { stop, input },
      ({ stop, input }) =>
        stop.type === "delivery" &&
        stop.status === "done" &&
        !!input.fulfillment_id
    ).then(() => {
      deliverOrderWorkflow.runAsStep({
        input: transform({ stop, input }, (d) => ({
          order_id: d.stop.order_id,
          fulfillment_id: d.input.fulfillment_id as string,
          delivery_code: d.input.delivery_code,
          actor_type: (d.input.actor_type ?? "admin") as StatusActorType,
          actor_id: d.input.actor_id,
        })),
      })
    })

    emitEventStep({
      eventName: TRIP_STOP_STATUS_CHANGED_EVENT,
      data: transform({ stop }, (d) => ({
        trip_stop_id: d.stop.id,
        order_id: d.stop.order_id,
        type: d.stop.type,
        status: d.stop.status,
      })),
    })

    return new WorkflowResponse(stop)
  }
)
