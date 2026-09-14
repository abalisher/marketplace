import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep, setAuthAppMetadataStep } from "@medusajs/medusa/core-flows"
import { DRIVER_REGISTERED_EVENT } from "../modules/driver/events"
import {
  verifyDriverOtpStep,
  VerifyDriverOtpStepInput,
} from "./steps/verify-driver-otp"
import { registerDriverStep } from "./steps/register-driver"
import { issueDriverSessionStep } from "./steps/issue-driver-session"

export type VerifyDriverOtpWorkflowInput = VerifyDriverOtpStepInput

// Вход водителя по номеру телефона (T5.1). Один путь и для входа, и для
// самрегистрации: код верен → профиль либо уже связан с учётной сущностью,
// либо заводится заявкой в статусе pending (продавец её проверяет — модуль
// driver). Наружу уходит токен actor_type=driver и профиль с его статусом:
// заблокированный водитель тоже входит — иначе он не узнает причину отказа.
// Неверный код не создаёт ничего: шаги за `when` не выполняются, роут отвечает
// 401/429 по причине из шага проверки.
export const verifyDriverOtpWorkflow = createWorkflow(
  "verify-driver-otp",
  (input: WorkflowData<VerifyDriverOtpWorkflowInput>) => {
    const verification = verifyDriverOtpStep(input)

    // Профиля у этой учётной сущности ещё нет: заводим заявку (или подхватываем
    // заведённую раньше по тому же номеру) и связываем с учёткой — следующий
    // вход пойдёт сразу по app_metadata.driver_id.
    const registration = when(
      "needs-driver-profile",
      { verification },
      ({ verification }) => verification.ok && !verification.driver_id
    ).then(() => {
      const registered = registerDriverStep(
        transform({ input }, (data) => ({ phone: data.input.phone }))
      )
      setAuthAppMetadataStep(
        transform({ verification, registered }, (data) => ({
          authIdentityId: data.verification.auth_identity_id as string,
          actorType: "driver",
          value: data.registered.driver_id,
        }))
      ).config({ name: "link-driver-profile" })
      return registered
    })

    // Заявка появилась именно сейчас — продавцу летит событие на проверку.
    when(
      "driver-registered",
      { registration },
      ({ registration }) => !!registration?.created
    ).then(() =>
      emitEventStep({
        eventName: DRIVER_REGISTERED_EVENT,
        data: transform({ registration, input }, (data) => ({
          driver_id: data.registration?.driver_id,
          phone: data.input.phone,
        })),
      })
    )

    const session = when(
      "authenticated",
      { verification },
      ({ verification }) => verification.ok
    ).then(() =>
      issueDriverSessionStep(
        transform({ verification, registration }, (data) => ({
          driver_id: (data.verification.driver_id ??
            data.registration?.driver_id) as string,
          auth_identity_id: data.verification.auth_identity_id as string,
        }))
      )
    )

    return new WorkflowResponse(
      transform({ verification, session, registration }, (data) => ({
        ok: data.verification.ok,
        reason: data.verification.reason,
        token: data.session?.token ?? null,
        driver: data.session?.driver ?? null,
        // Признак «заявка создана этим входом» — приложение сразу ведёт
        // водителя заполнять профиль (ФИО и машина).
        created: !!data.registration?.created,
      }))
    )
  }
)
