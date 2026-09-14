import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { LOGISTICS_MODULE } from "../../modules/logistics"
import LogisticsModuleService from "../../modules/logistics/service"

export type CreateTripStepInput = {
  driver_id: string
  location_id: string
  note?: string | null
}

// Создание рейса (planned) с компенсацией-удалением при откате workflow.
export const createTripStep = createStep(
  "create-trip",
  async (input: CreateTripStepInput, { container }) => {
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    const trip = await service.createTrip(input)
    return new StepResponse(trip, trip.id)
  },
  async (tripId, { container }) => {
    if (!tripId) {
      return
    }
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    await service.deleteTrips(tripId)
  }
)
