import { resolvePhoneOtpConfig } from "../config"

// Настройки кода читаются из опций провайдера, затем из env, затем из значений
// по умолчанию. Dev-канал по умолчанию выключен в production.
describe("resolvePhoneOtpConfig", () => {
  const env = { ...process.env }
  afterEach(() => {
    process.env = { ...env }
  })

  it("даёт безопасные значения по умолчанию", () => {
    delete process.env.PHONE_OTP_TTL_SECONDS
    delete process.env.PHONE_OTP_MAX_ATTEMPTS
    delete process.env.PHONE_OTP_RESEND_SECONDS
    delete process.env.PHONE_OTP_CODE_LENGTH
    delete process.env.PHONE_OTP_DEV_CHANNEL
    process.env.NODE_ENV = "development"

    expect(resolvePhoneOtpConfig()).toEqual({
      ttlSeconds: 300,
      maxAttempts: 5,
      resendSeconds: 60,
      codeLength: 6,
      devChannel: true,
    })
  })

  it("в production dev-канал по умолчанию выключен", () => {
    delete process.env.PHONE_OTP_DEV_CHANNEL
    process.env.NODE_ENV = "production"
    expect(resolvePhoneOtpConfig().devChannel).toBe(false)
  })

  it("опции провайдера главнее env, env главнее умолчаний", () => {
    process.env.PHONE_OTP_TTL_SECONDS = "120"
    process.env.PHONE_OTP_CODE_LENGTH = "4"
    expect(resolvePhoneOtpConfig().ttlSeconds).toEqual(120)
    expect(resolvePhoneOtpConfig({ ttl_seconds: 90 }).ttlSeconds).toEqual(90)
    expect(resolvePhoneOtpConfig().codeLength).toEqual(4)
  })

  it("мусор в env не ломает настройки", () => {
    process.env.PHONE_OTP_MAX_ATTEMPTS = "abc"
    process.env.PHONE_OTP_RESEND_SECONDS = "-5"
    expect(resolvePhoneOtpConfig().maxAttempts).toEqual(5)
    expect(resolvePhoneOtpConfig().resendSeconds).toEqual(60)
  })
})
