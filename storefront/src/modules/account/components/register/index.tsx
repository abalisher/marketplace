"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { useMessages } from "@lib/i18n/i18n-context"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const m = useMessages()
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-title-medium uppercase mb-6">
        {m.account.registerTitle}
      </h1>
      <p className="text-center text-body-large text-ink mb-4">
        {m.account.registerSubtitle}
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={m.common.address.firstName}
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label={m.common.address.lastName}
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label={m.common.address.email}
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label={m.common.address.phone}
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label={m.account.password}
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ink text-body-medium mt-6">
          {m.account.byCreatingAccount}{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            {m.account.privacyPolicy}
          </LocalizedClientLink>{" "}
          {m.account.and}{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            {m.account.termsOfUse}
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          {m.account.join}
        </SubmitButton>
      </form>
      <span className="text-center text-ink text-body-medium mt-6">
        {m.account.alreadyMember}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          {m.account.signIn}
        </button>
        .
      </span>
    </div>
  )
}

export default Register
