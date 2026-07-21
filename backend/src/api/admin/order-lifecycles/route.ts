import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { AdminGetOrderLifecyclesParamsType } from "../orders/validators"

// GET /admin/order-lifecycles — очередь заказов по бизнес-статусу ТЗ. Отдельный
// ресурс, а НЕ переопределение ядрового GET /admin/orders (оно обслуживает
// общий список заказов дашборда — перекрывать нельзя; статический сегмент под
// /admin/orders конфликтовал бы с ядровым /admin/orders/:id).
// Читаем через query.graph по нашей сущности order_lifecycle + link-поля order
// (номер/почта/дата), фильтры по статусу и способу получения, поиск `q`,
// сортировка, пагинация.

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

  const filters: Record<string, unknown> = {}
  if (status) {
    filters.status = status
  }
  if (delivery_method) {
    filters.delivery_method = delivery_method
  }
  if (q) {
    const ids = await findLifecycleIdsByOrderSearch(query, q)
    if (!ids.length) {
      res.json({ order_lifecycles: [], count: 0, offset, limit })
      return
    }
    filters.id = ids
  }

  const { data, metadata } = await query.graph({
    entity: "order_lifecycle",
    fields: [
      "id",
      "status",
      "previous_status",
      "note",
      "delivery_method",
      "created_at",
      "updated_at",
      "order.id",
      "order.display_id",
      "order.email",
      "order.created_at",
    ],
    filters,
    pagination: {
      skip: offset,
      take: limit,
      order: { [field]: direction },
    },
  })

  res.json({
    order_lifecycles: data,
    count: metadata?.count ?? data.length,
    offset,
    limit,
  })
}
