import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createOrderShipmentWorkflow } from "@medusajs/medusa/core-flows"
import { StatusActorType } from "../modules/order-lifecycle/models/statuses"
import { applyOrderTransition } from "./apply-order-transition"
import { issueDeliveryCodeStep } from "./steps/issue-delivery-code"

export type ShipOrderWorkflowInput = {
  order_id: string
  fulfillment_id: string
  items: { id: string; quantity: number }[]
  actor_type: StatusActorType
  actor_id?: string | null
}

// Отгрузка: ядровый createOrderShipment (fulfillment → shipped), наш статус →
// in_delivery. Отгрузка возможна и с частично собранного заказа (стейт-машина
// разрешает partially_assembled → in_delivery — отправка готовой части).
export const shipOrderWorkflow = createWorkflow(
  "ship-order",
  (input: WorkflowData<ShipOrderWorkflowInput>) => {
    createOrderShipmentWorkflow.runAsStep({
      input: {
        order_id: input.order_id,
        fulfillment_id: input.fulfillment_id,
        items: input.items,
      },
    })

    const result = applyOrderTransition({
      order_id: input.order_id,
      to: "in_delivery",
      actor_type: input.actor_type,
      actor_id: input.actor_id,
    })

    // Код получения выдаётся при входе в доставку (приёмка по коду — ТЗ);
    // in_delivery достижим только для способа delivery, отдельной проверки
    // метода не нужно. Отгрузка второй частью код не перевыпускает.
    issueDeliveryCodeStep({ order_lifecycle_id: result.order_lifecycle_id })

    return new WorkflowResponse(result)
  }
)
