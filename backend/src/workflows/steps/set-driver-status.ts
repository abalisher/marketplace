import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { DRIVER_MODULE } from "../../modules/driver"
import DriverModuleService from "../../modules/driver/service"
import { DriverStatus } from "../../modules/driver/models/constants"
import { DriverRecord } from "../../modules/driver/types"

export type SetDriverStatusStepInput = {
  driver_id: string
  status: DriverStatus
  note?: string | null
  /** user_id продавца, закрывшего заявку. */
  actor_id?: string | null
}

type Compensation = {
  id: string
  status: DriverStatus
  status_note: string | null
  status_changed_at: Date | null
  status_changed_by: string | null
}

export type SetDriverStatusStepOutput = {
  driver: DriverRecord
  /** Статус до правки — уходит в событие driver.status_changed. */
  from: DriverStatus
}

// Продавец меняет допуск водителя (заявка принята / отказ / блокировка).
// Инварианты перехода и «нельзя допустить незаполненный профиль» — в сервисе
// модуля; компенсация возвращает прежний допуск.
export const setDriverStatusStep = createStep(
  "set-driver-status",
  async (input: SetDriverStatusStepInput, { container }) => {
    const service = container.resolve<DriverModuleService>(DRIVER_MODULE)

    const before = await service.retrieveDriver(input.driver_id)
    const driver = (await service.setStatus({
      id: input.driver_id,
      status: input.status,
      note: input.note,
      actor_id: input.actor_id,
    })) as DriverRecord

    return new StepResponse<SetDriverStatusStepOutput, Compensation>(
      { driver, from: before.status as DriverStatus },
      {
        id: before.id,
        status: before.status as DriverStatus,
        status_note: before.status_note ?? null,
        status_changed_at: before.status_changed_at ?? null,
        status_changed_by: before.status_changed_by ?? null,
      }
    )
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    const service = container.resolve<DriverModuleService>(DRIVER_MODULE)
    await service.updateDrivers(compensation)
  }
)
