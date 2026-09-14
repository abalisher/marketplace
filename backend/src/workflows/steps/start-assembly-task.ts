import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ASSEMBLY_MODULE } from "../../modules/assembly"
import AssemblyModuleService from "../../modules/assembly/service"
import { AssemblyTaskStatus } from "../../modules/assembly/models/constants"

export type StartAssemblyTaskStepInput = {
  task_id: string
  actor_id?: string | null
}

type Compensation = {
  task_id: string
  status: AssemblyTaskStatus
  assignee_id: string | null
  started_at: Date | null
}

// Сборщик взял задание (pending → picking). Инвариант перехода — в сервисе
// модуля; компенсация возвращает прежнее состояние задания.
export const startAssemblyTaskStep = createStep(
  "start-assembly-task",
  async (input: StartAssemblyTaskStepInput, { container }) => {
    const service = container.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)

    const before = await service.retrieveAssemblyTask(input.task_id)
    const task = await service.startTask(input)

    return new StepResponse<{ task_id: string; order_id: string }, Compensation>(
      { task_id: task.id, order_id: task.order_id },
      {
        task_id: before.id,
        status: before.status as AssemblyTaskStatus,
        assignee_id: before.assignee_id ?? null,
        started_at: before.started_at ?? null,
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
      assignee_id: compensation.assignee_id,
      started_at: compensation.started_at,
    })
  }
)
