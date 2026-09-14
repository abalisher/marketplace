import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ORDER_LIFECYCLE_MODULE } from "../../modules/order-lifecycle"
import OrderLifecycleModuleService from "../../modules/order-lifecycle/service"
import {
  DeliveryMethod,
  DeliveryWindow,
} from "../../modules/order-lifecycle/models/statuses"

export type CreateOrderLifecycleStepInput = {
  // Способ получения фиксируется при создании и дальше не меняется —
  // от него зависит карта переходов стейт-машины (см. сервис модуля).
  delivery_method?: DeliveryMethod
  // Слот доставки, выбранный покупателем при оформлении (T5.6): дата в
  // астанинских сутках + окно приезда. Снимается с корзины отдельным шагом —
  // заказ создаёт ядро, и наших полей оно не знает. null — заказ без слота
  // (оформление до появления слотов или вход, который его не собирает).
  delivery_date?: string | null
  delivery_window?: DeliveryWindow | null
}

// Создаёт запись жизненного цикла заказа в стартовом статусе `new` (source of
// truth этапов ТЗ). Привязка к order ядра — отдельным шагом createRemoteLink
// в workflow place-order. Компенсация — удаление созданной записи.
export const createOrderLifecycleStep = createStep(
  "create-order-lifecycle",
  async (input: CreateOrderLifecycleStepInput, { container }) => {
    const service =
      container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
    const lifecycle = await service.createOrderLifecycles({
      delivery_method: input.delivery_method ?? "delivery",
      delivery_date: input.delivery_date ?? null,
      delivery_window: input.delivery_window ?? null,
    })

    return new StepResponse(lifecycle, lifecycle.id)
  },
  async (lifecycleId, { container }) => {
    if (!lifecycleId) {
      return
    }
    const service =
      container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
    await service.deleteOrderLifecycles(lifecycleId)
  }
)
