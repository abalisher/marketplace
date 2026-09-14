import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ASSEMBLY_MODULE } from "../../../modules/assembly"
import AssemblyModuleService, {
  fulfillmentLinesFromTasks,
  summarizeOrderAssembly,
} from "../../../modules/assembly/service"
import { AssemblyTaskStatus } from "../../../modules/assembly/models/constants"
import { OrderStatusValue } from "../../../modules/order-lifecycle/models/statuses"
import { loadRowOrders } from "../order-lifecycles/rows"
import { loadOrderRefs } from "../assembly-tasks/rows"
import {
  SHIPPING_QUEUE_SCAN_CAP,
  SHIPPING_QUEUE_STATUSES,
  ShippingStage,
  buildCategoryTiles,
  buildShippingRow,
  countByStage,
  loadFulfillments,
  shipTarget,
  shippingStage,
} from "./rows"
import { loadUserNames } from "../user-names"
import { AdminGetShippingQueueParamsType } from "./validators"

// GET /admin/shipping-queue — рабочий стол отгрузки (T10.13): заказы, которые
// ещё не уехали, каждый — плитками категорий, стадией и готовой целью перехода
// «передать водителю». По одному ответу видно, что тормозит отгрузку: экран
// ничего не пересчитывает и не ходит за данными в четыре места.
//
// Стадию нельзя спросить у БД фильтром — она выводится из заданий сборки
// (жизненный цикл заказа догоняет факт сборки только при закрытии ПОСЛЕДНЕГО
// задания). Поэтому очередь читается целиком до потолка SHIPPING_QUEUE_SCAN_CAP
// и режется на страницы в памяти; счётчики чипов при этом честные.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { stage, limit, offset } =
    req.validatedQuery as AdminGetShippingQueueParamsType

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const service = req.scope.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)
  const orderService = req.scope.resolve(Modules.ORDER)
  const userService = req.scope.resolve(Modules.USER)

  // Заказы «до отгрузки», FIFO — старые сверху: это очередь, а не журнал.
  const { data: lifecycles } = await query.graph({
    entity: "order_lifecycle",
    fields: ["id", "status", "created_at", "order.id"],
    filters: { status: SHIPPING_QUEUE_STATUSES },
    pagination: {
      skip: 0,
      take: SHIPPING_QUEUE_SCAN_CAP,
      order: { created_at: "ASC" },
    },
  })

  const queue = (
    lifecycles as { status: string; order?: { id: string } | null }[]
  )
    .filter((lifecycle) => !!lifecycle.order?.id)
    .map((lifecycle) => ({
      order_id: lifecycle.order!.id,
      order_status: lifecycle.status as OrderStatusValue,
    }))

  if (!queue.length) {
    res.json({
      shipping_orders: [],
      counts: countByStage([]),
      count: 0,
      offset,
      limit,
      scan_cap: SHIPPING_QUEUE_SCAN_CAP,
    })
    return
  }

  // Задания всех заказов очереди: из них считаются и стадия, и счётчики чипов.
  const tasks = await service.listAssemblyTasks(
    { order_id: queue.map((entry) => entry.order_id) },
    { relations: ["items"], order: { created_at: "ASC" } }
  )

  const byOrder = new Map<string, typeof tasks>()
  for (const task of tasks) {
    const list = byOrder.get(task.order_id) ?? []
    list.push(task)
    byOrder.set(task.order_id, list)
  }

  // Заказ без заданий в очереди отгрузки не место: заданий нет у неоплаченных
  // и у заказов старше распада (их разложил бэкфилл split-existing-orders).
  const staged = queue
    .filter((entry) => byOrder.has(entry.order_id))
    .map((entry) => {
      const orderTasks = byOrder.get(entry.order_id)!
      const summary = summarizeOrderAssembly(
        orderTasks.map((task) => ({
          id: task.id,
          category_handle: task.category_handle,
          status: task.status as AssemblyTaskStatus,
          items: task.items?.map((item) => ({
            order_item_id: item.order_item_id,
            picked_quantity: Number(item.picked_quantity ?? 0),
          })),
        }))
      )
      return { ...entry, tasks: orderTasks, summary, stage: shippingStage(summary) }
    })

  const counts = countByStage(staged.map((entry) => entry.stage))
  const filtered = stage
    ? staged.filter((entry) => entry.stage === (stage as ShippingStage))
    : staged
  const page = filtered.slice(offset, offset + limit)
  const pageOrderIds = page.map((entry) => entry.order_id)

  // Тяжёлое — только для страницы: строка заказа (покупатель, сумма, адрес),
  // fulfillment под отгрузку и имена сборщиков.
  const [rows, refs, fulfillments, names] = await Promise.all([
    loadRowOrders(query, orderService, pageOrderIds),
    loadOrderRefs(query, pageOrderIds),
    loadFulfillments(query, pageOrderIds),
    loadUserNames(
      userService,
      [
        ...new Set(
          page
            .flatMap((entry) => entry.tasks)
            .flatMap((task) => [task.assignee_id, task.completed_by])
            .filter((id): id is string => !!id)
        ),
      ]
    ),
  ])

  res.json({
    shipping_orders: page.map((entry) =>
      buildShippingRow({
        order_id: entry.order_id,
        order_status: entry.order_status,
        summary: entry.summary,
        categories: buildCategoryTiles(
          entry.tasks,
          names,
          refs.get(entry.order_id)
        ),
        order: rows.get(entry.order_id) ?? null,
        ship_target: shipTarget(
          fulfillments.get(entry.order_id) ?? [],
          fulfillmentLinesFromTasks(
            entry.tasks.map((task) => ({
              status: task.status as AssemblyTaskStatus,
              items: task.items?.map((item) => ({
                order_item_id: item.order_item_id,
                picked_quantity: Number(item.picked_quantity ?? 0),
              })),
            }))
          )
        ),
      })
    ),
    counts,
    count: filtered.length,
    offset,
    limit,
    // Потолок просмотра очереди: экран честно говорит, если заказов больше.
    scan_cap: SHIPPING_QUEUE_SCAN_CAP,
  })
}
