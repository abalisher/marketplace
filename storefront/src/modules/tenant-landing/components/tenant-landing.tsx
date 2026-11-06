import {
  StorefrontTenant,
  TenantChatExampleLine,
  TenantShowcaseItem,
  TenantTransparency,
} from "@lib/data/tenant"
import { getServerMessages } from "@lib/i18n/server"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  IconClock,
  IconDocument,
  IconMapPin,
  IconSack,
  IconShieldCheck,
  IconSparkles,
  IconTruck,
  IconWhatsApp,
} from "@modules/landing/components/icons"
import KaspiLogo from "@modules/landing/components/kaspi-logo"
import LandingCalculator from "@modules/landing/components/landing-calculator"
import LandingDelivery from "@modules/landing/components/landing-delivery"
import LandingFloatingAi from "@modules/landing/components/landing-floating-ai"
import LandingHowItWorks from "@modules/landing/components/landing-how-it-works"
import TenantChatPreview from "./tenant-chat-preview"
import TenantLogo from "./tenant-logo"
import TenantNav from "./tenant-nav"
import TenantShowcase from "./tenant-showcase"
import TenantTransparencyBlock from "./tenant-transparency"

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""))

// Дата обновления остатков в плашке — коротко и цифрами («28.09»): полная
// дата не помещается в треть карточки.
const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Almaty",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value))

// Номер компании для tel: и wa.me. Казахстанский номер «8 701…» приводим к 7.
const phoneLinks = (phone: string | null, greeting: string) => {
  const digits = (phone ?? "").replace(/\D/g, "").replace(/^8(\d{10})$/, "7$1")
  if (digits.length < 10) {
    return { phone: null, whatsapp: null }
  }
  return {
    phone: { display: phone!, tel: `tel:+${digits}` },
    whatsapp: `https://wa.me/${digits}?text=${encodeURIComponent(greeting)}`,
  }
}

// Страница компании-продавца в визуале лендинга площадки: её контакты, живой
// ассортимент и учёт склада, общие секции лендинга (процесс заказа,
// калькулятор, доставка) и реквизиты. Всё о компании — из живых данных
// бэкенда; выдуманных цифр нет. Маршрут оборачивает страницу в
// LandingI18nProvider — им пользуются общие секции и переключатель языка.
// Справа в первом экране — карточка чата с настоящим расчётом из каталога
// компании, цифры компании — полосой под ним.
const TenantLanding = async ({
  tenant,
  transparency,
  showcase,
  chatExample,
}: {
  tenant: StorefrontTenant
  transparency: TenantTransparency | null
  showcase: TenantShowcaseItem[]
  chatExample: TenantChatExampleLine[]
}) => {
  const m = await getServerMessages()
  const t = m.tenant
  const prompts = [t.prompts.screed, t.prompts.plaster, t.prompts.delivery]
  const contacts = phoneLinks(
    tenant.phone,
    fill(t.whatsappGreeting, { name: tenant.name })
  )
  const warehouse = transparency?.locations[0] ?? null
  const inStock = showcase.filter((item) => item.available).length

  const links = [
    { name: t.navMore.assortment, href: "#assortment" },
    { name: t.navMore.calculator, href: "#calculator" },
    { name: t.nav.transparency, href: "#transparency" },
    { name: t.navMore.delivery, href: "#delivery" },
    { name: t.footer.contacts, href: "#contacts" },
  ]

  // «0 позиций в наличии» отпугивает сильнее, чем пустое место: плашку с
  // нулём не показываем, сетка подстраивается под число плашек.
  const stats = [
    ...(inStock > 0
      ? [
          {
            icon: <IconSack className="w-5 h-5" />,
            value: String(inStock),
            label: t.stats.inStock,
          },
        ]
      : []),
    {
      icon: <IconTruck className="w-5 h-5" />,
      value:
        tenant.delivery_price != null
          ? convertToLocale({ amount: tenant.delivery_price, currency_code: "kzt" })
          : "—",
      label: t.stats.delivery,
    },
    ...(transparency?.stock.updated_at
      ? [
          {
            icon: <IconClock className="w-5 h-5" />,
            value: formatShortDate(transparency.stock.updated_at),
            label: t.stats.updated,
          },
        ]
      : []),
  ]

  const statColumns =
    ["", "", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4"][stats.length + 1]
  const [titleBefore, titleAfter] = t.heroTitle.split("{name}").map((part) => part.trim())

  const facts = [
    { icon: <IconDocument className="w-4 h-4" />, text: t.facts.documents },
    { icon: <IconShieldCheck className="w-4 h-4" />, text: t.facts.code },
    ...(tenant.address
      ? [{ icon: <IconMapPin className="w-4 h-4" />, text: tenant.address }]
      : []),
  ]

  const requisites = [
    [t.bin, tenant.bin],
    [t.address, tenant.address],
    [t.email, tenant.email],
  ].filter((row): row is [string, string] => !!row[1])

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink">
      <TenantNav
        name={tenant.name}
        logoUrl={tenant.logo_url}
        subtitle={t.badge}
        links={links}
        city={t.city}
        warehouse={warehouse ? fill(t.warehouse, { name: warehouse }) : null}
        phone={contacts.phone}
        whatsappHref={contacts.whatsapp}
        labels={{
          cabinet: t.cabinet,
          openChat: t.openChat,
          whatsapp: t.whatsapp,
          call: t.call,
          menu: t.menu,
        }}
      />

      <main id="top" className="flex-1">
        <section className="relative pt-12 pb-16 md:pt-20 lg:pt-24 md:pb-24 overflow-hidden bg-gradient-to-b from-surface-dim via-surface to-surface border-b border-line">
          <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[520px] bg-[radial-gradient(ellipse_85%_65%_at_50%_-15%,rgb(var(--sm-accent)/0.14),transparent_70%)] pointer-events-none" />
          <div aria-hidden="true" className="absolute top-24 right-0 w-[520px] h-[520px] bg-accent/8 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-7">
                {/* Подпись «Продавец площадки…» уже стоит под логотипом в
                    шапке — над заголовком её не повторяем. Название без
                    переносов: «NUR-STROI» иначе рвался по дефису. */}
                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-ink tracking-tight leading-tight mb-5">
                  {titleBefore && `${titleBefore} `}
                  <span className="whitespace-nowrap text-accent">{tenant.name}</span>
                  {titleAfter && ` ${titleAfter}`}
                </h1>
                <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-xl mb-8">
                  {t.heroText}
                </p>

                <div className="flex flex-wrap gap-3 mb-7">
                  <LocalizedClientLink
                    href="/chat"
                    className="inline-flex min-h-[48px] items-center gap-2 px-6 rounded-xl bg-accent text-on-accent text-base font-semibold hover:bg-accent-pressed transition-colors"
                  >
                    <IconSparkles className="w-4 h-4" />
                    {t.openChat}
                  </LocalizedClientLink>
                  {contacts.whatsapp && (
                    <a
                      href={contacts.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[48px] items-center gap-2 px-6 rounded-xl border border-line bg-surface text-base font-semibold text-ink hover:border-success hover:text-success transition-colors"
                    >
                      <IconWhatsApp className="w-4 h-4 text-success" />
                      {t.whatsapp}
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {prompts.map((prompt) => (
                    <LocalizedClientLink
                      key={prompt}
                      href={`/chat?prompt=${encodeURIComponent(prompt)}`}
                      className="rounded-lg border border-line bg-surface px-3.5 py-2 text-sm text-ink-secondary transition-colors hover:border-accent hover:text-accent"
                    >
                      {prompt}
                    </LocalizedClientLink>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <TenantChatPreview
                  name={tenant.name}
                  logoUrl={tenant.logo_url}
                  lines={chatExample}
                  deliveryPrice={tenant.delivery_price}
                  t={t.chat}
                />
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-line/80">
              <div className={`grid grid-cols-2 ${statColumns} gap-4`}>
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-dim/60 border border-line/60"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent-container text-accent flex items-center justify-center shrink-0">
                      {stat.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-base sm:text-lg font-bold text-ink leading-tight tabular-nums">
                        {stat.value}
                      </div>
                      <div className="text-xs text-ink-secondary">{stat.label}</div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-dim/60 border border-line/60">
                  <div className="w-10 h-10 rounded-lg bg-kaspi/10 flex items-center justify-center shrink-0">
                    <KaspiLogo size={24} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base sm:text-lg font-bold text-ink leading-tight">
                      Kaspi QR
                    </div>
                    <div className="text-xs text-ink-secondary">{t.stats.kaspi}</div>
                  </div>
                </div>
              </div>
              <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-ink-secondary">
                {facts.map((fact) => (
                  <li key={fact.text} className="flex items-center gap-2">
                    <span className="text-accent">{fact.icon}</span>
                    {fact.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <TenantShowcase tenant={tenant} items={showcase} m={m} />

        <LandingHowItWorks showSupplierLink={false} quiet />

        <LandingCalculator quiet />

        <TenantTransparencyBlock tenant={tenant} data={transparency} m={m} />

        <LandingDelivery description={t.deliveryText} quiet />

        <section className="py-16 md:py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent-container via-surface to-surface p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div
                aria-hidden="true"
                className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none"
              />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 max-w-3xl">
                <TenantLogo
                  name={tenant.name}
                  logoUrl={tenant.logo_url}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-3xl shadow-md shadow-accent/10"
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mb-2">
                    {t.cta.title}
                  </h2>
                  <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
                    {t.cta.text}
                  </p>
                </div>
              </div>
              <div className="relative flex flex-col sm:flex-row gap-3 shrink-0">
                <LocalizedClientLink
                  href="/chat"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 px-5 rounded-xl bg-accent text-on-accent text-sm font-semibold hover:bg-accent-pressed transition-colors"
                >
                  <IconSparkles className="w-4 h-4" />
                  {t.cta.chat}
                </LocalizedClientLink>
                {contacts.whatsapp && (
                  <a
                    href={contacts.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 px-5 rounded-xl border border-line bg-surface text-sm font-semibold text-ink hover:border-success hover:text-success transition-colors"
                  >
                    <IconWhatsApp className="w-5 h-5 text-success" />
                    {t.whatsapp}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        id="contacts"
        className="scroll-mt-28 bg-surface-dim border-t border-line"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-sm">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <TenantLogo
                name={tenant.name}
                logoUrl={tenant.logo_url}
                className="w-12 h-12 rounded-xl text-xl"
              />
              <div className="text-lg font-bold text-ink">{tenant.name}</div>
            </div>
            <p className="text-ink-secondary leading-relaxed max-w-md">
              {t.footer.platform}
            </p>
            {requisites.length > 0 && (
              <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 pt-2 text-xs">
                {requisites.map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-ink-secondary">{label}</dt>
                    <dd className="text-ink break-words">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-3">
              {t.footer.contacts}
            </div>
            <ul className="space-y-2">
              {contacts.phone && (
                <li>
                  <a
                    href={contacts.phone.tel}
                    className="font-bold text-ink hover:text-accent tabular-nums"
                  >
                    {contacts.phone.display}
                  </a>
                </li>
              )}
              {contacts.whatsapp && (
                <li>
                  <a
                    href={contacts.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-success font-semibold hover:underline"
                  >
                    <IconWhatsApp className="w-4 h-4" />
                    {t.whatsapp}
                  </a>
                </li>
              )}
              {tenant.email && (
                <li>
                  <a
                    href={`mailto:${tenant.email}`}
                    className="text-ink hover:text-accent break-all"
                  >
                    {tenant.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-3">
              {t.footer.sections}
            </div>
            <ul className="space-y-2">
              {links.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-ink hover:text-accent">
                    {link.name}
                  </a>
                </li>
              ))}
              <li>
                <LocalizedClientLink href="/cabinet" className="text-ink hover:text-accent">
                  {t.cabinet}
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-ink-secondary">
            <span>
              © {new Date().getFullYear()} {tenant.name}
            </span>
            <span>{t.badge}</span>
          </div>
        </div>
      </footer>

      <LandingFloatingAi />
    </div>
  )
}

export default TenantLanding
