import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { AdminGetOrderLifecyclesParamsType } from "../orders/validators"

// GET /admin/order-lifecycles — очередь заказов по бизнес-статусу ТЗ. Отдельный
// ресурс, а НЕ переопределение ядрового GET /admin/orders (оно обслуживает
// общий список заказов дашборда — перекрывать нельзя; статический сегмент под
// /admin/orders конфликтовал бы с ядровым /admin/orders/:id).
// Читаем через query.graph по нашей сущности order_lifecycle + link-поля order
// (номер/почта/дата), фильтр по статусу, сортировка, пагинация.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { status, order, limit, offset } =
    req.validatedQuery as AdminGetOrderLifecyclesParamsType

  const field = order.replace(/^-/, "")
  const direction = order.startsWith("-") ? ("DESC" as const) : ("ASC" as const)

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
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
    filters: status ? { status } : {},
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
