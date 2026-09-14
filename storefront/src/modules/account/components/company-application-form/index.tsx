"use client"

import {
  COMPANY_DOCUMENT_MIME_TYPES,
  MAX_COMPANY_DOCUMENTS,
} from "@lib/company/document-limits"
import { submitCompanyApplication } from "@lib/data/company"
import { useMessages } from "@lib/i18n/i18n-context"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

// Заявка на регистрацию юрлица: название, БИН и учредительные документы
// файлами. Проверки и модерацию делает бэкенд — форма лишь собирает данные и
// переводит код ошибки в текст (server action отдаёт код, не готовую фразу).
const CompanyApplicationForm = () => {
  const m = useMessages()
  const [state, formAction] = useActionState(submitCompanyApplication, null)

  const errors = m.account.company.errors as Record<string, string>

  return (
    <form
      className="flex w-full flex-col gap-y-6"
      action={formAction}
      data-testid="company-application-form"
    >
      <div className="flex flex-col gap-y-2">
        <Input
          label={m.account.company.name}
          name="name"
          required
          autoComplete="organization"
          defaultValue={state?.values.name}
          data-testid="company-name-input"
        />
        <Input
          label={m.account.company.bin}
          name="bin"
          required
          inputMode="numeric"
          pattern="\d{12}"
          maxLength={12}
          defaultValue={state?.values.bin}
          data-testid="company-bin-input"
        />
        <p className="text-body-small text-ink-secondary">
          {m.account.company.binHint}
        </p>
      </div>

      <div className="flex flex-col gap-y-2">
        <span className="text-body-medium text-ink">
          {m.account.company.documents}
        </span>
        <input
          type="file"
          name="documents"
          multiple
          accept={COMPANY_DOCUMENT_MIME_TYPES.join(",")}
          className="min-h-[48px] w-full cursor-pointer rounded-card border border-line bg-surface px-4 py-3 text-body-medium text-ink file:mr-4 file:min-h-[32px] file:cursor-pointer file:rounded-full file:border-0 file:bg-accent-container file:px-4 file:py-1 file:text-body-small file:text-accent"
          data-testid="company-documents-input"
        />
        <p className="text-body-small text-ink-secondary">
          {m.account.company.documentsHint.replace(
            "{count}",
            String(MAX_COMPANY_DOCUMENTS)
          )}
        </p>
      </div>

      <ErrorMessage
        error={state ? errors[state.error] ?? errors.submitFailed : null}
        data-testid="company-application-error"
      />

      <SubmitButton
        className="min-h-[48px] w-full small:w-auto small:self-start"
        data-testid="company-application-submit"
      >
        {m.account.company.submit}
      </SubmitButton>
    </form>
  )
}

export default CompanyApplicationForm
