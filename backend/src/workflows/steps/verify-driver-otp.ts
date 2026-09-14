import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { PHONE_AUTH_PROVIDER } from "../../modules/auth-phone"

export type VerifyDriverOtpStepInput = {
  /** Номер в каноне +7XXXXXXXXXX. */
  phone: string
  /** Код, который ввёл водитель. */
  code: string
}

export type DriverOtpFailureReason =
  | "invalid_code"
  | "code_expired"
  | "too_many_attempts"

export type VerifyDriverOtpStepOutput = {
  ok: boolean
  reason: DriverOtpFailureReason | null
  auth_identity_id: string | null
  /** Профиль водителя, уже связанный с этой учётной сущностью. */
  driver_id: string | null
}

const FAILURES: Record<string, DriverOtpFailureReason> = {
  code_expired: "code_expired",
  too_many_attempts: "too_many_attempts",
}

// Проверка кода входа водителя через провайдер `phone` auth-модуля — тот же
// код и та же учётная сущность, что у покупателя (номер телефона един для
// человека), но actor_type у сессии свой: `driver`. Шаг НЕ бросает исключение
// на неверный код — причина уходит наружу, чтобы роут ответил 401/429, а не
// общей 500 (идиома verify-phone-otp покупателя).
export const verifyDriverOtpStep = createStep(
  "verify-driver-otp",
  async (
    input: VerifyDriverOtpStepInput,
    { container }
  ): Promise<StepResponse<VerifyDriverOtpStepOutput>> => {
    const authService = container.resolve(Modules.AUTH)
    const { success, authIdentity, error } = await authService.authenticate(
      PHONE_AUTH_PROVIDER,
      {
        url: "",
        headers: {},
        query: {},
        body: { phone: input.phone, code: input.code },
        protocol: "https",
      }
    )

    if (!success || !authIdentity) {
      return new StepResponse({
        ok: false,
        reason: FAILURES[error ?? ""] ?? "invalid_code",
        auth_identity_id: null,
        driver_id: null,
      })
    }

    return new StepResponse({
      ok: true,
      reason: null,
      auth_identity_id: authIdentity.id,
      // Ключ app_metadata по actor_type: у одного человека рядом могут лежать
      // и customer_id (он же покупатель), и driver_id — это одна учётка.
      driver_id: (authIdentity.app_metadata?.driver_id as string) ?? null,
    })
  }
)
