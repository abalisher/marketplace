import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ORDER_LIFECYCLE_MODULE } from "../../modules/order-lifecycle"
import OrderLifecycleModuleService from "../../modules/order-lifecycle/service"

// Создаёт запись жизненного цикла заказа в стартовом статусе `new` (source of
// truth этапов ТЗ). Привязка к order ядра — отдельным шагом createRemoteLink
// в workflow place-order. Компенсация — удаление созданной записи.
export const createOrderLifecycleStep = createStep(
  "create-order-lifecycle",
  async (_input: void, { container }) => {
    const service =
      container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
    const lifecycle = await service.createOrderLifecycles({})

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
