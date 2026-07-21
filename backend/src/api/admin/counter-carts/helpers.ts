import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"

// Хелперы admin-роутов POS-корзины. Роуты /admin/counter-carts работают ТОЛЬКО
// с корзинами, созданными через create-counter-cart (metadata.counter) —
// покупательская корзина через них недоступна (404, как чужой ресурс в store).

const num = (value: unknown) => Number(value ?? 0)

// Вид POS-корзины для partner-клиента: позиции + тоталы + платёжные сессии.
// Тоталы — из query.graph (total учитывает кредитные линии только вместе с
// credit_lines.amount — эмпирика 2.17.2); позиции — через сервис cart:
// query.graph не отдаёт BigNumber-поля позиций (quantity/unit_price) —
// та же эмпирика, что у позиций заказа (см. get-order-items).
export async function retrieveCounterCart(
  scope: MedusaContainer,
  cartId: string
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: carts } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "email",
      "currency_code",
      "region_id",
      "sales_channel_id",
      "metadata",
      "completed_at",
      "created_at",
      "total",
      "subtotal",
      "item_total",
      "shipping_total",
      "credit_lines.id",
      "credit_lines.amount",
      "shipping_methods.id",
      "shipping_methods.name",
      "payment_collection.id",
      "payment_collection.payment_sessions.id",
      "payment_collection.payment_sessions.provider_id",
      "payment_collection.payment_sessions.status",
    ],
    filters: { id: cartId },
  })

  const cart = carts[0] as
    | {
        id: string
        email: string | null
        currency_code: string
        region_id: string | null
        sales_channel_id: string | null
        metadata?: Record<string, unknown> | null
        completed_at: string | null
        created_at: string
        total: unknown
        subtotal: unknown
        item_total: unknown
        shipping_total: unknown
        credit_lines?: { id: string; amount: unknown }[] | null
        shipping_methods?: { id: string; name: string }[] | null
        payment_collection?: {
          id: string
          payment_sessions?: {
            id: string
            provider_id: string
            status: string
          }[]
        } | null
      }
    | undefined

  if (!cart || cart.metadata?.counter !== true) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `POS cart ${cartId} not found`
    )
  }

  const cartService = scope.resolve(Modules.CART)
  const withItems = await cartService.retrieveCart(cartId, {
    relations: ["items"],
  })

  return {
    id: cart.id,
    email: cart.email,
    currency_code: cart.currency_code,
    region_id: cart.region_id,
    sales_channel_id: cart.sales_channel_id,
    metadata: cart.metadata ?? {},
    completed_at: cart.completed_at,
    created_at: cart.created_at,
    items: (withItems.items ?? []).map((item) => ({
      id: item.id,
      variant_id: item.variant_id ?? null,
      product_id: item.product_id ?? null,
      title: item.title,
      product_title: item.product_title ?? null,
      variant_title: item.variant_title ?? null,
      thumbnail: item.thumbnail ?? null,
      quantity: num(item.quantity),
      unit_price: num(item.unit_price),
    })),
    subtotal: num(cart.subtotal),
    item_total: num(cart.item_total),
    shipping_total: num(cart.shipping_total),
    total: num(cart.total),
    credit_lines: (cart.credit_lines ?? []).map((line) => ({
      id: line.id,
      amount: num(line.amount),
    })),
    shipping_methods: (cart.shipping_methods ?? []).map((method) => ({
      id: method.id,
      name: method.name,
    })),
    payment_collection_id: cart.payment_collection?.id ?? null,
    payment_sessions: (cart.payment_collection?.payment_sessions ?? []).map(
      (session) => ({
        id: session.id,
        provider_id: session.provider_id,
        status: session.status,
      })
    ),
  }
}
