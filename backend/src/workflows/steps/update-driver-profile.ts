import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { DRIVER_MODULE } from "../../modules/driver"
import DriverModuleService from "../../modules/driver/service"
import { DriverRecord } from "../../modules/driver/types"

export type UpdateDriverProfileStepInput = {
  driver_id: string
  full_name?: string | null
  vehicle_model?: string | null
  vehicle_plate?: string | null
  capacity_kg?: number | null
}

type Compensation = {
  id: string
  full_name: string | null
  vehicle_model: string | null
  vehicle_plate: string | null
  capacity_kg: number | null
}

// Водитель правит свой профиль (ФИО, машина, грузоподъёмность). Компенсация
// возвращает прежние значения — идиома start-assembly-task.
export const updateDriverProfileStep = createStep(
  "update-driver-profile",
  async (input: UpdateDriverProfileStepInput, { container }) => {
    const service = container.resolve<DriverModuleService>(DRIVER_MODULE)

    const before = await service.retrieveDriver(input.driver_id)
    const driver = (await service.updateProfile({
      id: input.driver_id,
      full_name: input.full_name,
      vehicle_model: input.vehicle_model,
      vehicle_plate: input.vehicle_plate,
      capacity_kg: input.capacity_kg,
    })) as DriverRecord

    return new StepResponse<DriverRecord, Compensation>(driver, {
      id: before.id,
      full_name: before.full_name ?? null,
      vehicle_model: before.vehicle_model ?? null,
      vehicle_plate: before.vehicle_plate ?? null,
      capacity_kg: before.capacity_kg ?? null,
    })
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    const service = container.resolve<DriverModuleService>(DRIVER_MODULE)
    await service.updateDrivers(compensation)
  }
)
