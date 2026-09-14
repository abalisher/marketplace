import { MAX_COMPANY_DOCUMENTS } from "@lib/company/document-limits"
import { CompanyMembership } from "@lib/data/company"
import { formatDate } from "@lib/i18n/format-date"
import { getServerMessages } from "@lib/i18n/server"
import { resolveLocale } from "@lib/i18n/resolve-locale"
import CompanyUpdateForm from "@modules/account/components/company-update-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@medusajs/ui"

// Цвет статуса заявки — токенами дизайн-системы: ожидание жёлтым, одобрение
// зелёным, отказ красным (те же три состояния, что видит модератор в панели).
const STATUS_TONE = {
  pending: "bg-warning/15 text-warning",
  approved: "bg-success/15 text-success",
  rejected: "bg-error/15 text-error",
} as const

// Состояние заявки юрлица: что уже проверено, что покупателю делать дальше и
// какие документы он приложил. Только показ — решения принимает модератор.
const CompanyCard = async ({
  membership,
}: {
  membership: CompanyMembership
}) => {
  const [m, locale] = await Promise.all([getServerMessages(), resolveLocale()])
  const { company, employee } = membership
  const t = m.account.company

  const statusLabel = {
    pending: t.statusPending,
    approved: t.statusApproved,
    rejected: t.statusRejected,
  }[company.status]

  const note = {
    pending: t.pendingNote,
    approved: t.approvedNote,
    rejected: t.rejectedNote,
  }[company.status]

  const appliedAt = company.created_at
    ? formatDate(company.created_at, locale)
    : null

  const resubmittedAt = company.resubmitted_at
    ? formatDate(company.resubmitted_at, locale)
    : null

  // Правку показываем, пока модерация не завершена одобрением: у одобренной
  // компании реквизиты закрыты, а документы уже приняты. Свободные места под
  // документы считаем от общего лимита компании — его держит бэкенд.
  const remainingDocuments =
    MAX_COMPANY_DOCUMENTS - (company.documents?.length ?? 0)
  const canUpdate =
    company.status === "rejected" ||
    (company.status === "pending" && remainingDocuments > 0)

  return (
    <div
      className="flex w-full flex-col gap-y-6 rounded-card border border-line p-6"
      data-testid="company-card"
    >
      <div className="flex flex-col gap-3 small:flex-row small:items-start small:justify-between">
        <div className="flex flex-col gap-y-1">
          <span className="text-title-medium" data-testid="company-name">
            {company.name}
          </span>
          <span className="text-body-medium text-ink-secondary">
            {t.binShort} {company.bin}
          </span>
        </div>
        <span
          className={clx(
            "w-fit rounded-full px-3 py-1 text-body-small font-semibold",
            STATUS_TONE[company.status]
          )}
          data-testid="company-status"
          data-value={company.status}
        >
          {statusLabel}
        </span>
      </div>

      <p className="text-body-medium text-ink">{note}</p>

      {company.status === "rejected" && company.rejection_reason && (
        <div className="flex flex-col gap-y-1 rounded-card bg-surface-dim p-4">
          <span className="text-body-small text-ink-secondary">
            {t.rejectionReason}
          </span>
          <span
            className="text-body-medium text-ink"
            data-testid="company-rejection-reason"
          >
            {company.rejection_reason}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-y-2 border-t border-line pt-4 text-body-medium">
        {appliedAt && (
          <div className="flex justify-between gap-4">
            <span className="text-ink-secondary">{t.appliedAt}</span>
            <span className="text-ink" data-testid="company-applied-at">
              {appliedAt}
            </span>
          </div>
        )}
        {resubmittedAt && (
          <div className="flex justify-between gap-4">
            <span className="text-ink-secondary">{t.resubmittedAt}</span>
            <span className="text-ink" data-testid="company-resubmitted-at">
              {resubmittedAt}
            </span>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <span className="text-ink-secondary">{t.roleLabel}</span>
          <span className="text-ink">
            {employee.role === "admin" ? t.roleAdmin : t.roleMember}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-y-2">
        <span className="text-body-medium text-ink">{t.attachedDocuments}</span>
        {company.documents?.length ? (
          <ul className="flex flex-col gap-y-1" data-testid="company-documents">
            {company.documents.map((document) => (
              <li key={document.url}>
                <a
                  href={document.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[48px] items-center text-body-medium text-accent hover:text-accent-pressed"
                >
                  {document.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-small text-ink-secondary">{t.noDocuments}</p>
        )}
      </div>

      {canUpdate && (
        <CompanyUpdateForm
          company={company}
          remainingDocuments={remainingDocuments}
        />
      )}

      {company.status === "approved" ? (
        <LocalizedClientLink
          href="/chat"
          className="inline-flex min-h-[48px] w-fit items-center rounded-full bg-accent px-6 text-body-medium font-semibold text-on-accent hover:bg-accent-pressed"
          data-testid="company-go-to-chat"
        >
          {t.goToChat}
        </LocalizedClientLink>
      ) : (
        <LocalizedClientLink
          href="/customer-service"
          className="inline-flex min-h-[48px] w-fit items-center text-body-medium text-accent hover:text-accent-pressed"
          data-testid="company-support-link"
        >
          {t.support}
        </LocalizedClientLink>
      )}
    </div>
  )
}

export default CompanyCard
