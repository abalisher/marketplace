import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { nextOrderNumber, PLATFORM_ORDER_PREFIX } from "../../lib/orders/order-number"
import { resolveStoreTenant } from "../../lib/tenants/storefront"
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
  // Канал продаж заказа: продавец компании видит в панели только свой канал.
  sales_channel_id?: string | null
}

// Создаёт запись жизненного цикла заказа в стартовом статусе `new` (source of
// truth этапов ТЗ) и выдаёт заказу номер для людей — «ORG-26-0007» по коду
// компании канала (заказ площадки — SM). Привязка к order ядра — отдельным шагом createRemoteLink
// в workflow place-order. Компенсация — удаление созданной записи.
export const createOrderLifecycleStep = createStep(
  "create-order-lifecycle",
  async (input: CreateOrderLifecycleStepInput, { container }) => {
    const service =
      container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
    const tenant = await resolveStoreTenant(container, input.sales_channel_id ?? undefined)
    const number = await nextOrderNumber(
      container,
      (tenant as { order_prefix?: string | null } | null)?.order_prefix ||
        PLATFORM_ORDER_PREFIX
    )
    const lifecycle = await service.createOrderLifecycles({
      number,
      delivery_method: input.delivery_method ?? "delivery",
      delivery_date: input.delivery_date ?? null,
      delivery_window: input.delivery_window ?? null,
      sales_channel_id: input.sales_channel_id ?? null,
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
