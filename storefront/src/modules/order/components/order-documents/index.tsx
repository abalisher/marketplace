import { listOrderDocuments } from "@lib/data/documents"
import { getServerMessages } from "@lib/i18n/server"
import { convertToLocale } from "@lib/util/money"

// Документы заказа (счёт / накладная / АВР): для юрлица это главное — по счёту
// платит бухгалтерия, АВР закрывает сделку. Витрина только показывает список и
// даёт скачать PDF; генерирует и нумерует документы бэкенд.
// Пока документов нет (генерация асинхронная) — блок не показываем.
const OrderDocuments = async ({ orderId }: { orderId: string }) => {
  const [documents, m] = await Promise.all([
    listOrderDocuments(orderId),
    getServerMessages(),
  ])

  if (documents.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3" data-testid="order-documents">
      <h2 className="text-title-medium text-ink">{m.order.documents.title}</h2>
      <ul className="flex flex-col gap-2">
        {documents.map((document) => (
          <li
            key={document.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-line bg-surface p-3"
          >
            <div className="flex min-w-0 flex-col">
              <span className="text-body-large font-medium text-ink">
                {m.order.documents.type[document.type]}
              </span>
              <span className="text-body-medium text-ink-secondary">
                {document.number}
                {document.total_money !== undefined &&
                  document.currency_code &&
                  ` · ${convertToLocale({
                    amount: document.total_money,
                    currency_code: document.currency_code,
                  })}`}
              </span>
            </div>
            {document.file_url ? (
              <a
                href={document.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-body-large font-semibold text-accent hover:text-accent-pressed"
                data-testid="order-document-link"
              >
                {m.order.documents.download}
              </a>
            ) : (
              <span className="text-body-medium text-ink-secondary">
                {m.order.documents.preparing}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default OrderDocuments
