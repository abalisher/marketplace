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
import { loadAssemblyOrderIds } from "../../../lib/tenants/scope"
import { getTenantScope } from "../../utils/tenant-access"
import { resolveRequestPicker } from "./picker"
import { AdminGetAssemblyTasksParamsType } from "./validators"

// GET /admin/assembly-tasks — очередь заданий сборки. Один ресурс на два
// экрана: сборщик видит только свою работу — задания подтверждённых заказов
// своей компании (сборщик площадки — заказов вне компаний) и, если у него
// проставлена группа, только своей категории; отгрузка (T10.13) видит все
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

  // В панель компании пускают только её сборщиков (tenant-access).
  const tenant = getTenantScope(req)
  const picker = tenant
    ? { ...(await resolveRequestPicker(req)), is_picker: true }
    : await resolveRequestPicker(req)
  const group = picker.is_picker ? picker.group : (category ?? null)

  const empty = () => {
    res.json({
      assembly_tasks: [],
      counts: { total: 0, by_status: emptyTaskCounts() },
      group: group ?? null,
      count: 0,
      offset,
      limit,
    })
  }

  // Сборщик площадки без группы — учётка заведена не до конца: чужие задания
  // ему не показываем (пустая очередь честнее, чем все категории разом). У
  // сборщика компании группа необязательна — он собирает все категории.
  if (picker.is_picker && !tenant && !group) {
    empty()
    return
  }

  let orderIds: string[] | null = null
  if (picker.is_picker) {
    orderIds = await loadAssemblyOrderIds(
      req.scope,
      tenant?.sales_channel_id ?? null
    )
    if (order_id) {
      orderIds = orderIds.filter((id) => id === order_id)
    }
    if (!orderIds.length) {
      empty()
      return
    }
  }

  // База для счётчиков чипов — всё, кроме самого статуса.
  const baseFilters: Record<string, unknown> = {}
  if (group) {
    baseFilters.category_handle = group
  }
  if (orderIds) {
    baseFilters.order_id = orderIds
  } else if (order_id) {
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
      // Новые задания сверху (решение владельца 2026-11-05: сборщик ищет
      // глазами только что подтверждённый заказ; прежде был FIFO).
      order: { created_at: "DESC" },
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
