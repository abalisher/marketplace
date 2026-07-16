import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

export type GetOrderItemsStepInput = {
  order_id: string
}

// Отдаёт позиции заказа в форме, которую ждут ядровые fulfillment-workflows
// ({id, quantity}). Читаем через сервис order: query.graph не отдаёт надёжно
// BigNumber-количества позиций (см. determine-assembly-status).
export const getOrderItemsStep = createStep(
  "get-order-items",
  async (input: GetOrderItemsStepInput, { container }) => {
    const orderService = container.resolve(Modules.ORDER)
    const order = await orderService.retrieveOrder(input.order_id, {
      relations: ["items"],
    })

    const items = (order.items ?? []).map((item) => ({
      id: item.id,
      quantity: Number(item.quantity),
    }))

    return new StepResponse({ items })
  }
)
