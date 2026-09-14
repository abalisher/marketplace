import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ASSEMBLY_MODULE } from "../../../modules/assembly"
import AssemblyModuleService from "../../../modules/assembly/service"
import {
  buildAssemblyTaskRow,
  countAssemblyTasks,
  emptyTaskCounts,
  loadOrderRefs,
} from "./rows"
import { resolveRequestPicker } from "./picker"
import { AdminGetAssemblyTasksParamsType } from "./validators"

// GET /admin/assembly-tasks — очередь заданий сборки. Один ресурс на два
// экрана: сборщик (T10.12) видит только свою группу — категория подставляется
// из его учётки и перекрывает присланный фильтр; отгрузка (T10.13) видит все
// задания и фильтрует сама. Строку целиком собирает rows.ts — экраны ничего
// не пересчитывают.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { status, category, order_id, limit, offset } =
    req.validatedQuery as AdminGetAssemblyTasksParamsType

  const service = req.scope.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const picker = await resolveRequestPicker(req)
  const group = picker.is_picker ? picker.group : (category ?? null)

  // Сборщик без группы — учётка заведена не до конца: чужие задания ему не
  // показываем (пустая очередь честнее, чем все категории разом).
  if (picker.is_picker && !group) {
    res.json({
      assembly_tasks: [],
      counts: { total: 0, by_status: emptyTaskCounts() },
      group: null,
      count: 0,
      offset,
      limit,
    })
    return
  }

  // База для счётчиков чипов — всё, кроме самого статуса.
  const baseFilters: Record<string, unknown> = {}
  if (group) {
    baseFilters.category_handle = group
  }
  if (order_id) {
    baseFilters.order_id = order_id
  }

  const filters: Record<string, unknown> = { ...baseFilters }
  if (status) {
    filters.status = status
  }

  const [[tasks, count], counts] = await Promise.all([
    service.listAndCountAssemblyTasks(filters, {
      skip: offset,
      take: limit,
      relations: ["items"],
      // FIFO: старые задания сверху — с них и начинают.
      order: { created_at: "ASC" },
    }),
    countAssemblyTasks(
      (statusFilters) =>
        service.listAndCountAssemblyTasks(statusFilters, {
          take: 1,
          select: ["id"],
        }),
      baseFilters
    ),
  ])

  const orders = await loadOrderRefs(
    query,
    [...new Set(tasks.map((task) => task.order_id))]
  )

  res.json({
    assembly_tasks: tasks.map((task) =>
      buildAssemblyTaskRow(task, orders.get(task.order_id))
    ),
    counts,
    // Группа сборщика, которой ограничена выборка (null — видны все задания):
    // экран показывает, чью очередь он открыл.
    group: group ?? null,
    count,
    offset,
    limit,
  })
}
