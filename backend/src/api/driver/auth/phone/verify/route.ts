import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { normalizePhone } from "../../../../../modules/auth-phone/normalize-phone"
import { verifyDriverOtpWorkflow } from "../../../../../workflows/verify-driver-otp"
import { toDriverView } from "../../../driver-view"
import { DriverVerifyPhoneOtpType } from "../validators"

// Ответы на неудачу: код неверен/истёк — 401, исчерпаны попытки — 429
// (нужен новый код). Клиент показывает сообщение по полю `reason`.
const FAILURE_STATUS: Record<string, number> = {
  invalid_code: 401,
  code_expired: 401,
  too_many_attempts: 429,
}

const FAILURE_MESSAGE: Record<string, string> = {
  invalid_code: "Неверный код",
  code_expired: "Код истёк — запросите новый",
  too_many_attempts: "Слишком много попыток — запросите новый код",
}

// POST /driver/auth/phone/verify — подтверждение кода: один путь и для входа,
// и для самрегистрации водителя (T5.1). Верный код → токен actor_type=driver;
// профиля не было → заводится заявка в статусе pending (`created: true`), и
// приложение сразу ведёт водителя заполнять ФИО и машину. Токен выдаётся при
// любом допуске: заблокированный водитель должен увидеть причину, а не
// «неверный код».
export async function POST(
  req: MedusaRequest<DriverVerifyPhoneOtpType>,
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

  const { result } = await verifyDriverOtpWorkflow(req.scope).run({
    input: { phone, code: req.validatedBody.code },
    throwOnError: true,
  })

  if (!result.ok || !result.token || !result.driver) {
    const reason = result.reason ?? "invalid_code"
    res.status(FAILURE_STATUS[reason] ?? 401).json({
      reason,
      message: FAILURE_MESSAGE[reason] ?? FAILURE_MESSAGE.invalid_code,
    })
    return
  }

  res.status(200).json({
    token: result.token,
    driver: toDriverView(result.driver),
    created: result.created,
  })
}
