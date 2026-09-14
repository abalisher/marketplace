import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { LOGISTICS_MODULE } from "../../modules/logistics"
import LogisticsModuleService from "../../modules/logistics/service"
import { TripStatus } from "../../modules/logistics/models/constants"

export type SetTripStatusStepInput = {
  id: string
  status: TripStatus
}

// Снимок прежнего состояния рейса для отката (статус + временные метки, которые
// setTripStatus проставляет при выходе в путь/завершении).
type TripStatusCompensation = {
  id: string
  status: TripStatus
  started_at: Date | null
  finished_at: Date | null
}

// Перевод рейса по стейт-машине (инвариант — assertTripTransition в сервисе).
// Компенсация возвращает прежний статус и метки.
export const setTripStatusStep = createStep(
  "set-trip-status",
  async (input: SetTripStatusStepInput, { container }) => {
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    const before = await service.retrieveTrip(input.id)
    const compensation: TripStatusCompensation = {
      id: before.id,
      status: before.status as TripStatus,
      started_at: before.started_at,
      finished_at: before.finished_at,
    }
    const trip = await service.setTripStatus(input)
    return new StepResponse(trip, compensation)
  },
  async (comp, { container }) => {
    if (!comp) {
      return
    }
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    await service.updateTrips({
      id: comp.id,
      status: comp.status,
      started_at: comp.started_at,
      finished_at: comp.finished_at,
    })
  }
)
