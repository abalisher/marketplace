import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

export type ResolveOrderCustomerStepInput = {
  order_id: string
}

type OrderRow = {
  id: string
  customer_id?: string | null
}

// Покупатель заказа по его id — для действий оператора, у которых покупателя
// нет во входе (претензия по звонку, T4.11: оператор знает только заказ).
// Несуществующий заказ → 404, заказ без покупателя → 400: претензию не к кому
// привязать, а выдуманный customer_id разорвал бы историю обращений.
//
// Это НЕ гейт принадлежности (require-own-order): там покупатель известен и
// проверяется, здесь — вычисляется. Оператор действует от лица магазина.
export const resolveOrderCustomerStep = createStep(
  "resolve-order-customer",
  async (input: ResolveOrderCustomerStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "customer_id"],
      filters: { id: input.order_id },
    })

    const order = (data as OrderRow[])[0]
    if (!order) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Order ${input.order_id} not found`
      )
    }
    if (!order.customer_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Order ${input.order_id} has no customer`
      )
    }

    return new StepResponse({ customer_id: order.customer_id })
  }
)
