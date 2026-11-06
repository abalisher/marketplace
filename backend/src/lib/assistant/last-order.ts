import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type OrderRow = { id: string; customer_id?: string | null }

// Заказ, о котором идёт речь в ходе (track_order, документы, претензия).
//
// Гость предъявляет заказ только токеном `order_id`, который ему вернул
// place_order (внутренний id случаен — владение им = право смотреть). Вошедший
// покупатель — владелец своих заказов: чужой токен ему не засчитываем, а без
// токена (новый диалог, другое устройство) берём его последний заказ на этой
// витрине. Иначе ассистент в новом чате честно не находил заказ и отвечал
// «у вас нет заказов».
export const resolveLastOrderId = async (
  container: MedusaContainer,
  input: {
    lastOrderId?: string
    customerId?: string
    salesChannelId?: string
  }
): Promise<string | undefined> => {
  if (!input.customerId) {
    return input.lastOrderId
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  if (input.lastOrderId) {
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "customer_id"],
      filters: { id: input.lastOrderId },
    })
    const order = (data as OrderRow[])[0]
    if (order?.customer_id === input.customerId) {
      return order.id
    }
  }

  const { data } = await query.graph({
    entity: "order",
    fields: ["id", "customer_id"],
    filters: {
      customer_id: input.customerId,
      ...(input.salesChannelId ? { sales_channel_id: input.salesChannelId } : {}),
    },
    pagination: { take: 1, order: { created_at: "DESC" } },
  })
  return (data as OrderRow[])[0]?.id
}
