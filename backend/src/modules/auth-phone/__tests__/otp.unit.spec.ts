import {
  buildOtpState,
  generateOtpCode,
  hashOtpCode,
  resendDelaySeconds,
  verifyOtpCode,
} from "../otp"

const PHONE = "+77012345678"
const NOW = new Date("2026-08-26T10:00:00.000Z")
const later = (seconds: number) => new Date(NOW.getTime() + seconds * 1000)

describe("generateOtpCode", () => {
  it("отдаёт код нужной длины только из цифр", () => {
    for (const length of [4, 6, 8]) {
      const code = generateOtpCode(length)
      expect(code).toHaveLength(length)
      expect(code).toMatch(/^\d+$/)
    }
  })
})

describe("buildOtpState", () => {
  it("кладёт хеш и срок жизни, а код открытым текстом — только в dev-канале", () => {
    const state = buildOtpState(PHONE, "123456", NOW, {
      ttlSeconds: 300,
      devChannel: false,
    })
    expect(state.code_hash).toEqual(hashOtpCode(PHONE, "123456"))
    expect(state.dev_code).toBeUndefined()
    expect(state.code_expires_at).toEqual(later(300).toISOString())
    expect(state.attempts).toEqual(0)

    const devState = buildOtpState(PHONE, "123456", NOW, {
      ttlSeconds: 300,
      devChannel: true,
    })
    expect(devState.dev_code).toEqual("123456")
  })
})

describe("resendDelaySeconds", () => {
  const state = buildOtpState(PHONE, "123456", NOW, {
    ttlSeconds: 300,
    devChannel: false,
  })

  it("держит паузу между запросами кода", () => {
    expect(resendDelaySeconds(state, 60, NOW)).toEqual(60)
    expect(resendDelaySeconds(state, 60, later(59))).toEqual(1)
  })

  it("после паузы разрешает повторную отправку", () => {
    expect(resendDelaySeconds(state, 60, later(60))).toEqual(0)
    expect(resendDelaySeconds(undefined, 60, NOW)).toEqual(0)
  })
})

describe("verifyOtpCode", () => {
  const options = { maxAttempts: 3 }
  const fresh = () =>
    buildOtpState(PHONE, "123456", NOW, { ttlSeconds: 300, devChannel: true })

  it("принимает верный код и стирает его следы", () => {
    const result = verifyOtpCode(PHONE, "123456", fresh(), options, later(10))
    expect(result.ok).toBe(true)
    expect(result.state.code_hash).toBeUndefined()
    expect(result.state.dev_code).toBeUndefined()
  })

  it("считает попытки и аннулирует код на последней", () => {
    const first = verifyOtpCode(PHONE, "000000", fresh(), options, later(10))
    expect(first).toMatchObject({ ok: false, reason: "mismatch" })
    expect(first.state.attempts).toEqual(1)

    const second = verifyOtpCode(
      PHONE,
      "000000",
      first.state,
      options,
      later(11)
    )
    expect(second).toMatchObject({ ok: false, reason: "mismatch" })
    expect(second.state.attempts).toEqual(2)

    const third = verifyOtpCode(PHONE, "000000", second.state, options, later(12))
    expect(third).toMatchObject({ ok: false, reason: "too_many_attempts" })
    expect(third.state.code_hash).toBeUndefined()
  })

  it("не принимает истёкший код", () => {
    const result = verifyOtpCode(PHONE, "123456", fresh(), options, later(301))
    expect(result).toMatchObject({ ok: false, reason: "expired" })
    expect(result.state.code_hash).toBeUndefined()
  })

  it("сообщает, что кода нет, если его не запрашивали", () => {
    expect(verifyOtpCode(PHONE, "123456", undefined, options, NOW)).toMatchObject(
      { ok: false, reason: "no_code" }
    )
  })

  it("не принимает код от другого номера", () => {
    const result = verifyOtpCode(
      "+77019999999",
      "123456",
      fresh(),
      options,
      later(10)
    )
    expect(result.ok).toBe(false)
  })
})
