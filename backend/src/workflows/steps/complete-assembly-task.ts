import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ASSEMBLY_MODULE } from "../../modules/assembly"
import AssemblyModuleService from "../../modules/assembly/service"
import { AssemblyTaskStatus } from "../../modules/assembly/models/constants"

export type CompleteAssemblyTaskStepInput = {
  task_id: string
  actor_id?: string | null
  note?: string | null
}

type Compensation = {
  task_id: string
  status: AssemblyTaskStatus
  completed_at: Date | null
  completed_by: string | null
  note: string | null
}

// Сборщик закрыл задание: статус выводит сервис из отметок позиций
// (всё набрано → assembled, иначе shortage). Компенсация возвращает прежнее
// состояние задания.
export const completeAssemblyTaskStep = createStep(
  "complete-assembly-task",
  async (input: CompleteAssemblyTaskStepInput, { container }) => {
    const service = container.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)

    const before = await service.retrieveAssemblyTask(input.task_id)
    const task = await service.completeTask(input)

    return new StepResponse<
      {
        task_id: string
        order_id: string
        status: AssemblyTaskStatus
        category_handle: string
        category_name: string
      },
      Compensation
    >(
      {
        task_id: task.id,
        order_id: task.order_id,
        status: task.status as AssemblyTaskStatus,
        category_handle: task.category_handle,
        category_name: task.category_name,
      },
      {
        task_id: before.id,
        status: before.status as AssemblyTaskStatus,
        completed_at: before.completed_at ?? null,
        completed_by: before.completed_by ?? null,
        note: before.note ?? null,
      }
    )
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    const service = container.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)
    await service.updateAssemblyTasks({
      id: compensation.task_id,
      status: compensation.status,
      completed_at: compensation.completed_at,
      completed_by: compensation.completed_by,
      note: compensation.note,
    })
  }
)
