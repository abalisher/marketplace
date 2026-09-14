import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { LOGISTICS_MODULE } from "../../modules/logistics"
import LogisticsModuleService from "../../modules/logistics/service"
import { TripStopType } from "../../modules/logistics/models/constants"

export type AddTripStopStepInput = {
  trip_id: string
  order_id: string
  type?: TripStopType
  sequence?: number
  address_snapshot?: Record<string, unknown> | null
}

// Добавление точки в рейс с компенсацией-удалением при откате workflow.
export const addTripStopStep = createStep(
  "add-trip-stop",
  async (input: AddTripStopStepInput, { container }) => {
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    const stop = await service.addStop(input)
    return new StepResponse(stop, stop.id)
  },
  async (stopId, { container }) => {
    if (!stopId) {
      return
    }
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    await service.deleteTripStops(stopId)
  }
)
