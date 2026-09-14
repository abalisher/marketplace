import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createCustomersStep,
  setAuthAppMetadataStep,
} from "@medusajs/medusa/core-flows"
import {
  verifyPhoneOtpStep,
  VerifyPhoneOtpStepInput,
} from "./steps/verify-phone-otp"
import { issueCustomerSessionStep } from "./steps/issue-customer-session"

export type VerifyPhoneOtpWorkflowInput = VerifyPhoneOtpStepInput

// Подтверждение кода входа (T10.7). Один путь и для входа, и для регистрации:
// код верен → покупатель либо уже есть (связан с номером или найден по нему),
// либо создаётся с профилем «только телефон» (ФИО и адрес спрашиваются один раз
// при оформлении — T10.8). Наружу уходит сессионный токен и профиль.
// Неверный код не создаёт ничего: шаги за `when` не выполняются, роут отвечает
// 401/429 по причине из шага проверки.
export const verifyPhoneOtpWorkflow = createWorkflow(
  "verify-phone-otp",
  (input: WorkflowData<VerifyPhoneOtpWorkflowInput>) => {
    const verification = verifyPhoneOtpStep(input)

    // Ядровый createCustomerAccountWorkflow требует email, а профиль покупателя
    // на MVP — телефон + ФИО + адрес (решение владельца 2026-08-25), поэтому
    // учётка создаётся ядровым шагом создания покупателя и связывается с
    // провайдер-идентичностью вручную.
    const created = when(
      "needs-customer-account",
      { verification },
      ({ verification }) => verification.ok && !verification.customer_id
    ).then(() => {
      const customers = createCustomersStep(
        transform({ input }, (data) => [
          { phone: data.input.phone, has_account: true },
        ])
      )
      setAuthAppMetadataStep(
        transform({ verification, customers }, (data) => ({
          authIdentityId: data.verification.auth_identity_id as string,
          actorType: "customer",
          value: data.customers[0].id,
        }))
      ).config({ name: "link-created-customer" })
      return transform({ customers }, (data) => data.customers[0])
    })

    // Учётка нашлась по номеру — досвязываем её с провайдер-идентичностью,
    // чтобы следующий вход шёл сразу по app_metadata.
    when(
      "links-existing-customer",
      { verification },
      ({ verification }) => !!verification.link_customer_id
    ).then(() =>
      setAuthAppMetadataStep(
        transform({ verification }, (data) => ({
          authIdentityId: data.verification.auth_identity_id as string,
          actorType: "customer",
          value: data.verification.link_customer_id as string,
        }))
      )
    )

    const session = when(
      "authenticated",
      { verification },
      ({ verification }) => verification.ok
    ).then(() =>
      issueCustomerSessionStep(
        transform({ verification, created }, (data) => ({
          customer_id: (data.verification.customer_id ??
            data.created?.id) as string,
          auth_identity_id: data.verification.auth_identity_id as string,
        }))
      )
    )

    return new WorkflowResponse(
      transform({ verification, session, created }, (data) => ({
        ok: data.verification.ok,
        reason: data.verification.reason,
        token: data.session?.token ?? null,
        customer: data.session?.customer ?? null,
        // Признак «учётка создана этим входом» — клиент решает, спрашивать ли
        // ФИО и адрес сразу (T10.8) или вести покупателя дальше.
        created: !!data.created,
      }))
    )
  }
)
