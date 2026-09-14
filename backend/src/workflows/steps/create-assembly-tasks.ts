import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ASSEMBLY_MODULE } from "../../modules/assembly"
import AssemblyModuleService from "../../modules/assembly/service"
import {
  AssemblyTaskDraft,
  splitOrderLinesByCategory,
  OrderLineForSplit,
} from "../../modules/assembly/split"

export type CreateAssemblyTasksStepInput = {
  order_id: string
  lines: OrderLineForSplit[]
}

type CreatedTasks = {
  // Пусто, если задания по заказу уже были (повторная доставка order.placed):
  // шаг идемпотентен, компенсация тогда ничего не удаляет.
  created_ids: string[]
  tasks: { id: string; category_handle: string; category_name: string }[]
}

// Создаёт задания сборки по категориям заказа. Сам распад — чистая функция
// splitOrderLinesByCategory (юнит-тесты); шаг отвечает только за запись и
// компенсацию (удаление созданных заданий вместе с позициями).
export const createAssemblyTasksStep = createStep(
  "create-assembly-tasks",
  async (input: CreateAssemblyTasksStepInput, { container }) => {
    const service = container.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)

    const existing = await service.listAssemblyTasks({
      order_id: input.order_id,
    })
    if (existing.length) {
      return new StepResponse<CreatedTasks, string[]>(
        {
          created_ids: [],
          tasks: existing.map((t) => ({
            id: t.id,
            category_handle: t.category_handle,
            category_name: t.category_name,
          })),
        },
        []
      )
    }

    const drafts: AssemblyTaskDraft[] = splitOrderLinesByCategory(input.lines)
    const created = await service.createOrderTasks(input.order_id, drafts)

    return new StepResponse<CreatedTasks, string[]>(
      {
        created_ids: created.map((t) => t.id),
        tasks: created.map((t) => ({
          id: t.id,
          category_handle: t.category_handle,
          category_name: t.category_name,
        })),
      },
      created.map((t) => t.id)
    )
  },
  async (createdIds, { container }) => {
    if (!createdIds?.length) {
      return
    }
    const service = container.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)
    const items = await service.listAssemblyTaskItems({
      task_id: createdIds,
    })
    if (items.length) {
      await service.deleteAssemblyTaskItems(items.map((i) => i.id))
    }
    await service.deleteAssemblyTasks(createdIds)
  }
)
