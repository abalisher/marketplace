import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ASSEMBLY_MODULE } from "../../modules/assembly"
import AssemblyModuleService, {
  fulfillmentLinesFromTasks,
  summarizeOrderAssembly,
} from "../../modules/assembly/service"
import { AssemblyTaskStatus } from "../../modules/assembly/models/constants"

export type SummarizeOrderAssemblyStepInput = {
  order_id: string
}

// Агрегат сборки заказа: сколько заданий закрыто, есть ли нехватка, что реально
// набрано (позиции для ядрового fulfillment). Читающий шаг — компенсации нет.
// Сама арифметика — чистые функции сервиса (юнит-тесты).
export const summarizeOrderAssemblyStep = createStep(
  "summarize-order-assembly",
  async (input: SummarizeOrderAssemblyStepInput, { container }) => {
    const service = container.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)

    const tasks = await service.listOrderTasks(input.order_id)
    const views = tasks.map((task) => ({
      id: task.id,
      category_handle: task.category_handle,
      status: task.status as AssemblyTaskStatus,
      items: (task.items ?? []).map((item) => ({
        order_item_id: item.order_item_id,
        picked_quantity: Number(item.picked_quantity ?? 0),
      })),
    }))

    const summary = summarizeOrderAssembly(views)
    const lines = fulfillmentLinesFromTasks(views)

    return new StepResponse({
      ...summary,
      lines,
      // Сборка окончена И есть что отгружать: при полной нехватке ядровый
      // fulfillment создавать не из чего — заказ остаётся в сборке с флагом.
      can_fulfill: summary.is_finished && lines.length > 0,
    })
  }
)
