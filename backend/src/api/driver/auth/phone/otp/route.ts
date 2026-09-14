import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { normalizePhone } from "../../../../../modules/auth-phone/normalize-phone"
import { requestPhoneOtpWorkflow } from "../../../../../workflows/request-phone-otp"
import { DriverRequestPhoneOtpType } from "../validators"

// POST /driver/auth/phone/otp — запрос кода входа водителя (T5.1). Доступен
// без токена: это и есть вход (он же самрегистрация). Код выдаёт тот же
// workflow, что покупателю: учётная сущность у человека одна, номер — её ключ,
// а разделяет их actor_type сессии. Ответ одинаков для нового и известного
// номера — по нему нельзя узнать, есть ли такой водитель.
export async function POST(
  req: MedusaRequest<DriverRequestPhoneOtpType>,
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
