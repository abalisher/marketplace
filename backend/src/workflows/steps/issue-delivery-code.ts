import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ORDER_LIFECYCLE_MODULE } from "../../modules/order-lifecycle"
import { generateDeliveryCode } from "../../modules/order-lifecycle/delivery-code"
import OrderLifecycleModuleService from "../../modules/order-lifecycle/service"

export type IssueDeliveryCodeStepInput = {
  order_lifecycle_id: string
}

// Выдаёт код получения при переходе заказа в доставку: 6 цифр, хранится в
// lifecycle.delivery_code. Код видит только покупатель (ЛК; SMS — модуль
// уведомлений позже), водитель вводит его со слов покупателя при вручении —
// проверка в recordTransition (assertDeliveryConfirmation). Повторная отгрузка
// частями код не перевыпускает — он уже есть. Компенсация — вернуть прежний код.
export const issueDeliveryCodeStep = createStep(
  "issue-delivery-code",
  async (input: IssueDeliveryCodeStepInput, { container }) => {
    const service =
      container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)

    const lifecycle = await service.retrieveOrderLifecycle(
      input.order_lifecycle_id
    )
    if (lifecycle.delivery_code) {
      return new StepResponse({ delivery_code: lifecycle.delivery_code }, null)
    }

    const code = generateDeliveryCode()
    await service.updateOrderLifecycles({
      id: input.order_lifecycle_id,
      delivery_code: code,
    })

    return new StepResponse(
      { delivery_code: code },
      { order_lifecycle_id: input.order_lifecycle_id }
    )
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    const service =
      container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
    await service.updateOrderLifecycles({
      id: compensation.order_lifecycle_id,
      delivery_code: null,
    })
  }
)
