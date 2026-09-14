import {
  AuthenticationInput,
  AuthenticationResponse,
  AuthIdentityDTO,
  AuthIdentityProviderService,
  Logger,
} from "@medusajs/framework/types"
import { AbstractAuthModuleProvider, MedusaError } from "@medusajs/framework/utils"
import { PhoneOtpConfig, PhoneOtpOptions, resolvePhoneOtpConfig } from "./config"
import { normalizePhone } from "./normalize-phone"
import { PhoneOtpState, verifyOtpCode } from "./otp"

type InjectedDependencies = {
  logger: Logger
}

// Провайдер аутентификации «телефон + одноразовый код» (T10.7). Отвечает
// только за ПРОВЕРКУ кода: код выдаёт workflow `request-phone-otp` (у него есть
// доступ к CRUD auth-модуля), а регистрация покупателя — workflow
// `verify-phone-otp`. Поэтому `register`/`update` здесь закрыты: ядровые роуты
// /auth/customer/phone/register не должны выдавать токен по одному номеру.
class PhoneAuthProviderService extends AbstractAuthModuleProvider {
  static identifier = "phone"
  static DISPLAY_NAME = "Телефон и код из SMS"

  protected readonly logger_: Logger
  protected readonly config_: PhoneOtpConfig

  constructor({ logger }: InjectedDependencies, options: PhoneOtpOptions = {}) {
    super()
    this.logger_ = logger
    this.config_ = resolvePhoneOtpConfig(options)
  }

  async authenticate(
    data: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const body = (data.body ?? {}) as { phone?: string; code?: string }
    const phone = normalizePhone(body.phone ?? "")
    const code = (body.code ?? "").trim()

    if (!phone) {
      return { success: false, error: "invalid_phone" }
    }
    if (!code) {
      return { success: false, error: "code_required" }
    }

    let authIdentity: AuthIdentityDTO
    try {
      authIdentity = await authIdentityService.retrieve({ entity_id: phone })
    } catch (error) {
      if ((error as MedusaError).type === MedusaError.Types.NOT_FOUND) {
        // Номер без запрошенного кода — отвечаем как на неверный код, чтобы
        // по ответу нельзя было перебирать зарегистрированные номера.
        return { success: false, error: "invalid_code" }
      }
      return { success: false, error: (error as Error).message }
    }

    const state = this.readState_(authIdentity)
    const verification = verifyOtpCode(
      phone,
      code,
      state,
      { maxAttempts: this.config_.maxAttempts },
      new Date()
    )

    await authIdentityService.update(phone, {
      provider_metadata: verification.state as Record<string, unknown>,
    })

    if (!verification.ok) {
      this.logger_.warn(
        `[auth-phone] неверный код для ${phone}: ${verification.reason}`
      )
      return {
        success: false,
        error:
          verification.reason === "too_many_attempts"
            ? "too_many_attempts"
            : verification.reason === "expired"
              ? "code_expired"
              : "invalid_code",
      }
    }

    return { success: true, authIdentity: this.strip_(authIdentity) }
  }

  async register(): Promise<AuthenticationResponse> {
    // Регистрация идёт тем же путём, что и вход: запрос кода + его проверка
    // (POST /store/auth/phone/otp → POST /store/auth/phone/verify).
    return { success: false, error: "registration_not_supported" }
  }

  async update(): Promise<AuthenticationResponse> {
    return { success: false, error: "update_not_supported" }
  }

  /** Состояние кода из provider_metadata нашей провайдер-идентичности. */
  protected readState_(authIdentity: AuthIdentityDTO): PhoneOtpState {
    const providerIdentity = authIdentity.provider_identities?.find(
      (identity) => identity.provider === this.provider
    )
    return (providerIdentity?.provider_metadata ?? {}) as PhoneOtpState
  }

  /** Копия идентичности без состояния кода — она уходит вызывающему коду. */
  protected strip_(authIdentity: AuthIdentityDTO): AuthIdentityDTO {
    const copy = JSON.parse(JSON.stringify(authIdentity)) as AuthIdentityDTO
    for (const identity of copy.provider_identities ?? []) {
      if (identity.provider === this.provider) {
        identity.provider_metadata = {}
      }
    }
    return copy
  }
}

export default PhoneAuthProviderService
