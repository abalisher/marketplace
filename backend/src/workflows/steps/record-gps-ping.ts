import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { LOGISTICS_MODULE } from "../../modules/logistics"
import LogisticsModuleService from "../../modules/logistics/service"

export type RecordGpsPingStepInput = {
  trip_id: string
  driver_id: string
  lat: number
  lng: number
}

// Приём GPS-пинга (append в поток) с компенсацией-удалением. Пинги — поток,
// откат единичного пинга безвреден; workflow ради правила «мутация только в
// workflow» (no-service-mutations-in-api-route).
export const recordGpsPingStep = createStep(
  "record-gps-ping",
  async (input: RecordGpsPingStepInput, { container }) => {
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    const ping = await service.recordGpsPing(input)
    return new StepResponse(ping, ping.id)
  },
  async (pingId, { container }) => {
    if (!pingId) {
      return
    }
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    await service.deleteGpsPings(pingId)
  }
)
