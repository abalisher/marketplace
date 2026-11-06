"use client"

import { orderLabel } from "@lib/util/order-label"
import { MyDocument } from "@lib/data/documents"
import { formatDate } from "@lib/i18n/format-date"
import { useLocale, useMessages } from "@lib/i18n/i18n-context"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Строка общего списка документов (T10.6): тип и номер, заказ с датой и суммой,
// справа — скачивание PDF. Заказ здесь ссылкой: документ почти всегда ищут
// «от заказа», и из списка надо уметь вернуться в карточку.
const DocumentRow = ({ document }: { document: MyDocument }) => {
  const m = useMessages()
  const locale = useLocale()

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-body-large font-medium text-ink">
          {m.order.documents.type[document.type]} · {document.number}
        </span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-medium text-ink-secondary">
          <LocalizedClientLink
            href={`/cabinet/orders/${document.order.id}`}
            className="text-accent transition-colors hover:text-accent-pressed"
            data-testid="cabinet-document-order-link"
          >
            {m.cabinet.documents.order.replace(
              "{id}",
              orderLabel(document.order.number, document.order.display_id)
            )}
          </LocalizedClientLink>
          {document.created_at && (
            <span>{formatDate(document.created_at, locale)}</span>
          )}
          {document.total_money !== undefined && document.currency_code && (
            <span className="tabular-nums text-ink">
              {convertToLocale({
                amount: document.total_money,
                currency_code: document.currency_code,
              })}
            </span>
          )}
        </div>
      </div>
      {document.file_url ? (
        <a
          href={document.file_url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex min-h-[48px] items-center text-body-large font-semibold text-accent transition-colors hover:text-accent-pressed"
          data-testid="cabinet-document-link"
        >
          {m.order.documents.download}
        </a>
      ) : (
        <span className="ml-auto text-body-medium text-ink-secondary">
          {m.order.documents.preparing}
        </span>
      )}
    </li>
  )
}

export default DocumentRow
