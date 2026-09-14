import { z } from "@medusajs/framework/zod"
import { ASSEMBLY_TASK_STATUSES } from "../../../modules/assembly/models/constants"

// Фильтр статуса принимает одно значение или несколько (список повторяющимся
// параметром `status=a&status=b` или через запятую) — идиома очередей заказов
// и претензий.
const TaskStatusFilter = z.preprocess(
  (value) => (typeof value === "string" ? value.split(",") : value),
  z.union([
    z.enum(ASSEMBLY_TASK_STATUSES),
    z.array(z.enum(ASSEMBLY_TASK_STATUSES)).min(1),
  ])
)

// Очередь заданий сборки: фильтр статуса, категории-группы и заказа +
// пагинация. Сборщику группа подставляется из его учётки и присланную
// перекрывает (см. picker.ts) — задания чужой категории он не видит.
export const AdminGetAssemblyTasksParams = z.object({
  status: TaskStatusFilter.optional(),
  category: z.string().trim().min(1).optional(),
  order_id: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
export type AdminGetAssemblyTasksParamsType = z.infer<
  typeof AdminGetAssemblyTasksParams
>

// Взять задание в работу. Исполнителя берём из учётки (actor_id), тело пустое.
export const AdminStartAssemblyTask = z.object({})
export type AdminStartAssemblyTaskType = z.infer<typeof AdminStartAssemblyTask>

// Отметка по позиции: набрано целиком / частично (сколько именно) / нет в
// наличии. Согласованность количества со статусом проверяет сервис модуля.
export const AdminMarkAssemblyItem = z.object({
  status: z.enum(["picked", "partial", "missing"]),
  picked_quantity: z.coerce.number().int().min(0).optional(),
  note: z.string().trim().min(1).max(500).optional(),
})
export type AdminMarkAssemblyItemType = z.infer<typeof AdminMarkAssemblyItem>

// Закрыть задание: итог (собрано / нехватка) выводится из отметок позиций,
// комментарий сборщика необязателен.
export const AdminCompleteAssemblyTask = z.object({
  note: z.string().trim().min(1).max(500).optional(),
})
export type AdminCompleteAssemblyTaskType = z.infer<
  typeof AdminCompleteAssemblyTask
>
