import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  generateJwtToken,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { CustomerDTO } from "@medusajs/framework/types"

export type IssueCustomerSessionStepInput = {
  customer_id: string
  auth_identity_id: string
}

export type IssueCustomerSessionStepOutput = {
  /** Bearer-токен сессии покупателя (тот же формат, что у ядровых роутов /auth). */
  token: string
  customer: CustomerDTO
}

// Выдача сессионного токена покупателю после подтверждённого входа. Полезная
// нагрузка повторяет auth-context ядра (actor_id / actor_type /
// auth_identity_id / app_metadata) — токен принимается штатным middleware
// `authenticate("customer", ["session", "bearer"])`.
export const issueCustomerSessionStep = createStep(
  "issue-customer-session",
  async (
    input: IssueCustomerSessionStepInput,
    { container }
  ): Promise<StepResponse<IssueCustomerSessionStepOutput>> => {
    const { http } = container.resolve(
      ContainerRegistrationKeys.CONFIG_MODULE
    ).projectConfig

    if (!http?.jwtSecret) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "JWT_SECRET не задан — выдать сессию покупателю нельзя"
      )
    }

    const customerService = container.resolve(Modules.CUSTOMER)
    const customer = await customerService.retrieveCustomer(input.customer_id)

    const token = generateJwtToken(
      {
        actor_id: customer.id,
        actor_type: "customer",
        auth_identity_id: input.auth_identity_id,
        app_metadata: { customer_id: customer.id },
      },
      {
        secret: http.jwtSecret,
        expiresIn: http.jwtExpiresIn ?? "1d",
        jwtOptions: http.jwtOptions,
      }
    )

    return new StepResponse({ token, customer })
  }
)
