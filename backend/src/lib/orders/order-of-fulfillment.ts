import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Заказ, которому принадлежит fulfillment. Ядровые события отгрузки и вручения
// (shipment.created / delivery.created) несут ТОЛЬКО id fulfillment'а — заказа
// в payload нет. Fulfillment живёт в своём модуле и связан с заказом ссылкой,
// поэтому идём по link-сущности order_fulfillment (не по сервису модуля order).
export const findOrderIdByFulfillment = async (
  container: MedusaContainer,
  fulfillmentId: string
): Promise<string | null> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "order_fulfillment",
    fields: ["order_id"],
    filters: { fulfillment_id: fulfillmentId },
  })

  return (data?.[0] as { order_id?: string } | undefined)?.order_id ?? null
}
