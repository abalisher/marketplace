// Настройки одноразового кода: срок жизни, лимит попыток, пауза перед
// повторной отправкой, длина кода и dev-канал доставки. Одна точка правды —
// её читают и провайдер аутентификации, и шаги workflow (запрос кода).
// Значения берутся из опций провайдера (medusa-config), иначе из env, иначе
// из безопасных значений по умолчанию.

export type PhoneOtpConfig = {
  /** Сколько секунд живёт выданный код. */
  ttlSeconds: number
  /** Сколько раз можно ошибиться в коде до его аннулирования. */
  maxAttempts: number
  /** Пауза между запросами кода на один номер (кнопка «выслать снова»). */
  resendSeconds: number
  /** Длина кода в цифрах. */
  codeLength: number
  /**
   * Dev-канал: SMS-провайдера на MVP нет, поэтому код пишется в лог и
   * отдаётся в ответе API (стенд и панель). На проде выключается.
   */
  devChannel: boolean
}

export type PhoneOtpOptions = Partial<{
  ttl_seconds: number
  max_attempts: number
  resend_seconds: number
  code_length: number
  dev_channel: boolean
}>

const DEFAULTS: PhoneOtpConfig = {
  ttlSeconds: 300,
  maxAttempts: 5,
  resendSeconds: 60,
  codeLength: 6,
  devChannel: true,
}

const num = (value: unknown, fallback: number): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

const bool = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === "boolean") {
    return value
  }
  if (value === "true" || value === "1") {
    return true
  }
  if (value === "false" || value === "0") {
    return false
  }
  return fallback
}

export const resolvePhoneOtpConfig = (
  options: PhoneOtpOptions = {}
): PhoneOtpConfig => ({
  ttlSeconds: num(
    options.ttl_seconds ?? process.env.PHONE_OTP_TTL_SECONDS,
    DEFAULTS.ttlSeconds
  ),
  maxAttempts: num(
    options.max_attempts ?? process.env.PHONE_OTP_MAX_ATTEMPTS,
    DEFAULTS.maxAttempts
  ),
  resendSeconds: num(
    options.resend_seconds ?? process.env.PHONE_OTP_RESEND_SECONDS,
    DEFAULTS.resendSeconds
  ),
  codeLength: num(
    options.code_length ?? process.env.PHONE_OTP_CODE_LENGTH,
    DEFAULTS.codeLength
  ),
  devChannel: bool(
    options.dev_channel ?? process.env.PHONE_OTP_DEV_CHANNEL,
    // По умолчанию dev-канал включён везде, кроме production.
    process.env.NODE_ENV !== "production"
  ),
})
