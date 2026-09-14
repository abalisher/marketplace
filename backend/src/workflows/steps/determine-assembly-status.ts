import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { determineAssemblyStatus } from "../../lib/orders/assembly-status"

export type DetermineAssemblyStatusStepInput = {
  order_id: string
}

// Наш статус сборки ПОСЛЕ операции ядра. Само правило — общее с догоном за
// ядром, поэтому живёт в lib/orders/assembly-status.
export const determineAssemblyStatusStep = createStep(
  "determine-assembly-status",
  async (input: DetermineAssemblyStatusStepInput, { container }) => {
    const to = await determineAssemblyStatus(container, input.order_id)

    return new StepResponse({ to })
  }
)
