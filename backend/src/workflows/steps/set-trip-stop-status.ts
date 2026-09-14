import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { LOGISTICS_MODULE } from "../../modules/logistics"
import LogisticsModuleService from "../../modules/logistics/service"
import {
  TripStopStatus,
  TripStopType,
} from "../../modules/logistics/models/constants"

export type SetTripStopStatusStepInput = {
  id: string
  status: TripStopStatus
  proof?: Record<string, unknown> | null
  checklist?: Record<string, unknown> | null
  note?: string | null
}

// Результат шага: обновлённая точка + её order_id/type — workflow по ним решает,
// триггерить ли deliver-order (delivery-точка выдана).
export type SetTripStopStatusStepResult = {
  id: string
  order_id: string
  type: TripStopType
  status: TripStopStatus
}

// Снимок прежних полей точки для отката.
type StopStatusCompensation = {
  id: string
  status: TripStopStatus
  proof: Record<string, unknown> | null
  checklist: Record<string, unknown> | null
  note: string | null
}

// Перевод точки по стейт-машине + proof/checklist (инвариант —
// assertTripStopTransition в сервисе). Компенсация возвращает прежние поля.
export const setTripStopStatusStep = createStep(
  "set-trip-stop-status",
  async (input: SetTripStopStatusStepInput, { container }) => {
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    const before = await service.retrieveTripStop(input.id)
    const compensation: StopStatusCompensation = {
      id: before.id,
      status: before.status as TripStopStatus,
      proof: before.proof,
      checklist: before.checklist,
      note: before.note,
    }
    const stop = await service.setStopStatus(input)
    const result: SetTripStopStatusStepResult = {
      id: stop.id,
      order_id: stop.order_id,
      type: stop.type as TripStopType,
      status: stop.status as TripStopStatus,
    }
    return new StepResponse(result, compensation)
  },
  async (comp, { container }) => {
    if (!comp) {
      return
    }
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    await service.updateTripStops({
      id: comp.id,
      status: comp.status,
      proof: comp.proof,
      checklist: comp.checklist,
      note: comp.note,
    })
  }
)
