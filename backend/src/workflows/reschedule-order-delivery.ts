import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { ORDER_SLOT_CHANGED_EVENT } from "../modules/order-lifecycle/events"
import {
  rescheduleDeliverySlotStep,
  RescheduleDeliverySlotStepInput,
} from "./steps/reschedule-delivery-slot"

export type RescheduleOrderDeliveryWorkflowInput =
  RescheduleDeliverySlotStepInput

// Перенос доставки на другое окно (T5.6b): слот заказа двигается, запись «кто и
// почему подвинул» ложится в лог заказа, наружу уходит
// order_lifecycle.slot_changed — покупателя надо предупредить, что машина
// приедет в другое время. Ядровых workflow здесь нет: слот — наш домен, ядро
// о нём не знает (в отличие от переходов статуса, которые оборачивают ядро).
export const rescheduleOrderDeliveryWorkflow = createWorkflow(
  "reschedule-order-delivery",
  (input: WorkflowData<RescheduleOrderDeliveryWorkflowInput>) => {
    const result = rescheduleDeliverySlotStep(input)

    emitEventStep({
      eventName: ORDER_SLOT_CHANGED_EVENT,
      data: transform({ input, result }, (data) => ({
        order_id: data.input.order_id,
        order_lifecycle_id: data.result.order_lifecycle_id,
        from: data.result.from,
        to: data.result.to,
        actor_type: data.input.actor_type,
        reason: data.input.reason ?? null,
      })),
    })

    return new WorkflowResponse(result)
  }
)
