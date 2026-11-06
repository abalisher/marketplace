import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { ASSEMBLY_MODULE } from "../../modules/assembly"
import AssemblyModuleService from "../../modules/assembly/service"
import { OrderStatusValue } from "../../modules/order-lifecycle/models/statuses"

export type CheckOrderReadyForAssemblyStepInput = { task_id: string }

// Статусы заказа, в которых сборщик может взять задание: продавец подтвердил,
// сборка ещё идёт.
const READY: OrderStatusValue[] = ["confirmed", "assembling", "partially_assembled"]

// Сборщик берёт задание только по подтверждённому заказу: подтверждение — за
// продавцом, а отменённый или уже уехавший заказ собирать нечего. Шаг только
// читает — откатывать нечего.
export const checkOrderReadyForAssemblyStep = createStep(
  "check-order-ready-for-assembly",
  async (input: CheckOrderReadyForAssemblyStepInput, { container }) => {
    const task = await container
      .resolve<AssemblyModuleService>(ASSEMBLY_MODULE)
      .retrieveAssemblyTask(input.task_id)

    const { data } = await container
      .resolve(ContainerRegistrationKeys.QUERY)
      .graph({
        entity: "order",
        fields: ["id", "order_lifecycle.status"],
        filters: { id: task.order_id },
      })
    const status = (
      data[0] as { order_lifecycle?: { status?: OrderStatusValue } | null } | undefined
    )?.order_lifecycle?.status

    if (status === "new") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Заказ ещё не подтверждён продавцом — собирать его рано."
      )
    }
    if (!status || !READY.includes(status)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Заказ не в сборке: он отменён или уже собран."
      )
    }

    return new StepResponse({ order_id: task.order_id, status })
  }
)
