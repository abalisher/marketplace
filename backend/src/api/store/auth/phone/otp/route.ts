import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { normalizePhone } from "../../../../../modules/auth-phone/normalize-phone"
import { requestPhoneOtpWorkflow } from "../../../../../workflows/request-phone-otp"
import { StoreRequestPhoneOtpType } from "../validators"

// POST /store/auth/phone/otp — запрос кода входа на номер телефона (T10.7).
// Доступен гостю: это и есть вход. Ответ одинаков для нового и известного
// номера — по нему нельзя узнать, зарегистрирован ли покупатель.
// SMS-провайдера на MVP нет: в dev-канале код возвращается полем `dev_code`
// и пишется в лог сервера (решение владельца 2026-08-25).
export async function POST(
  req: MedusaRequest<StoreRequestPhoneOtpType>,
  res: MedusaResponse
) {
  const phone = normalizePhone(req.validatedBody.phone)
  if (!phone) {
    res.status(400).json({
      reason: "invalid_phone",
      message: "Номер должен быть мобильным номером Казахстана (+7 7XX XXX XX XX)",
    })
    return
  }

  const { result } = await requestPhoneOtpWorkflow(req.scope).run({
    input: { phone },
    throwOnError: true,
  })

  if (result.status === "throttled") {
    res.status(429).json({
      reason: "too_many_requests",
      retry_after: result.resend_after,
      message: "Код уже отправлен — повторите запрос позже",
    })
    return
  }

  res.status(200).json({
    phone,
    expires_in: result.expires_in,
    resend_after: result.resend_after,
    dev_code: result.dev_code,
  })
}
