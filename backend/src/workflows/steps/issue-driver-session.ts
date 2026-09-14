import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  generateJwtToken,
  MedusaError,
} from "@medusajs/framework/utils"
import { DRIVER_MODULE } from "../../modules/driver"
import DriverModuleService from "../../modules/driver/service"
import { DriverRecord } from "../../modules/driver/types"

export type IssueDriverSessionStepInput = {
  driver_id: string
  auth_identity_id: string
}

export type IssueDriverSessionStepOutput = {
  /** Bearer-токен сессии водителя (формат ядровых токенов /auth). */
  token: string
  driver: DriverRecord
}

// Выдача сессионного токена водителю после подтверждённого кода. Полезная
// нагрузка повторяет auth-context ядра, но с СВОИМ actor_type — `driver`:
// такой токен принимает штатный middleware `authenticate("driver", ["bearer"])`
// и НЕ принимает ни `/store/*` (customer), ни `/admin/*` (user). Идиома
// issue-customer-session.
export const issueDriverSessionStep = createStep(
  "issue-driver-session",
  async (
    input: IssueDriverSessionStepInput,
    { container }
  ): Promise<StepResponse<IssueDriverSessionStepOutput>> => {
    const { http } = container.resolve(
      ContainerRegistrationKeys.CONFIG_MODULE
    ).projectConfig

    if (!http?.jwtSecret) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "JWT_SECRET не задан — выдать сессию водителю нельзя"
      )
    }

    const service = container.resolve<DriverModuleService>(DRIVER_MODULE)
    const driver = await service.retrieveDriver(input.driver_id)

    const token = generateJwtToken(
      {
        actor_id: driver.id,
        actor_type: "driver",
        auth_identity_id: input.auth_identity_id,
        app_metadata: { driver_id: driver.id },
      },
      {
        secret: http.jwtSecret,
        expiresIn: http.jwtExpiresIn ?? "1d",
        jwtOptions: http.jwtOptions,
      }
    )

    return new StepResponse({ token, driver })
  }
)
