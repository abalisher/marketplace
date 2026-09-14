import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { PHONE_AUTH_PROVIDER } from "../../modules/auth-phone"
import { resolvePhoneOtpConfig } from "../../modules/auth-phone/config"
import { maskPhone } from "../../modules/auth-phone/normalize-phone"
import {
  buildOtpState,
  generateOtpCode,
  PhoneOtpState,
  resendDelaySeconds,
} from "../../modules/auth-phone/otp"

export type IssuePhoneOtpStepInput = {
  /** Номер в каноне +7XXXXXXXXXX. */
  phone: string
}

export type IssuePhoneOtpStepOutput = {
  /** `throttled` — код запросили раньше, чем истекла пауза «выслать снова». */
  status: "sent" | "throttled"
  /** Сколько секунд живёт выданный код (0 при throttled). */
  expires_in: number
  /** Через сколько секунд можно запросить код заново. */
  resend_after: number
  /** Код открытым текстом — только dev-канал (SMS-провайдера на MVP нет). */
  dev_code: string | null
}

// Выдача одноразового кода на номер. Провайдер-идентичность (`provider=phone`,
// `entity_id`=номер) создаётся при первом запросе — так вход и регистрация
// покупателя это один и тот же путь. Код в базе лежит хешем; открытым текстом
// он живёт только в dev-канале (лог + ответ API), пока нет SMS-провайдера.
export const issuePhoneOtpStep = createStep(
  "issue-phone-otp",
  async (
    input: IssuePhoneOtpStepInput,
    { container }
  ): Promise<StepResponse<IssuePhoneOtpStepOutput>> => {
    const authService = container.resolve(Modules.AUTH)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const config = resolvePhoneOtpConfig()
    const now = new Date()

    const [providerIdentity] = await authService.listProviderIdentities({
      provider: PHONE_AUTH_PROVIDER,
      entity_id: input.phone,
    })

    const state = (providerIdentity?.provider_metadata ?? {}) as PhoneOtpState
    const delay = resendDelaySeconds(state, config.resendSeconds, now)
    if (delay > 0) {
      return new StepResponse({
        status: "throttled" as const,
        expires_in: 0,
        resend_after: delay,
        dev_code: null,
      })
    }

    const code = generateOtpCode(config.codeLength)
    const nextState = buildOtpState(input.phone, code, now, {
      ttlSeconds: config.ttlSeconds,
      devChannel: config.devChannel,
    })

    if (providerIdentity) {
      await authService.updateProviderIdentities([
        {
          id: providerIdentity.id,
          provider_metadata: nextState as Record<string, unknown>,
        },
      ])
    } else {
      await authService.createAuthIdentities([
        {
          provider_identities: [
            {
              provider: PHONE_AUTH_PROVIDER,
              entity_id: input.phone,
              provider_metadata: nextState as Record<string, unknown>,
            },
          ],
        },
      ])
    }

    // Канал доставки кода: на стенде — лог и ответ API, в проде будет SMS.
    logger.info(
      config.devChannel
        ? `[auth-phone] код входа для ${maskPhone(input.phone)}: ${code}`
        : `[auth-phone] код входа отправлен на ${maskPhone(input.phone)}`
    )

    return new StepResponse({
      status: "sent" as const,
      expires_in: config.ttlSeconds,
      resend_after: config.resendSeconds,
      dev_code: config.devChannel ? code : null,
    })
  }
)
