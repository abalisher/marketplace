import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { OrderStatusValue } from "../../modules/order-lifecycle/models/statuses"

export type DetermineAssemblyStatusStepInput = {
  order_id: string
}

// Наш статус сборки — производная от факта fulfillment'а ПОСЛЕ операции ядра:
// собрано всё заказанное → assembled, часть → partially_assembled.
// Вычисляемый order.fulfillment_status сервис/остальные пути не отдают надёжно
// (link-связь order ↔ fulfillment), поэтому считаем сами: суммарно заказано
// (сервис order, где доступно количество) против суммарно во fulfillment'ах
// (query.graph по link'у fulfillments; их количества — обычные int).
export const determineAssemblyStatusStep = createStep(
  "determine-assembly-status",
  async (input: DetermineAssemblyStatusStepInput, { container }) => {
    const orderService = container.resolve(Modules.ORDER)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const order = await orderService.retrieveOrder(input.order_id, {
      relations: ["items"],
    })
    const totalOrdered = (order.items ?? []).reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    )

    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "fulfillments.canceled_at", "fulfillments.items.quantity"],
      filters: { id: input.order_id },
    })
    const fulfillments =
      (
        orders[0] as {
          fulfillments?: {
            canceled_at: string | null
            items: { quantity: number }[]
          }[]
        }
      )?.fulfillments ?? []
    const totalFulfilled = fulfillments
      .filter((f) => !f.canceled_at)
      .reduce(
        (sum, f) =>
          sum + f.items.reduce((s, it) => s + Number(it.quantity), 0),
        0
      )

    const to: OrderStatusValue =
      totalFulfilled >= totalOrdered ? "assembled" : "partially_assembled"

    return new StepResponse({ to })
  }
)
