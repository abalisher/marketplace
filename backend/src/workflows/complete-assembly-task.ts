import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import {
  ASSEMBLY_ORDER_FINISHED_EVENT,
  ASSEMBLY_SHORTAGE_EVENT,
} from "../modules/assembly/events"
import { completeAssemblyTaskStep } from "./steps/complete-assembly-task"
import { summarizeOrderAssemblyStep } from "./steps/summarize-order-assembly"
import { ensureOrderAssemblingStep } from "./steps/ensure-order-assembling"
import { completeOrderAssemblyWorkflow } from "./complete-order-assembly"

export type CompleteAssemblyTaskWorkflowInput = {
  task_id: string
  actor_id?: string | null
  note?: string | null
}

// Сборщик закрыл задание своей категории. Дальше решает АГРЕГАТ по заказу:
// пока закрыты не все задания — ничего не происходит; когда закрыто последнее,
// заказ передаётся в отгрузку — ядровый fulfillment на реально набранное
// (complete-order-assembly), а наш статус становится assembled (всё собрано)
// или partially_assembled (была нехватка). Нехватка не блокирует заказ молча:
// на неё уходит событие assembly.shortage_reported отвечающему за отгрузку.
// Полная нехватка (набрано ноль) fulfillment не создаёт — заказ остаётся в
// сборке с поднятым флагом.
export const completeAssemblyTaskWorkflow = createWorkflow(
  "complete-assembly-task",
  (input: WorkflowData<CompleteAssemblyTaskWorkflowInput>) => {
    const task = completeAssemblyTaskStep(input)

    when("task-has-shortage", { task }, ({ task }) => task.status === "shortage")
      .then(() =>
        emitEventStep({
          eventName: ASSEMBLY_SHORTAGE_EVENT,
          data: transform({ task }, (d) => ({
            order_id: d.task.order_id,
            task_id: d.task.task_id,
            category_handle: d.task.category_handle,
            category_name: d.task.category_name,
          })),
        }).config({ name: "emit-assembly-shortage" })
      )

    const summary = summarizeOrderAssemblyStep(
      transform({ task }, (d) => ({ order_id: d.task.order_id }))
    )

    when("order-assembly-finished", { summary }, ({ summary }) =>
      Boolean(summary.is_finished)
    ).then(() =>
      emitEventStep({
        eventName: ASSEMBLY_ORDER_FINISHED_EVENT,
        data: transform({ task, summary }, (d) => ({
          order_id: d.task.order_id,
          is_assembled: d.summary.is_assembled,
          has_shortage: d.summary.has_shortage,
        })),
      }).config({ name: "emit-assembly-order-finished" })
    )

    when("order-can-be-fulfilled", { summary }, ({ summary }) =>
      Boolean(summary.can_fulfill)
    ).then(() => {
      const lifecycle = ensureOrderAssemblingStep(
        transform({ input, task }, (d) => ({
          order_id: d.task.order_id,
          actor_id: d.input.actor_id,
        }))
      )

      completeOrderAssemblyWorkflow.runAsStep({
        input: transform({ input, task, summary, lifecycle }, (d) => ({
          order_id: d.task.order_id,
          items: d.summary.lines,
          actor_type: "seller" as const,
          actor_id: d.input.actor_id,
        })),
      })
    })

    // Наружу отдаём только агрегат заказа — позиции к fulfillment'у (lines)
    // технические, экрану они не нужны.
    return new WorkflowResponse(
      transform({ task, summary }, (d) => ({
        task_id: d.task.task_id,
        order_id: d.task.order_id,
        status: d.task.status,
        summary: {
          tasks_total: d.summary.tasks_total,
          tasks_finished: d.summary.tasks_finished,
          tasks_assembled: d.summary.tasks_assembled,
          tasks_shortage: d.summary.tasks_shortage,
          is_finished: d.summary.is_finished,
          is_assembled: d.summary.is_assembled,
          has_shortage: d.summary.has_shortage,
        },
      }))
    )
  }
)
