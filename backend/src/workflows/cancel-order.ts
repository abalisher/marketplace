import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { cancelOrderWorkflow as cancelCoreOrderWorkflow } from "@medusajs/medusa/core-flows"
import { StatusActorType } from "../modules/order-lifecycle/models/statuses"
import { applyOrderTransition } from "./apply-order-transition"

export type CancelOrderWorkflowInput = {
  order_id: string
  actor_type: StatusActorType
  actor_id?: string | null
  reason?: string | null
}

// Отмена: ядровый cancelOrder (order.status → canceled), наш статус → canceled.
// Стейт-машина разрешает отмену до отгрузки (new..assembled → canceled); ядро
// дополнительно откажет, если у заказа есть неотменённые fulfillment'ы —
// физику отмены оставляем ядру, наш переход синхронен. Причина логируется.
// id workflow — cancel-order-lifecycle, НЕ cancel-order: последний занят
// ядровым cancelOrderWorkflow (мы его оборачиваем — совпадение id ломает реестр).
export const cancelOrderWorkflow = createWorkflow(
  // eslint-disable-next-line @medusajs/workflow-id-matches-export-or-filename -- id намеренно отличается от файла (коллизия с ядровым cancel-order)
  "cancel-order-lifecycle",
  (input: WorkflowData<CancelOrderWorkflowInput>) => {
    cancelCoreOrderWorkflow.runAsStep({
      input: { order_id: input.order_id },
    })

    const result = applyOrderTransition({
      order_id: input.order_id,
      to: "canceled",
      actor_type: input.actor_type,
      actor_id: input.actor_id,
      reason: input.reason,
    })

    return new WorkflowResponse(result)
  }
)
