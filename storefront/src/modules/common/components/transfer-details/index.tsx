"use client"

import { TransferDetails as TransferDetailsData } from "@lib/data/payment"
import { useMessages } from "@lib/i18n/i18n-context"
import { convertToLocale } from "@lib/util/money"
import { transferComment } from "@lib/util/payment-transfer"
import CopyButton from "@modules/common/components/copy-button"

// Реквизиты перевода на Kaspi продавца в виде квитанции Kaspi: крупно
// получатель (как его покажет приложение), под ним строки «подпись — значение»
// с копированием номера и точного комментария «Заказ №N». Общий для карточки
// оплаты в чате и страниц заказа — покупатель переносит эти значения в
// приложение Kaspi, и вид у них должен быть один. `steps` — короткая подсказка,
// где в Kaspi перевод по номеру.
const TransferDetails = ({
  transfer,
  displayId,
  orderNumber,
  amount,
  currencyCode,
  steps = false,
}: {
  transfer: TransferDetailsData
  displayId?: number | null
  // Номер для людей (ORG-26-0007): он идёт в комментарий к переводу.
  orderNumber?: string | null
  amount?: number | null
  currencyCode?: string
  steps?: boolean
}) => {
  const m = useMessages()
  const t = m.payment.transfer
  const comment = transferComment(orderNumber, displayId)
  const initial = (transfer.recipient ?? transfer.phone)
    .trim()
    .charAt(0)
    .toUpperCase()

  return (
    <div
      className="flex flex-col overflow-hidden rounded-card border border-line bg-surface"
      data-testid="transfer-details"
    >
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-kaspi text-title-medium font-bold text-on-kaspi"
        >
          {initial}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-body-medium text-ink-secondary">
            {t.recipient}
          </span>
          <span
            className="truncate text-title-medium text-ink"
            data-testid="transfer-recipient"
          >
            {transfer.recipient ?? transfer.phone}
          </span>
        </div>
      </div>

      <dl className="flex flex-col divide-y divide-line border-t border-line px-4">
        {amount !== null && amount !== undefined && currencyCode && (
          <div className="flex items-center justify-between gap-3 py-3">
            <dt className="text-body-large text-ink-secondary">{t.amount}</dt>
            <dd
              className="text-title-medium tabular-nums text-ink"
              data-testid="transfer-amount"
            >
              {convertToLocale({ amount, currency_code: currencyCode })}
            </dd>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 flex-col">
            <dt className="text-body-medium text-ink-secondary">{t.phone}</dt>
            <dd
              className="text-title-medium tabular-nums text-ink"
              data-testid="transfer-phone"
            >
              {transfer.phone}
            </dd>
          </div>
          <CopyButton
            value={transfer.phone}
            data-testid="transfer-phone-copy"
          />
        </div>

        {comment && (
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 flex-col">
              <dt className="text-body-medium text-ink-secondary">
                {t.comment}
              </dt>
              <dd
                className="text-title-medium text-ink"
                data-testid="transfer-comment"
              >
                {comment}
              </dd>
            </div>
            <CopyButton value={comment} data-testid="transfer-comment-copy" />
          </div>
        )}

        {transfer.note && (
          <div className="flex flex-col gap-0.5 py-3">
            <dt className="text-body-medium text-ink-secondary">{t.note}</dt>
            <dd
              className="whitespace-pre-line text-body-large text-ink"
              data-testid="transfer-note"
            >
              {transfer.note}
            </dd>
          </div>
        )}
      </dl>

      {steps && comment && (
        <div className="flex flex-col gap-2 border-t border-line bg-surface-dim px-4 py-3">
          <span className="text-body-medium font-semibold text-ink">
            {t.howTo}
          </span>
          <ol className="flex flex-col gap-1.5">
            {t.steps.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-body-medium text-ink-secondary"
              >
                <span
                  aria-hidden="true"
                  className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-kaspi/15 text-[11px] font-bold text-ink"
                >
                  {index + 1}
                </span>
                {step.replace("{comment}", comment)}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default TransferDetails
