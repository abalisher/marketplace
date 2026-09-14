import { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCompany } from "@lib/data/company"
import { FEATURE_COMPANIES } from "@lib/feature-flags"
import { getServerMessages } from "@lib/i18n/server"
import CompanyApplicationForm from "@modules/account/components/company-application-form"
import CompanyCard from "@modules/account/components/company-card"

export const metadata: Metadata = {
  title: "Company",
  description: "Register your company and follow its moderation status.",
}

// Раздел «Компания»: пока заявки нет — форма регистрации юрлица, дальше —
// состояние модерации. Заказы связываются с компанией автоматически, как только
// она одобрена (бэкенд выводит компанию из цепочки покупатель → сотрудник).
export default async function CompanyPage() {
  // Юрлица заморожены на MVP (T10.9): страницы просто нет — ни пункта меню, ни
  // адреса. Флаг возвращает раздел целиком, экран не удалён.
  if (!FEATURE_COMPANIES) {
    notFound()
  }

  const [m, membership] = await Promise.all([
    getServerMessages(),
    retrieveCompany(),
  ])

  return (
    <div className="w-full" data-testid="company-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-heading-large">{m.account.company.title}</h1>
        <p className="text-body-large">
          {membership
            ? m.account.company.subtitleExisting
            : m.account.company.subtitle}
        </p>
      </div>
      {membership ? (
        <CompanyCard membership={membership} />
      ) : (
        <CompanyApplicationForm />
      )}
    </div>
  )
}
