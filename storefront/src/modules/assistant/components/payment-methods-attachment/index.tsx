"use client"

import { AssistantPaymentMethods } from "@lib/data/assistant"
import { useMessages } from "@lib/i18n/i18n-context"
import { convertToLocale } from "@lib/util/money"
import KaspiLogo from "@modules/landing/components/kaspi-logo"
import { clx } from "@medusajs/ui"
import { useState } from "react"

type Method = AssistantPaymentMethods["methods"][number]["method"]

// Значки способов — круглые, как строки списка оплаты в приложении Kaspi:
// Kaspi-способы на красной заливке бренда, долг — нейтральный.
const MethodIcon = ({ method }: { method: Method }) => (
  <span
    aria-hidden
    className={clx(
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
      method === "debt" ? "bg-surface-dim text-ink" : "bg-kaspi text-on-kaspi"
    )}
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {method === "kaspi_qr" && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <path d="M14 14h3v3M21 14v.01M14 21h.01M17.5 21H21v-3.5" />
        </>
      )}
      {method === "kaspi_transfer" && (
        <>
          <path d="M4 8h14l-3.5-3.5" />
          <path d="M20 16H6l3.5 3.5" />
        </>
      )}
      {method === "debt" && (
        <>
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </>
      )}
    </svg>
  </span>
)

// Кнопки способов оплаты под ответом «как вам удобнее оплатить?» — список в
// стиле Kaspi: только то, что принимает продавец. Нажатие — обычная реплика
// покупателя в чат («Способ оплаты: Перевод на Kaspi»), способ выбирает
// ассистент — как у мини-формы доставки. Недоступный по сумме способ —
// неактивная строка с причиной. После нажатия строки гаснут: второй клик
// отправил бы вторую реплику.
const PaymentMethodsAttachment = ({
  attachment,
  onPick,
}: {
  attachment: AssistantPaymentMethods
  onPick?: (message: string) => void
}) => {
  const m = useMessages()
  const [picked, setPicked] = useState<string | null>(null)

  const description = (method: Method) => {
    if (method !== "debt") {
      return m.payment.methods[method].description
    }
    const text = m.payment.methods.debt.description.replace(
      "{days}",
      String(attachment.debt_term_days ?? 14)
    )
    return attachment.debt_max_amount != null
      ? `${text} ${m.payment.methods.debt.limit.replace(
          "{amount}",
          convertToLocale({
            amount: attachment.debt_max_amount,
            currency_code: attachment.currency,
          })
        )}`
      : text
  }

  return (
    <div
      className="flex flex-col overflow-hidden rounded-card border border-line bg-surface"
      data-testid="assistant-payment-methods"
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <KaspiLogo size={32} />
          <span className="text-title-medium text-ink">
            {m.payment.chatPick.title}
          </span>
        </div>
        <span className="shrink-0 text-[22px] font-bold leading-7 tabular-nums text-ink">
          {convertToLocale({
            amount: attachment.amount,
            currency_code: attachment.currency,
          })}
        </span>
      </div>

      <div className="flex flex-col divide-y divide-line border-t border-line">
        {attachment.methods.map((option) => {
          const title = m.payment.methods[option.method].title
          const isPicked = picked === option.method
          const disabled = !option.available || picked !== null || !onPick
          return (
            <button
              key={option.method}
              type="button"
              disabled={disabled}
              onClick={() => {
                setPicked(option.method)
                onPick?.(m.payment.chatPick.reply.replace("{method}", title))
              }}
              className={clx(
                "group flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                isPicked ? "bg-kaspi/5" : "enabled:hover:bg-surface-dim",
                disabled && !isPicked && "opacity-50"
              )}
              data-testid={`assistant-payment-method-${option.method}`}
            >
              <MethodIcon method={option.method} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-body-large font-semibold text-ink">
                  {title}
                </span>
                <span className="text-body-medium text-ink-secondary">
                  {!option.available && option.reason
                    ? m.payment.unavailable[
                        option.reason as keyof typeof m.payment.unavailable
                      ] ?? description(option.method)
                    : description(option.method)}
                </span>
              </span>
              {isPicked ? (
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kaspi text-on-kaspi"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
              ) : (
                <svg
                  aria-hidden
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-ink-secondary transition-transform group-enabled:group-hover:translate-x-0.5"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default PaymentMethodsAttachment
