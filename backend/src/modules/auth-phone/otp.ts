import crypto from "crypto"

// Работа с одноразовым кодом: генерация, хеширование, состояние в
// provider_metadata и его проверка. Функции чистые — их покрывают unit-тесты
// и переиспользуют шаг запроса кода и провайдер аутентификации.

/** Состояние кода, которое живёт в provider_metadata провайдер-идентичности. */
export type PhoneOtpState = {
  /** SHA-256 от «номер:код» — сам код в базе не лежит (кроме dev-канала). */
  code_hash?: string
  /** Момент истечения кода, ISO. */
  code_expires_at?: string
  /** Момент выдачи кода, ISO — от него считается пауза «выслать снова». */
  code_requested_at?: string
  /** Сколько раз уже ошиблись в этом коде. */
  attempts?: number
  /** Код открытым текстом — ТОЛЬКО dev-канал (нет SMS-провайдера). */
  dev_code?: string
}

export type OtpFailureReason =
  | "no_code"
  | "expired"
  | "too_many_attempts"
  | "mismatch"

/** Криптостойкий числовой код нужной длины (с ведущими нулями). */
export const generateOtpCode = (length: number): string => {
  const digits = Array.from(crypto.randomBytes(length)).map((byte) => byte % 10)
  return digits.join("")
}

/** Хеш кода: номер играет роль соли, код короткий и живёт минуты. */
export const hashOtpCode = (phone: string, code: string): string =>
  crypto.createHash("sha256").update(`${phone}:${code}`).digest("hex")

/** Сравнение хешей постоянным по времени способом. */
const equals = (a: string, b: string): boolean => {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

/**
 * Сколько секунд осталось до разрешённой повторной отправки кода на номер.
 * 0 — можно отправлять.
 */
export const resendDelaySeconds = (
  state: PhoneOtpState | undefined,
  resendSeconds: number,
  now: Date
): number => {
  if (!state?.code_requested_at) {
    return 0
  }
  const requestedAt = Date.parse(state.code_requested_at)
  if (Number.isNaN(requestedAt)) {
    return 0
  }
  const elapsed = (now.getTime() - requestedAt) / 1000
  const left = Math.ceil(resendSeconds - elapsed)
  return left > 0 ? left : 0
}

/** Новое состояние кода для записи в provider_metadata. */
export const buildOtpState = (
  phone: string,
  code: string,
  now: Date,
  options: { ttlSeconds: number; devChannel: boolean }
): PhoneOtpState => ({
  code_hash: hashOtpCode(phone, code),
  code_expires_at: new Date(
    now.getTime() + options.ttlSeconds * 1000
  ).toISOString(),
  code_requested_at: now.toISOString(),
  attempts: 0,
  ...(options.devChannel ? { dev_code: code } : {}),
})

/** Состояние после успешного входа — код одноразовый, следов не оставляем. */
export const clearedOtpState = (): PhoneOtpState => ({
  code_hash: undefined,
  code_expires_at: undefined,
  code_requested_at: undefined,
  attempts: 0,
  dev_code: undefined,
})

export type OtpVerification =
  | { ok: true; state: PhoneOtpState }
  | { ok: false; reason: OtpFailureReason; state: PhoneOtpState }

/**
 * Проверяет введённый код против состояния. Возвращает новое состояние:
 * при успехе — очищенное, при ошибке — с увеличенным счётчиком попыток,
 * при исчерпании попыток код аннулируется (нужен новый запрос).
 */
export const verifyOtpCode = (
  phone: string,
  code: string,
  state: PhoneOtpState | undefined,
  options: { maxAttempts: number },
  now: Date
): OtpVerification => {
  if (!state?.code_hash || !state.code_expires_at) {
    return { ok: false, reason: "no_code", state: clearedOtpState() }
  }

  const expiresAt = Date.parse(state.code_expires_at)
  if (Number.isNaN(expiresAt) || expiresAt <= now.getTime()) {
    return { ok: false, reason: "expired", state: clearedOtpState() }
  }

  const attempts = state.attempts ?? 0
  if (attempts >= options.maxAttempts) {
    return { ok: false, reason: "too_many_attempts", state: clearedOtpState() }
  }

  if (!equals(state.code_hash, hashOtpCode(phone, code))) {
    const next = attempts + 1
    if (next >= options.maxAttempts) {
      return {
        ok: false,
        reason: "too_many_attempts",
        state: clearedOtpState(),
      }
    }
    return {
      ok: false,
      reason: "mismatch",
      state: { ...state, attempts: next },
    }
  }

  return { ok: true, state: clearedOtpState() }
}
