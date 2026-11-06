"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { IconSparkles, IconLocation, IconClock, IconCart } from "./icons"
import { useLandingI18n, LandingLocale } from "@lib/i18n/landing-i18n"
import { LANDING_PHONE, landingWhatsAppHref } from "@modules/landing/contacts"

const MOBILE_MENU_ID = "landing-mobile-menu"

// Кнопки языка лендинга: подписи — на самом языке (как LOCALE_LABELS витрины).
const LANGUAGES: { code: LandingLocale; label: string; title: string }[] = [
  { code: "ru", label: "РУС", title: "Русский язык" },
  { code: "kk", label: "ҚАЗ", title: "Қазақ тілі" },
]

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { locale, setLocale, t } = useLandingI18n()

  const chatPrompt =
    locale === "kk"
      ? "Сәлем, AI-Прораб! Менің нысаныма қара сылақ материалдарын таңдап, сметасын есептеуге көмектес."
      : "Привет, AI-Прораб! Помоги подобрать черновые стройматериалы и рассчитать смету с доставкой в Астане."

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: t.nav.workflow, href: "#how-it-works" },
    { name: t.nav.suppliers, href: "#supplier-benefits" },
    { name: t.nav.calculator, href: "#calculator" },
    { name: t.nav.delivery, href: "#delivery" },
    { name: t.nav.faq, href: "#faq" },
  ]

  return (
    <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300">
      {/* 1. Top Commercial Utility Bar */}
      <div className="bg-surface-dim/95 backdrop-blur-md border-b border-line text-[12px] text-ink-secondary hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
          {/* Left: City badge & Warehouse hours */}
          <div className="flex items-center gap-5">
            {/* Clean static city indicator (no dropdown) */}
            <div className="flex items-center gap-1.5 font-bold text-ink">
              <IconLocation className="w-3.5 h-3.5 text-accent" />
              <span>{t.nav.city}</span>
            </div>

            {/* Warehouse schedule */}
            <div className="flex items-center gap-1.5 text-ink-secondary">
              <IconClock className="w-3.5 h-3.5 text-accent" />
              <span>{t.nav.warehouseSchedule}</span>
            </div>
          </div>

          {/* Right: Phone, WhatsApp, Kaspi & Language Switcher */}
          <div className="flex items-center gap-4 lg:gap-6">
            <a
              href={LANDING_PHONE.tel}
              className="font-bold text-ink hover:text-accent transition-colors hidden lg:inline-flex items-center gap-1"
            >
              <span aria-hidden="true">📞</span>
              <span>{LANDING_PHONE.display}</span>
            </a>

            <a
              href={landingWhatsAppHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#25D366] hover:underline"
            >
              <span>{t.nav.whatsapp}</span>
            </a>

            <span className="h-3 w-px bg-line" aria-hidden="true" />

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-accent-container text-accent border border-accent/20">
                Kaspi 0-0-12
              </span>
              <span className="text-[11px] font-medium text-ink-secondary hidden xl:inline">
                {t.nav.vatBadge}
              </span>
            </div>

            {/* Active Interactive Language Switcher */}
            <div
              role="group"
              aria-label={t.nav.languageLabel}
              className="flex items-center gap-1 bg-surface border border-line rounded-lg p-0.5 text-[11px] font-bold"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLocale(lang.code)}
                  aria-pressed={locale === lang.code}
                  lang={lang.code}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    locale === lang.code
                      ? "bg-accent text-on-accent shadow-sm"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                  title={lang.title}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Commercial Header */}
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-surface/95 backdrop-blur-md shadow-sm border-b border-line py-2.5"
            : "bg-surface/85 backdrop-blur-md border-b border-line/60 py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 lg:gap-6">
          {/* Brand Logo with Engineering Mark */}
          <div className="flex items-center shrink-0">
            <LocalizedClientLink
              href="/landing"
              className="flex items-center gap-2.5 sm:gap-3 group"
            >
              <img
                src="/brand-logo.png"
                alt="СтройМаркет"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-sm group-hover:scale-105 transition-all object-contain shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-ink">
                    СТРОЙ<span className="text-accent font-black">МАРКЕТ</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-dim border border-line text-ink-secondary uppercase tracking-wider">
                    {t.nav.cityShort}
                  </span>
                </div>
                <div className="text-[11px] text-ink-secondary hidden sm:block">
                  {t.nav.warehousesOpen}
                </div>
              </div>
            </LocalizedClientLink>
          </div>

          {/* Desktop Navigation Links (Centered) */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-8 text-sm font-medium text-ink-secondary">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-accent whitespace-nowrap transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action Buttons: Estimate Cart & AI Chat CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Quick Estimate / Cart Button */}
            <a
              href="#calculator"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-ink hover:text-accent rounded-xl bg-surface-dim hover:bg-surface border border-line transition-all"
              title={t.nav.estimateHint}
              aria-label={t.nav.estimateHint}
            >
              <IconCart className="w-4 h-4 text-accent" />
              <span className="hidden sm:inline">{t.nav.estimate}</span>
              <span
                aria-hidden="true"
                className="w-4 h-4 rounded-full bg-accent text-on-accent text-[10px] font-bold flex items-center justify-center"
              >
                0
              </span>
            </a>

            {/* Primary CTA: Launch AI Chat */}
            <LocalizedClientLink
              href={`/chat?prompt=${encodeURIComponent(chatPrompt)}`}
              className="relative inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-on-accent bg-accent hover:bg-accent-pressed shadow-md shadow-accent/25 hover:shadow-lg transition-all group overflow-hidden"
            >
              <IconSparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>{t.nav.aiForeman}</span>
            </LocalizedClientLink>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-ink-secondary hover:text-ink hover:bg-surface-dim border border-line"
              aria-label={mobileMenuOpen ? t.nav.menuClose : t.nav.menuOpen}
              aria-expanded={mobileMenuOpen}
              aria-controls={MOBILE_MENU_ID}
            >
              <svg
                aria-hidden="true"
                focusable="false"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            id={MOBILE_MENU_ID}
            className="lg:hidden bg-surface border-b border-line px-4 pt-3 pb-5 space-y-2 shadow-lg motion-safe:animate-fade-in"
          >
            <div className="pb-2 border-b border-line text-xs flex items-center justify-between text-ink-secondary">
              <span className="flex items-center gap-1 font-semibold text-ink">
                <IconLocation className="w-3.5 h-3.5 text-accent" />
                {t.nav.city}
              </span>
              {/* Mobile Language Switcher */}
              <div
                role="group"
                aria-label={t.nav.languageLabel}
                className="flex items-center gap-1 bg-surface-dim border border-line rounded-lg p-0.5 text-[10px] font-bold"
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLocale(lang.code)}
                    aria-pressed={locale === lang.code}
                    lang={lang.code}
                    className={`px-2 py-0.5 rounded transition-all ${
                      locale === lang.code
                        ? "bg-accent text-on-accent"
                        : "text-ink-secondary hover:text-ink"
                    }`}
                    title={lang.title}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-ink hover:text-accent hover:bg-surface-dim rounded-lg"
              >
                {link.name}
              </a>
            ))}

            <div className="pt-3 border-t border-line flex flex-col gap-2">
              <a
                href={landingWhatsAppHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-[#25D366] rounded-xl bg-surface-dim border border-line"
              >
                <span>{t.nav.whatsappWrite}</span>
              </a>
              <LocalizedClientLink
                href={`/chat?prompt=${encodeURIComponent(chatPrompt)}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-on-accent bg-accent rounded-xl shadow-sm"
              >
                <IconSparkles className="w-4 h-4" />
                <span>{t.nav.openChat}</span>
              </LocalizedClientLink>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
