import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { ORDER_STATUS_CHANGED_EVENT } from "../modules/order-lifecycle/events"
import {
  syncLifecycleStatusStep,
  SyncLifecycleStatusStepInput,
} from "./steps/sync-lifecycle-status"

export type SyncOrderLifecycleWorkflowInput = SyncLifecycleStatusStepInput

// Догон жизненного цикла за ядром: подписчики на ядровые события
// (order.fulfillment_created / shipment.created / delivery.created /
// order.canceled / order.completed) вызывают этот workflow, если продавец
// сделал операцию через ядровую страницу заказа мимо нашего drawer'а.
// Расхождение «в ядре отгружено, у нас Собран» после этого невозможно.
//
// Каждый догнанный переход эмитит тот же order_lifecycle.status_changed, что и
// сценарные workflow, — уведомления, документы, бонус и скоринг не различают
// источник перехода. emitEventStep принимает массив: событий столько, сколько
// хопов догнали (ноль хопов — ноль событий, ничего не эмитится).
//
// Обратной связи с ядром здесь нет намеренно: ядро уже в целевом состоянии,
// это мы его догоняем. Ядровые workflow отсюда не вызываются — иначе догон
// зациклился бы на собственных событиях.
export const syncOrderLifecycleWorkflow = createWorkflow(
  "sync-order-lifecycle",
  (input: WorkflowData<SyncOrderLifecycleWorkflowInput>) => {
    const result = syncLifecycleStatusStep(input)

    emitEventStep({
      eventName: ORDER_STATUS_CHANGED_EVENT,
      data: transform({ input, result }, (data) =>
        data.result.applied.map((step) => ({
          order_id: data.input.order_id,
          order_lifecycle_id: data.result.order_lifecycle_id,
          from: step.from,
          to: step.to,
          actor_type: "system",
        }))
      ),
    })

    return new WorkflowResponse(result)
  }
)
