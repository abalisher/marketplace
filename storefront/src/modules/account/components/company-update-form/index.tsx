"use client"

import { COMPANY_DOCUMENT_MIME_TYPES } from "@lib/company/document-limits"
import { Company, updateCompanyApplication } from "@lib/data/company"
import { useMessages } from "@lib/i18n/i18n-context"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

// Правка своей заявки прямо в разделе «Компания»: после отказа модератора —
// исправление реквизитов и повторная подача, в остальных статусах — догрузка
// недостающих документов. До T3.8a покупателю оставалась только кнопка
// «Связаться с нами»: приложить файлы можно было лишь в момент первой заявки.
const CompanyUpdateForm = ({
  company,
  remainingDocuments,
}: {
  company: Company
  remainingDocuments: number
}) => {
  const m = useMessages()
  const [state, formAction] = useActionState(updateCompanyApplication, null)

  const t = m.account.company
  const errors = t.errors as Record<string, string>
  // Реквизиты правит только отклонённая заявка: у одобренной их проверил
  // модератор, у ожидающей менять нечего — она ещё не рассмотрена.
  const withRequisites = company.status === "rejected"

  return (
    <form
      className="flex w-full flex-col gap-y-4 rounded-card border border-line p-6"
      action={formAction}
      data-testid="company-update-form"
      data-mode={withRequisites ? "resubmit" : "documents"}
    >
      <div className="flex flex-col gap-y-1">
        <span className="text-title-medium">
          {withRequisites ? t.resubmitTitle : t.addDocumentsTitle}
        </span>
        <p className="text-body-medium text-ink-secondary">
          {withRequisites ? t.resubmitHint : t.addDocumentsHint}
        </p>
      </div>

      {withRequisites && (
        <div className="flex flex-col gap-y-2">
          <Input
            label={t.name}
            name="name"
            required
            autoComplete="organization"
            defaultValue={state?.values.name || company.name}
            data-testid="company-update-name-input"
          />
          <Input
            label={t.bin}
            name="bin"
            required
            inputMode="numeric"
            pattern="\d{12}"
            maxLength={12}
            defaultValue={state?.values.bin || company.bin}
            data-testid="company-update-bin-input"
          />
          <p className="text-body-small text-ink-secondary">{t.binHint}</p>
        </div>
      )}

      {/* Лимит документов общий на компанию: место закончилось — остаётся
          правка реквизитов (форма догрузки в этом случае не показывается). */}
      {remainingDocuments > 0 ? (
        <div className="flex flex-col gap-y-2">
          <span className="text-body-medium text-ink">{t.documents}</span>
          <input
            type="file"
            name="documents"
            multiple
            accept={COMPANY_DOCUMENT_MIME_TYPES.join(",")}
            className="min-h-[48px] w-full cursor-pointer rounded-card border border-line bg-surface px-4 py-3 text-body-medium text-ink file:mr-4 file:min-h-[32px] file:cursor-pointer file:rounded-full file:border-0 file:bg-accent-container file:px-4 file:py-1 file:text-body-small file:text-accent"
            data-testid="company-update-documents-input"
          />
          <p className="text-body-small text-ink-secondary">
            {t.documentsRemainingHint.replace(
              "{count}",
              String(remainingDocuments)
            )}
          </p>
        </div>
      ) : (
        <p className="text-body-small text-ink-secondary">
          {t.documentsLimitReached}
        </p>
      )}

      <ErrorMessage
        error={state ? errors[state.error] ?? errors.updateFailed : null}
        data-testid="company-update-error"
      />

      <SubmitButton
        className="min-h-[48px] w-full small:w-auto small:self-start"
        data-testid="company-update-submit"
      >
        {withRequisites ? t.resubmitSubmit : t.addDocumentsSubmit}
      </SubmitButton>
    </form>
  )
}

export default CompanyUpdateForm
