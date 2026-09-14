"use server"

import { revalidateTag } from "next/cache"
import { getCacheTag, setAuthToken } from "./cookies"
import { transferCart } from "./customer"

// Вход покупателя по номеру телефона (T10.7). Тонкий клиент: канон номера,
// сроки и лимиты кода — на бэкенде (POST /store/auth/phone/otp и /verify),
// здесь только вызов, запись токена сессии в cookie и перенос гостевой корзины.
//
// Роуты отвечают на неудачу машинным полем `reason` (неверный код / истёк /
// исчерпаны попытки), от него зависит текст на экране — поэтому ходим обычным
// fetch, а не через js-sdk: он оставляет от тела ошибки только `message`.

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

export type PhoneAuthReason =
  | "invalid_phone"
  | "too_many_requests"
  | "invalid_code"
  | "code_expired"
  | "too_many_attempts"
  | "unknown"

export type RequestCodeResult =
  | {
      ok: true
      /** Номер в каноне +7XXXXXXXXXX — его показываем на шаге кода. */
      phone: string
      expires_in: number
      resend_after: number
      /** Код открытым текстом — только dev-канал стенда (нет SMS-провайдера). */
      dev_code: string | null
    }
  | { ok: false; reason: PhoneAuthReason; retry_after: number | null }

export type VerifyCodeResult =
  | { ok: true; created: boolean }
  | { ok: false; reason: PhoneAuthReason }

const KNOWN_REASONS: PhoneAuthReason[] = [
  "invalid_phone",
  "too_many_requests",
  "invalid_code",
  "code_expired",
  "too_many_attempts",
]

const asReason = (value: unknown): PhoneAuthReason =>
  KNOWN_REASONS.find((reason) => reason === value) ?? "unknown"

const post = async (path: string, body: Record<string, string>) => {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  const data = await response.json().catch(() => ({}))
  return { ok: response.ok, data } as {
    ok: boolean
    data: Record<string, unknown>
  }
}

export async function requestPhoneCode(
  phone: string
): Promise<RequestCodeResult> {
  const { ok, data } = await post("/store/auth/phone/otp", { phone })

  if (!ok) {
    return {
      ok: false,
      reason: asReason(data.reason),
      retry_after:
        typeof data.retry_after === "number" ? data.retry_after : null,
    }
  }

  return {
    ok: true,
    phone: String(data.phone),
    expires_in: Number(data.expires_in),
    resend_after: Number(data.resend_after),
    dev_code: typeof data.dev_code === "string" ? data.dev_code : null,
  }
}

export async function verifyPhoneCode(
  phone: string,
  code: string
): Promise<VerifyCodeResult> {
  const { ok, data } = await post("/store/auth/phone/verify", { phone, code })

  if (!ok || typeof data.token !== "string") {
    return { ok: false, reason: asReason(data.reason) }
  }

  await setAuthToken(data.token)
  revalidateTag(await getCacheTag("customers"))

  // Позиции, набранные гостем, переносим на вошедшего покупателя.
  try {
    await transferCart()
  } catch {
    // Перенос корзины не должен ломать вход: корзина остаётся гостевой.
  }

  return { ok: true, created: data.created === true }
}
