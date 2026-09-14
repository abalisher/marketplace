import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { DRIVER_MODULE } from "../../modules/driver"
import DriverModuleService from "../../modules/driver/service"

export type RegisterDriverStepInput = {
  /** Номер в каноне +7XXXXXXXXXX — ключ профиля водителя. */
  phone: string
}

export type RegisterDriverStepOutput = {
  driver_id: string
  /** true — профиль завёл этот вход (заявка новая). */
  created: boolean
}

// Самрегистрация водителя: профиль по номеру завёлся или уже был (заявку могли
// подать раньше — например, водитель вошёл, но связь с учётной сущностью
// потерялась). Компенсация удаляет ТОЛЬКО профиль, созданный этим шагом:
// существующую заявку откат чужого шага сносить не должен.
export const registerDriverStep = createStep(
  "register-driver",
  async (input: RegisterDriverStepInput, { container }) => {
    const service = container.resolve<DriverModuleService>(DRIVER_MODULE)

    const existing = await service.findByPhone(input.phone)
    if (existing) {
      return new StepResponse<RegisterDriverStepOutput, string | null>(
        { driver_id: existing.id, created: false },
        null
      )
    }

    const driver = await service.registerDriver({ phone: input.phone })
    return new StepResponse<RegisterDriverStepOutput, string | null>(
      { driver_id: driver.id, created: true },
      driver.id
    )
  },
  async (driverId, { container }) => {
    if (!driverId) {
      return
    }
    const service = container.resolve<DriverModuleService>(DRIVER_MODULE)
    await service.deleteDrivers(driverId)
  }
)
