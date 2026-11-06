import { getRegion } from "@lib/data/regions"
import {
  listTenantShowcase,
  retrieveTenant,
  retrieveTenantChatExample,
  retrieveTenantTransparency,
} from "@lib/data/tenant"
import { LandingI18nProvider } from "@lib/i18n/landing-i18n"
import { resolveLocale } from "@lib/i18n/resolve-locale"
import TenantLanding from "@modules/tenant-landing/components/tenant-landing"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = { params: Promise<{ slug: string; countryCode: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const tenant = await retrieveTenant(slug)
  return tenant ? { title: tenant.name } : {}
}

// Витрина компании-продавца (мультипродавец): /<cc>/t/<slug>. Компанию на сессию
// запоминает middleware; чат и кабинет после этой страницы работают от её имени.
// Неизвестная или приостановленная компания — 404.
export default async function TenantPage(props: Props) {
  const { slug, countryCode } = await props.params
  const [tenant, transparency, locale, region] = await Promise.all([
    retrieveTenant(slug),
    retrieveTenantTransparency(slug),
    resolveLocale(),
    getRegion(countryCode),
  ])
  if (!tenant) {
    notFound()
  }
  const [showcase, chatExample] = await Promise.all([
    listTenantShowcase(tenant, region?.id),
    retrieveTenantChatExample(tenant, region?.id),
  ])
  return (
    <LandingI18nProvider initialLocale={locale}>
      <TenantLanding
        tenant={tenant}
        transparency={transparency}
        showcase={showcase}
        chatExample={chatExample}
      />
    </LandingI18nProvider>
  )
}
