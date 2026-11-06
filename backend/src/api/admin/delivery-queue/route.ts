import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { loadRowOrders, numericAmount } from "../order-lifecycles/rows"
import { getTenantScope } from "../../utils/tenant-access"

// GET /admin/delivery-queue — рабочее место водителя компании: её заказы «В
// доставке», ближайший слот сверху. По каждому — то, что нужно на точке:
// покупатель и телефон, адрес, окно приезда, состав, оплата (везти ли деньги
// не нужно — оплату принимает продавец, но водитель должен знать, оплачен ли
// заказ) и отгрузка под вручение. Код получения водителю НЕ отдаётся: его
// называет покупатель, а проверяет переход delivered.
//
// Сотрудник площадки видит заказы всех каналов (диспетчерский взгляд).

// Потолок списка: у компании в доставке одновременно единицы заказов.
const DELIVERY_QUEUE_CAP = 100

type RawLifecycle = {
  id: string
  number?: string | null
  delivery_date?: string | null
  delivery_window?: string | null
  order?: { id: string } | null
}

type RawOrder = {
  id: string
  display_id?: number | null
  customer?: {
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
  } | null
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    address_1?: string | null
    address_2?: string | null
    city?: string | null
  } | null
  items?: {
    id: string
    title?: string | null
    product_title?: string | null
    variant_title?: string | null
    quantity?: unknown
  }[] | null
  fulfillments?: {
    id: string
    shipped_at?: string | Date | null
    delivered_at?: string | Date | null
    canceled_at?: string | Date | null
  }[] | null
}

const fullName = (first?: string | null, last?: string | null): string | null =>
  [first, last].filter((part) => !!part?.trim()).join(" ").trim() || null

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const orderService = req.scope.resolve(Modules.ORDER)
  const tenant = getTenantScope(req)

  const { data: lifecycles } = await query.graph({
    entity: "order_lifecycle",
    fields: ["id", "number", "delivery_date", "delivery_window", "order.id"],
    filters: {
      status: ["in_delivery"],
      ...(tenant ? { sales_channel_id: tenant.sales_channel_id } : {}),
    },
    pagination: { skip: 0, take: DELIVERY_QUEUE_CAP, order: { created_at: "ASC" } },
  })
  const queue = (lifecycles as RawLifecycle[]).filter((row) => !!row.order?.id)
  const orderIds = queue.map((row) => row.order!.id)

  if (!orderIds.length) {
    res.json({ delivery_orders: [], count: 0 })
    return
  }

  const [{ data: orders }, rows] = await Promise.all([
    query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "customer.first_name",
        "customer.last_name",
        "customer.phone",
        "shipping_address.first_name",
        "shipping_address.last_name",
        "shipping_address.phone",
        "shipping_address.address_1",
        "shipping_address.address_2",
        "shipping_address.city",
        "items.id",
        "items.title",
        "items.product_title",
        "items.variant_title",
        "items.quantity",
        "fulfillments.id",
        "fulfillments.shipped_at",
        "fulfillments.delivered_at",
        "fulfillments.canceled_at",
      ],
      filters: { id: orderIds },
      pagination: { skip: 0, take: orderIds.length },
    }),
    loadRowOrders(query, orderService, orderIds),
  ])
  const byId = new Map((orders as RawOrder[]).map((order) => [order.id, order]))

  const deliveryOrders = queue
    .map((lifecycle) => {
      const order = byId.get(lifecycle.order!.id)
      if (!order) {
        return null
      }
      const row = rows.get(order.id) ?? null
      const address = order.shipping_address
      const live = (order.fulfillments ?? []).filter((f) => !f.canceled_at)
      return {
        order_id: order.id,
        display_id: order.display_id ?? null,
        order_number: lifecycle.number ?? null,
        delivery_date: lifecycle.delivery_date ?? null,
        delivery_window: lifecycle.delivery_window ?? null,
        customer_name:
          fullName(address?.first_name, address?.last_name) ??
          fullName(order.customer?.first_name, order.customer?.last_name),
        // Звонить на точке — по номеру получателя, иначе по номеру покупателя.
        phone: address?.phone?.trim() || order.customer?.phone?.trim() || null,
        address:
          [address?.city, address?.address_1, address?.address_2]
            .filter((part) => !!part?.trim())
            .join(", ") || null,
        items: (order.items ?? []).map((item) => ({
          id: item.id,
          title: item.product_title ?? item.title ?? null,
          variant_title:
            item.variant_title && item.variant_title !== "Default variant"
              ? item.variant_title
              : null,
          quantity: numericAmount(item.quantity) ?? 0,
        })),
        total: row?.total ?? null,
        currency_code: row?.currency_code ?? null,
        payment_state: row?.payment_state ?? null,
        payment_method: row?.payment_method ?? null,
        // Отгружено, но не вручено — под этот fulfillment и идёт вручение.
        deliver_fulfillment_id:
          live.find((f) => f.shipped_at && !f.delivered_at)?.id ??
          live.find((f) => !f.delivered_at)?.id ??
          null,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => !!entry)
    // Ближайший слот — сверху; заказ без слота — в конце.
    .sort((a, b) =>
      (a.delivery_date ?? "9999").localeCompare(b.delivery_date ?? "9999")
    )

  res.json({ delivery_orders: deliveryOrders, count: deliveryOrders.length })
}
