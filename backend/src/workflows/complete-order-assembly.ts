import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createOrderFulfillmentWorkflow } from "@medusajs/medusa/core-flows"
import { StatusActorType } from "../modules/order-lifecycle/models/statuses"
import { determineAssemblyStatusStep } from "./steps/determine-assembly-status"
import { applyOrderTransition } from "./apply-order-transition"

export type CompleteOrderAssemblyWorkflowInput = {
  order_id: string
  // Позиции к сборке (id позиции заказа + количество). Полная сборка — передать
  // все позиции; частичная — подмножество (ядро выставит partially_fulfilled).
  items: { id: string; quantity: number }[]
  location_id?: string
  actor_type: StatusActorType
  actor_id?: string | null
}

// Сборка (в т.ч. частичная): ядровый createOrderFulfillment фиксирует физику
// (fulfillment + fulfillment_status), затем наш статус синхронизируется —
// полная сборка → assembled, частичная → partially_assembled (по факту ядра).
export const completeOrderAssemblyWorkflow = createWorkflow(
  "complete-order-assembly",
  (input: WorkflowData<CompleteOrderAssemblyWorkflowInput>) => {
    const fulfillment = createOrderFulfillmentWorkflow.runAsStep({
      input: {
        order_id: input.order_id,
        items: input.items,
        location_id: input.location_id,
      },
    })

    const { to } = determineAssemblyStatusStep({ order_id: input.order_id })

    applyOrderTransition(
      transform({ input, to }, (data) => ({
        order_id: data.input.order_id,
        to: data.to,
        actor_type: data.input.actor_type,
        actor_id: data.input.actor_id,
      }))
    )

    return new WorkflowResponse(fulfillment)
  }
)
