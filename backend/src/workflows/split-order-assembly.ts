import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { ASSEMBLY_TASKS_CREATED_EVENT } from "../modules/assembly/events"
import { resolveOrderAssemblyLinesStep } from "./steps/resolve-order-assembly-lines"
import { createAssemblyTasksStep } from "./steps/create-assembly-tasks"

export type SplitOrderAssemblyWorkflowInput = {
  order_id: string
}

// Распад оплаченного заказа на задания сборки — по одному на каждую
// присутствующую в заказе категорию (решение владельца 2026-08-25, п. 4).
// Запускается подписчиком на order.placed: у нас 100% предоплата, поэтому
// размещённый заказ = оплаченный (см. place-order). Идемпотентно: повторный
// прогон по заказу с заданиями ничего не создаёт и события не шлёт.
export const splitOrderAssemblyWorkflow = createWorkflow(
  "split-order-assembly",
  (input: WorkflowData<SplitOrderAssemblyWorkflowInput>) => {
    const { lines } = resolveOrderAssemblyLinesStep({
      order_id: input.order_id,
    })

    const result = createAssemblyTasksStep(
      transform({ input, lines }, (data) => ({
        order_id: data.input.order_id,
        lines: data.lines,
      }))
    )

    when("tasks-were-created", { result }, ({ result }) =>
      Boolean(result.created_ids.length)
    ).then(() =>
      emitEventStep({
        eventName: ASSEMBLY_TASKS_CREATED_EVENT,
        data: transform({ input, result }, (data) => ({
          order_id: data.input.order_id,
          task_ids: data.result.created_ids,
          categories: data.result.tasks.map((t) => t.category_handle),
        })),
      })
    )

    return new WorkflowResponse(result)
  }
)
