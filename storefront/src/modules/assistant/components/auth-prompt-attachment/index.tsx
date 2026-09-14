"use client"

import { useMessages } from "@lib/i18n/i18n-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams } from "next/navigation"

// Вставка «войдите, чтобы оформить» (T10.8). Подбор, расчёт и корзина работают
// без входа, а заказ, оплата и документы принадлежат учётной записи — поэтому на
// шаге оформления бэкенд просит войти и присылает эту вставку.
//
// Единственная вставка ленты с действием: вход живёт на отдельной странице, и
// репликой в чат его не сделать (остальные вставки остаются read-only).
// Возврат — на этот же чат с меткой `logged_in`: по ней шаблон сам продолжает
// диалог, чтобы покупатель не гадал, что делать после входа.
const AuthPromptAttachment = () => {
  const m = useMessages()
  const params = useParams()
  const countryCode = (params?.countryCode as string) ?? ""
  const backToChat = `/${countryCode}/chat?logged_in=1`

  return (
    <div
      className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
      data-testid="assistant-auth-prompt"
    >
      <span className="text-title-medium text-ink">
        {m.assistant.auth.title}
      </span>
      <span className="text-body-medium text-ink-secondary">
        {m.assistant.auth.description}
      </span>
      <LocalizedClientLink
        href={`/account?redirect=${encodeURIComponent(backToChat)}`}
        className="inline-flex min-h-[48px] items-center justify-center rounded-chip bg-accent px-4 py-2 text-body-large text-on-accent transition-colors hover:bg-accent-pressed"
        data-testid="assistant-auth-prompt-link"
      >
        {m.assistant.auth.action}
      </LocalizedClientLink>
    </div>
  )
}

export default AuthPromptAttachment
