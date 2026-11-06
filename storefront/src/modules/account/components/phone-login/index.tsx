"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@medusajs/ui"
import {
  PhoneAuthReason,
  requestPhoneCode,
  verifyPhoneCode,
} from "@lib/data/phone-auth"
import { useMessages } from "@lib/i18n/i18n-context"
import { formatPhone } from "@lib/util/format-phone"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import Input from "@modules/common/components/input"
import PhoneInput from "@modules/common/components/phone-input"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

type Step = "phone" | "code"

// Вход покупателя по номеру телефона (T10.7) — основной вход на витрине.
// Два шага: номер → код из SMS. Канон номера, срок жизни кода, лимит попыток и
// пауза «выслать снова» считает бэкенд; экран только показывает его ответ.
// Пока нет SMS-провайдера, на стенде код приходит в ответе (dev-канал) и
// подставляется подсказкой — иначе войти было бы нельзя.
const PhoneLogin = ({ setCurrentView }: Props) => {
  const m = useMessages()
  // Куда вернуть покупателя после входа: ассистент присылает сюда ссылку с
  // `redirect` на чат, чтобы оформление продолжилось там же, где прервалось
  // (T10.8). Принимаем только относительный путь — чужой домен в редирект не
  // пускаем.
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect")
  const redirectTo =
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//")
      ? redirectParam
      : null

  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [canonicalPhone, setCanonicalPhone] = useState("")
  const [code, setCode] = useState("")
  const [devCode, setDevCode] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(0)
  const [pending, setPending] = useState(false)
  const [reason, setReason] = useState<PhoneAuthReason | null>(null)

  // Таймер кнопки «выслать снова»: тикает, пока экран открыт.
  const ticking = resendIn > 0
  useEffect(() => {
    if (!ticking) {
      return
    }
    const interval = setInterval(() => {
      setResendIn((left) => (left <= 1 ? 0 : left - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [ticking])

  const errorText = (value: PhoneAuthReason | null) => {
    switch (value) {
      case "invalid_phone":
        return m.account.phone.errorPhone
      case "too_many_requests":
        return m.account.phone.errorTooManyRequests
      case "invalid_code":
        return m.account.phone.errorCode
      case "code_expired":
        return m.account.phone.errorExpired
      case "too_many_attempts":
        return m.account.phone.errorAttempts
      case "unknown":
        return m.account.phone.errorUnknown
      default:
        return null
    }
  }

  const sendCode = async (value: string) => {
    setPending(true)
    setReason(null)
    const result = await requestPhoneCode(value)
    setPending(false)

    if (!result.ok) {
      setReason(result.reason)
      if (result.reason === "too_many_requests" && result.retry_after) {
        setResendIn(result.retry_after)
        setStep("code")
      }
      return
    }

    setCanonicalPhone(result.phone)
    setDevCode(result.dev_code)
    setResendIn(result.resend_after)
    setCode("")
    setStep("code")
  }

  const submitPhone = async (event: React.FormEvent) => {
    event.preventDefault()
    await sendCode(phone)
  }

  const submitCode = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setReason(null)
    const result = await verifyPhoneCode(canonicalPhone, code)
    setPending(false)

    if (!result.ok) {
      setReason(result.reason)
      if (
        result.reason === "code_expired" ||
        result.reason === "too_many_attempts"
      ) {
        setCode("")
        setDevCode(null)
      }
      return
    }

    // Вошли: страница аккаунта серверная — перечитываем её целиком. Если вход
    // начался из чата, возвращаемся туда же (сервер отдаст страницу уже
    // авторизованному покупателю).
    if (redirectTo) {
      window.location.href = redirectTo
      return
    }
    window.location.reload()
  }

  const backToPhone = () => {
    setStep("phone")
    setReason(null)
    setCode("")
    setDevCode(null)
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="phone-login-page"
    >
      <h1 className="text-title-medium uppercase mb-6">
        {m.account.phone.title}
      </h1>

      {step === "phone" ? (
        <>
          <p className="text-center text-body-large text-ink mb-8">
            {m.account.phone.subtitle}
          </p>
          <form className="w-full" onSubmit={submitPhone}>
            <PhoneInput
              label={m.account.phone.phoneLabel}
              name="phone"
              value={phone}
              onChange={setPhone}
              required
              autoFocus
              data-testid="phone-input"
            />
            <p className="text-body-small text-ink-secondary mt-2">
              {m.account.phone.phoneHint}
            </p>
            <ErrorMessage
              error={errorText(reason)}
              data-testid="phone-login-error"
            />
            <Button
              size="large"
              type="submit"
              className="w-full mt-6"
              isLoading={pending}
              data-testid="request-code-button"
            >
              {m.account.phone.requestCode}
            </Button>
          </form>
        </>
      ) : (
        <>
          <p className="text-center text-body-large text-ink mb-8">
            {m.account.phone.codeSubtitle.replace(
              "{phone}",
              formatPhone(canonicalPhone)
            )}
          </p>
          <form className="w-full" onSubmit={submitCode}>
            <Input
              label={m.account.phone.codeLabel}
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D+/g, "").slice(0, 8))
              }
              required
              data-testid="code-input"
            />
            {devCode && (
              <p
                className="text-body-small text-ink-secondary mt-2"
                data-testid="dev-code-hint"
              >
                {m.account.phone.devCode.replace("{code}", devCode)}
              </p>
            )}
            <ErrorMessage
              error={errorText(reason)}
              data-testid="phone-login-error"
            />
            <Button
              size="large"
              type="submit"
              className="w-full mt-6"
              isLoading={pending}
              data-testid="verify-code-button"
            >
              {m.account.phone.signIn}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => sendCode(canonicalPhone)}
              disabled={resendIn > 0 || pending}
              className="text-body-medium underline disabled:no-underline disabled:text-ink-secondary"
              data-testid="resend-code-button"
            >
              {resendIn > 0
                ? m.account.phone.resendIn.replace(
                    "{seconds}",
                    String(resendIn)
                  )
                : m.account.phone.resend}
            </button>
            <button
              type="button"
              onClick={backToPhone}
              className="text-body-medium underline"
              data-testid="change-phone-button"
            >
              {m.account.phone.changePhone}
            </button>
          </div>
        </>
      )}

      <span className="text-center text-ink text-body-medium mt-8">
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
          data-testid="email-login-button"
        >
          {m.account.phone.emailLogin}
        </button>
      </span>
    </div>
  )
}

export default PhoneLogin
