import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { PHONE_AUTH_PROVIDER } from "../../modules/auth-phone"

export type VerifyPhoneOtpStepInput = {
  /** Номер в каноне +7XXXXXXXXXX. */
  phone: string
  /** Код, который ввёл покупатель. */
  code: string
}

export type PhoneOtpFailureReason =
  | "invalid_code"
  | "code_expired"
  | "too_many_attempts"

export type VerifyPhoneOtpStepOutput = {
  ok: boolean
  reason: PhoneOtpFailureReason | null
  auth_identity_id: string | null
  /** Покупатель, уже связанный с номером (или найденный по номеру). */
  customer_id: string | null
  /** Заполнен, если покупателя нашли по номеру, но связи с учёткой ещё нет. */
  link_customer_id: string | null
}

const FAILURES: Record<string, PhoneOtpFailureReason> = {
  code_expired: "code_expired",
  too_many_attempts: "too_many_attempts",
}

// Проверка кода входа через провайдер `phone` auth-модуля. Шаг НЕ бросает
// исключение на неверный код: причина возвращается наружу, чтобы роут ответил
// понятным клиенту статусом (401 / 429), а не общей 500.
export const verifyPhoneOtpStep = createStep(
  "verify-phone-otp",
  async (
    input: VerifyPhoneOtpStepInput,
    { container }
  ): Promise<StepResponse<VerifyPhoneOtpStepOutput>> => {
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
        customer_id: null,
        link_customer_id: null,
      })
    }

    const linkedCustomerId =
      (authIdentity.app_metadata?.customer_id as string | undefined) ?? null
    if (linkedCustomerId) {
      return new StepResponse({
        ok: true,
        reason: null,
        auth_identity_id: authIdentity.id,
        customer_id: linkedCustomerId,
        link_customer_id: null,
      })
    }

    // Учётка могла быть заведена раньше (email/панель) с тем же номером —
    // владение номером подтверждено кодом, поэтому связываем, а не дублируем.
    // Фильтр по телефону поддерживает только graph-запрос (в FilterableCustomer
    // поля phone нет), поэтому идём через ядровый query.
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: existing } = await query.graph({
      entity: "customer",
      fields: ["id"],
      filters: { phone: input.phone, has_account: true },
      pagination: { take: 1 },
    })
    const existingId = (existing[0]?.id as string | undefined) ?? null

    return new StepResponse({
      ok: true,
      reason: null,
      auth_identity_id: authIdentity.id,
      customer_id: existingId,
      link_customer_id: existingId,
    })
  }
)
