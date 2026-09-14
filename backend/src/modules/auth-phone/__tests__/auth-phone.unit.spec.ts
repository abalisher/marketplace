import type { Logger } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import PhoneAuthProviderService from "../service"
import { buildOtpState, hashOtpCode, PhoneOtpState } from "../otp"

// Unit-тесты провайдера «телефон + код»: проверка кода на подставном
// AuthIdentityProviderService (без БД и без auth-модуля). Выдача кода — шаг
// workflow `issue-phone-otp`, она покрыта интеграционными тестами роутов.

const PHONE = "+77012345678"

const noopLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
} as unknown as Logger

type Fake = {
  service: any
  updates: { entity_id: string; metadata: PhoneOtpState }[]
}

const fakeIdentityService = (metadata: PhoneOtpState | null): Fake => {
  const updates: Fake["updates"] = []
  const identity = {
    id: "authid_1",
    app_metadata: {},
    provider_identities: [
      {
        id: "provid_1",
        provider: "phone",
        entity_id: PHONE,
        provider_metadata: metadata ?? {},
      },
    ],
  }
  return {
    updates,
    service: {
      retrieve: async ({ entity_id }: { entity_id: string }) => {
        if (metadata === null || entity_id !== PHONE) {
          throw new MedusaError(MedusaError.Types.NOT_FOUND, "not found")
        }
        return identity
      },
      create: async () => identity,
      update: async (
        entity_id: string,
        data: { provider_metadata?: PhoneOtpState }
      ) => {
        updates.push({ entity_id, metadata: data.provider_metadata ?? {} })
        return identity
      },
      setState: async () => {},
      getState: async () => null,
    },
  }
}

const newProvider = (maxAttempts = 3) =>
  new PhoneAuthProviderService(
    { logger: noopLogger },
    { max_attempts: maxAttempts, ttl_seconds: 300, dev_channel: false }
  )

const request = (body: Record<string, unknown>) =>
  ({ url: "", headers: {}, query: {}, body, protocol: "https" }) as any

const activeState = () =>
  buildOtpState(PHONE, "123456", new Date(), {
    ttlSeconds: 300,
    devChannel: true,
  })

describe("PhoneAuthProviderService.authenticate", () => {
  it("пускает по верному коду и стирает код из метаданных", async () => {
    const fake = fakeIdentityService(activeState())
    const result = await newProvider().authenticate(
      request({ phone: "8 701 234 56 78", code: "123456" }),
      fake.service
    )

    expect(result.success).toBe(true)
    expect(result.authIdentity?.id).toEqual("authid_1")
    // Наружу состояние кода не уходит.
    expect(
      result.authIdentity?.provider_identities?.[0].provider_metadata
    ).toEqual({})
    expect(fake.updates).toHaveLength(1)
    expect(fake.updates[0].entity_id).toEqual(PHONE)
    expect(fake.updates[0].metadata.code_hash).toBeUndefined()
    expect(fake.updates[0].metadata.dev_code).toBeUndefined()
  })

  it("не пускает по неверному коду и копит попытки", async () => {
    const fake = fakeIdentityService(activeState())
    const result = await newProvider().authenticate(
      request({ phone: PHONE, code: "000000" }),
      fake.service
    )

    expect(result).toMatchObject({ success: false, error: "invalid_code" })
    expect(fake.updates[0].metadata.attempts).toEqual(1)
    expect(fake.updates[0].metadata.code_hash).toEqual(
      hashOtpCode(PHONE, "123456")
    )
  })

  it("сообщает об исчерпанных попытках", async () => {
    const fake = fakeIdentityService({ ...activeState(), attempts: 3 })
    const result = await newProvider(3).authenticate(
      request({ phone: PHONE, code: "000000" }),
      fake.service
    )

    expect(result).toMatchObject({ success: false, error: "too_many_attempts" })
    expect(fake.updates[0].metadata.code_hash).toBeUndefined()
  })

  it("сообщает об истёкшем коде", async () => {
    const expired = buildOtpState(
      PHONE,
      "123456",
      new Date(Date.now() - 600_000),
      { ttlSeconds: 300, devChannel: false }
    )
    const fake = fakeIdentityService(expired)
    const result = await newProvider().authenticate(
      request({ phone: PHONE, code: "123456" }),
      fake.service
    )

    expect(result).toMatchObject({ success: false, error: "code_expired" })
  })

  it("на незнакомый номер отвечает как на неверный код", async () => {
    const fake = fakeIdentityService(null)
    const result = await newProvider().authenticate(
      request({ phone: PHONE, code: "123456" }),
      fake.service
    )

    expect(result).toMatchObject({ success: false, error: "invalid_code" })
    expect(fake.updates).toHaveLength(0)
  })

  it("проверяет номер и наличие кода в запросе", async () => {
    const fake = fakeIdentityService(activeState())
    await expect(
      newProvider().authenticate(request({ phone: "123", code: "123456" }), fake.service)
    ).resolves.toMatchObject({ success: false, error: "invalid_phone" })
    await expect(
      newProvider().authenticate(request({ phone: PHONE }), fake.service)
    ).resolves.toMatchObject({ success: false, error: "code_required" })
  })
})

describe("PhoneAuthProviderService", () => {
  it("не поддерживает ядровую регистрацию и смену пароля", async () => {
    const provider = newProvider()
    await expect(provider.register()).resolves.toMatchObject({ success: false })
    await expect(provider.update()).resolves.toMatchObject({ success: false })
  })
})
