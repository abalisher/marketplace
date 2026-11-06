"use client"

import { useEffect, useState } from "react"
import { LandingLocale, useLandingI18n } from "@lib/i18n/landing-i18n"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import TenantLogo from "./tenant-logo"
import {
  IconLocation,
  IconSparkles,
  IconWarehouse,
  IconWhatsApp,
} from "@modules/landing/components/icons"

const MOBILE_MENU_ID = "tenant-mobile-menu"

const LANGUAGES: { code: LandingLocale; label: string; title: string }[] = [
  { code: "ru", label: "РУС", title: "Русский язык" },
  { code: "kk", label: "ҚАЗ", title: "Қазақ тілі" },
]

export type TenantNavProps = {
  name: string
  logoUrl: string | null
  subtitle: string
  links: { name: string; href: string }[]
  city: string
  warehouse: string | null
  phone: { display: string; tel: string } | null
  whatsappHref: string | null
  labels: {
    cabinet: string
    openChat: string
    whatsapp: string
    call: string
    menu: string
  }
}

// Шапка страницы компании — по образцу шапки лендинга (полоса контактов +
// основная строка), но с контактами самой компании: её телефон и WhatsApp,
// её склад. Язык переключается тем же провайдером, что и на лендинге.
export default function TenantNav(props: TenantNavProps) {
  const { locale, setLocale } = useLandingI18n()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const languageSwitch = (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-line bg-surface text-[11px] font-bold">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setLocale(lang.code)}
          aria-pressed={locale === lang.code}
          lang={lang.code}
          title={lang.title}
          className={`px-2 py-0.5 rounded transition-colors ${
            locale === lang.code
              ? "bg-accent text-on-accent"
              : "text-ink-secondary hover:text-ink"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )

  return (
    <header className="sticky top-0 inset-x-0 z-50">
      <div className="hidden md:block bg-surface-dim border-b border-line text-[12px] text-ink-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 min-w-0">
            <span className="flex items-center gap-1.5 font-bold text-ink shrink-0">
              <IconLocation className="w-3.5 h-3.5 text-accent" />
              {props.city}
            </span>
            {props.warehouse && (
              <span className="flex items-center gap-1.5 truncate">
                <IconWarehouse className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="truncate">{props.warehouse}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {props.phone && (
              <a
                href={props.phone.tel}
                className="font-bold text-ink hover:text-accent transition-colors tabular-nums"
              >
                {props.phone.display}
              </a>
            )}
            {props.whatsappHref && (
              <a
                href={props.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-semibold text-success hover:underline"
              >
                <IconWhatsApp className="w-3.5 h-3.5" />
                {props.labels.whatsapp}
              </a>
            )}
            {languageSwitch}
          </div>
        </div>
      </div>

      <div
        className={`bg-surface/95 backdrop-blur-md border-b border-line transition-shadow ${
          scrolled ? "shadow-md shadow-scrim/5" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-[72px] flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            <TenantLogo
              name={props.name}
              logoUrl={props.logoUrl}
              className="w-11 h-11 rounded-xl text-lg"
            />
            <span className="min-w-0">
              <span className="block text-base md:text-lg font-bold text-ink truncate">
                {props.name}
              </span>
              <span className="block text-[11px] text-ink-secondary truncate">
                {props.subtitle}
              </span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-ink-secondary whitespace-nowrap">
            {props.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-accent transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <LocalizedClientLink
              href="/cabinet"
              className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl border border-line text-sm font-semibold text-ink hover:border-accent hover:text-accent transition-colors"
            >
              {props.labels.cabinet}
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/chat"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-on-accent text-sm font-bold hover:bg-accent-pressed transition-colors"
              data-testid="tenant-open-chat"
            >
              <IconSparkles className="w-4 h-4" />
              {props.labels.openChat}
            </LocalizedClientLink>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls={MOBILE_MENU_ID}
              aria-label={props.labels.menu}
              className="lg:hidden w-10 h-10 rounded-xl border border-line flex flex-col items-center justify-center gap-1"
            >
              <span className={`block w-4 h-0.5 bg-ink transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`block w-4 h-0.5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`block w-4 h-0.5 bg-ink transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {open && (
          <div
            id={MOBILE_MENU_ID}
            className="lg:hidden border-t border-line bg-surface px-4 py-4 space-y-1"
          >
            {props.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-ink hover:bg-surface-dim"
              >
                {link.name}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-3">
              {props.phone && (
                <a
                  href={props.phone.tel}
                  className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-line text-sm font-semibold text-ink"
                >
                  {props.labels.call}
                </a>
              )}
              {props.whatsappHref && (
                <a
                  href={props.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-success/40 text-sm font-semibold text-success"
                >
                  <IconWhatsApp className="w-4 h-4" />
                  {props.labels.whatsapp}
                </a>
              )}
              <LocalizedClientLink
                href="/cabinet"
                className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-line text-sm font-semibold text-ink"
              >
                {props.labels.cabinet}
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/chat"
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-accent text-on-accent text-sm font-bold"
              >
                <IconSparkles className="w-4 h-4" />
                {props.labels.openChat}
              </LocalizedClientLink>
            </div>
            <div className="pt-3 flex justify-center">{languageSwitch}</div>
          </div>
        )}
      </div>
    </header>
  )
}
