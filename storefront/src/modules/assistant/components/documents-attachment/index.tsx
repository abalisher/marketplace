"use client"

import { AssistantOrderDocuments } from "@lib/data/assistant"
import { useMessages } from "@lib/i18n/i18n-context"

// Вставка «документы заказа»: счёт, накладная и внутренний акт со ссылками на
// PDF. Появилась по замечанию владельца на приёмке («нажал „Нужны документы“,
// но не получил накладную/АВР») — ассистент писал «документы сформированы», а
// открыть их из диалога было негде. READ-ONLY: ссылки, никаких действий.
// Документ без файла (ещё рендерится) остаётся в списке с подписью — иначе
// покупатель решит, что документа нет вовсе.
const DocumentsAttachment = ({
  attachment,
}: {
  attachment: AssistantOrderDocuments
}) => {
  const m = useMessages()

  return (
    <div
      className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
      data-testid="assistant-documents"
    >
      <span className="text-title-medium text-ink">
        {attachment.display_id !== null
          ? m.assistant.documents.title.replace(
              "{id}",
              String(attachment.display_id)
            )
          : m.assistant.documents.fallbackTitle}
      </span>

      <ul className="flex flex-col gap-3">
        {attachment.documents.map((document) => (
          <li
            key={`${document.doc_type}-${document.number}`}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <span className="flex flex-col">
              <span className="text-body-large text-ink">{document.title}</span>
              <span className="text-body-medium text-ink-secondary">
                {document.number}
              </span>
            </span>
            {document.url ? (
              <a
                href={document.url}
                target="_blank"
                rel="noreferrer"
                className="min-h-[48px] rounded-chip border border-line px-4 py-2 text-body-large text-accent transition-colors hover:border-accent"
                data-testid="assistant-document-open"
              >
                {m.assistant.documents.open}
              </a>
            ) : (
              <span className="text-body-medium text-ink-secondary">
                {m.assistant.documents.pending}
              </span>
            )}
          </li>
        ))}
      </ul>

      <span className="text-body-medium text-ink-secondary">
        {m.assistant.documents.hint}
      </span>
    </div>
  )
}

export default DocumentsAttachment
