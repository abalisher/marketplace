import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ASSEMBLY_MODULE } from "../../modules/assembly"
import AssemblyModuleService from "../../modules/assembly/service"
import { AssemblyItemStatus } from "../../modules/assembly/models/constants"

export type MarkAssemblyItemStepInput = {
  task_id: string
  item_id: string
  status: AssemblyItemStatus
  picked_quantity?: number | null
  actor_id?: string | null
  note?: string | null
}

type Compensation = {
  item_id: string
  status: AssemblyItemStatus
  picked_quantity: number
  marked_at: Date | null
  marked_by: string | null
  note: string | null
}

// Отметка сборщика по одной позиции задания (набрано / частично / нет в
// наличии). Вся арифметика и проверки — в сервисе модуля; компенсация
// возвращает прежнюю отметку.
export const markAssemblyItemStep = createStep(
  "mark-assembly-item",
  async (input: MarkAssemblyItemStepInput, { container }) => {
    const service = container.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)

    const before = await service.retrieveAssemblyTaskItem(input.item_id)
    const item = await service.markItem(input)

    return new StepResponse<{ item_id: string }, Compensation>(
      { item_id: item.id },
      {
        item_id: before.id,
        status: before.status as AssemblyItemStatus,
        picked_quantity: Number(before.picked_quantity ?? 0),
        marked_at: before.marked_at ?? null,
        marked_by: before.marked_by ?? null,
        note: before.note ?? null,
      }
    )
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    const service = container.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)
    await service.updateAssemblyTaskItems({
      id: compensation.item_id,
      status: compensation.status,
      picked_quantity: compensation.picked_quantity,
      marked_at: compensation.marked_at,
      marked_by: compensation.marked_by,
      note: compensation.note,
    })
  }
)
