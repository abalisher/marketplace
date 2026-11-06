import { findOrderIdsByNumber } from "../../../lib/orders/order-number"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { ASSEMBLY_MODULE } from "../../../modules/assembly"
import AssemblyModuleService from "../../../modules/assembly/service"
import { ORDER_LIFECYCLE_MODULE } from "../../../modules/order-lifecycle"
import OrderLifecycleModuleService from "../../../modules/order-lifecycle/service"
import { OrderStatusValue } from "../../../modules/order-lifecycle/models/statuses"
import { getTenantScope } from "../../utils/tenant-access"
import { AdminGetOrderLifecyclesParamsType } from "../orders/validators"
import { loadOrderAssignees } from "./assignees"
import { countByStatus, emptyCounts, loadRowOrders } from "./rows"
import { countOverdueOrders, orderQueueTiming, orderSlaHours } from "./sla"

// GET /admin/order-lifecycles — очередь заказов по бизнес-статусу ТЗ. Отдельный
// ресурс, а НЕ переопределение ядрового GET /admin/orders (оно обслуживает
// общий список заказов дашборда — перекрывать нельзя; статический сегмент под
// /admin/orders конфликтовал бы с ядровым /admin/orders/:id).
// Читаем через query.graph по нашей сущности order_lifecycle + link-поля order
// (номер/почта/дата), фильтры по статусу и способу получения, поиск `q`,
// сортировка, пагинация.
//
// С T4.2a каждая запись несёт всё, что рисует строка экрана «Заказы» (покупатель,
// число позиций, сумма, оплата, адрес — сборка в rows.ts), а ответ — счётчики по
// статусам для чипов-фильтров: экран остаётся тонким и ничего не пересчитывает.
// С T4.12 к записи добавлены время (возраст заказа, часы в текущем статусе,
// срок статуса и признак просрочки — sla.ts) и ответственный (assignees.ts):
// управляющий читает очередь как «что стоит дольше нормы и у кого», а раньше
// не видел ни того, ни другого.

// Кросс-модульный фильтр по полям заказа query.graph не умеет — поиск идёт
// вторым запросом со стороны order (link-поле order_lifecycle.id читается в обе
// стороны), найденные id подставляются фильтром. Совпадений больше кэпа у
// поиска не бывает по смыслу (номер заказа почти уникален, email — десятки
// заказов покупателя).
const SEARCH_MATCH_CAP = 100

async function findLifecycleIdsByOrderSearch(
  query: Omit<RemoteQueryFunction, symbol>,
  q: string
): Promise<string[]> {
  const orderFilters: Record<string, unknown>[] = [
    { email: { $ilike: `%${q}%` } },
  ]
  // Номер заказа — целиком и как число (пользователь вводит «42» или «#42»).
  const displayId = Number(q.replace(/^#/, ""))
  if (Number.isSafeInteger(displayId) && displayId > 0) {
    orderFilters.push({ display_id: displayId })
  }
  // Номер нового вида — «ORG-26-0007» или его хвост «7» (lib/orders/order-number).
  const byNumber = await findOrderIdsByNumber(query, q)
  if (byNumber.length) {
    orderFilters.push({ id: byNumber })
  }

  const ids = new Set<string>()
  for (const filters of orderFilters) {
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "order_lifecycle.id"],
      filters,
      pagination: { skip: 0, take: SEARCH_MATCH_CAP },
    })
    for (const order of data as {
      order_lifecycle?: { id: string } | null
    }[]) {
      if (order.order_lifecycle?.id) {
        ids.add(order.order_lifecycle.id)
      }
    }
  }
  return [...ids]
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { status, delivery_method, q, order, limit, offset } =
    req.validatedQuery as AdminGetOrderLifecyclesParamsType

  const field = order.replace(/^-/, "")
  const direction = order.startsWith("-") ? ("DESC" as const) : ("ASC" as const)

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // База для счётчиков чипов — всё, кроме самого статуса: чипы показывают,
  // сколько заказов в каждом статусе при текущем поиске и способе получения.
  const baseFilters: Record<string, unknown> = {}
  // Продавец компании видит только заказы её канала продаж.
  const tenant = getTenantScope(req)
  if (tenant) {
    baseFilters.sales_channel_id = tenant.sales_channel_id
  }
  if (delivery_method) {
    baseFilters.delivery_method = delivery_method
  }
  if (q) {
    const ids = await findLifecycleIdsByOrderSearch(query, q)
    if (!ids.length) {
      res.json({
        order_lifecycles: [],
        counts: emptyCounts(),
        count: 0,
        offset,
        limit,
      })
      return
    }
    baseFilters.id = ids
  }

  const filters: Record<string, unknown> = { ...baseFilters }
  if (status) {
    filters.status = status
  }

  const [{ data, metadata }, counts, overdue] = await Promise.all([
    query.graph({
      entity: "order_lifecycle",
      fields: [
        "id",
        "status",
        "previous_status",
        "note",
        "delivery_method",
        "delivery_date",
        "delivery_window",
        "created_at",
        "updated_at",
        "order.id",
      ],
      filters,
      pagination: {
        skip: offset,
        take: limit,
        order: { [field]: direction },
      },
    }),
    countByStatus(query, baseFilters),
    countOverdueOrders(query, baseFilters),
  ])

  const lifecycles = data as {
    id: string
    status: OrderStatusValue
    created_at?: string | null
    updated_at?: string | null
    order?: { id: string } | null
  }[]
  const orderIds = lifecycles
    .map((lifecycle) => lifecycle.order?.id)
    .filter((id): id is string => !!id)

  const [rows, assignees] = await Promise.all([
    loadRowOrders(query, req.scope.resolve(Modules.ORDER), orderIds),
    loadOrderAssignees(
      {
        assembly: req.scope.resolve<AssemblyModuleService>(ASSEMBLY_MODULE),
        lifecycle: req.scope.resolve<OrderLifecycleModuleService>(
          ORDER_LIFECYCLE_MODULE
        ),
        users: req.scope.resolve(Modules.USER),
      },
      lifecycles
        .filter((lifecycle) => !!lifecycle.order?.id)
        .map((lifecycle) => ({
          lifecycle_id: lifecycle.id,
          order_id: lifecycle.order!.id,
          status: lifecycle.status,
        }))
    ),
  ])

  const sla = orderSlaHours()
  const now = Date.now()

  res.json({
    order_lifecycles: lifecycles.map((lifecycle) => ({
      ...lifecycle,
      ...orderQueueTiming(lifecycle, sla, now),
      assignee: lifecycle.order?.id
        ? (assignees.get(lifecycle.order.id) ?? null)
        : null,
      order: lifecycle.order?.id ? (rows.get(lifecycle.order.id) ?? null) : null,
    })),
    counts: { ...counts, overdue },
    count: metadata?.count ?? data.length,
    offset,
    limit,
  })
}
