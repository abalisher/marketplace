"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import KaspiLogo from "@modules/landing/components/kaspi-logo"
import { useLandingI18n } from "@lib/i18n/landing-i18n"
import {
  IconChevronDown,
  IconBot,
  IconWhatsApp,
} from "@modules/landing/components/icons"
import { landingWhatsAppHref } from "@modules/landing/contacts"

type FaqCategory = "all" | "payment" | "delivery" | "calc"

export default function LandingFaq() {
  const { locale, t } = useLandingI18n()
  const [activeCategory, setActiveCategory] = useState<FaqCategory>("all")
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const filteredFaqs =
    activeCategory === "all"
      ? t.faq.items
      : t.faq.items.filter((f) => f.category === activeCategory)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="scroll-mt-20 md:scroll-mt-28 py-20 md:py-28 bg-surface-dim border-b border-line">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-container text-accent text-xs font-bold uppercase tracking-wider mb-3.5">
            {t.faq.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight mb-4">
            {t.faq.title}
          </h2>
          <p className="text-base sm:text-lg text-ink-secondary max-w-2xl mx-auto">
            {t.faq.desc}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          <button
            type="button"
            onClick={() => {
              setActiveCategory("all")
              setOpenIndex(0)
            }}
            aria-pressed={activeCategory === "all"}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-accent text-on-accent shadow-sm"
                : "bg-surface border border-line text-ink-secondary hover:text-ink hover:border-accent/40"
            }`}
          >
            {t.faq.filterAll}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("payment")
              setOpenIndex(0)
            }}
            aria-pressed={activeCategory === "payment"}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeCategory === "payment"
                ? "bg-accent text-on-accent shadow-sm"
                : "bg-surface border border-line text-ink-secondary hover:text-ink hover:border-accent/40"
            }`}
          >
            <KaspiLogo size={16} />
            <span>{t.faq.filterPayment}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("delivery")
              setOpenIndex(0)
            }}
            aria-pressed={activeCategory === "delivery"}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeCategory === "delivery"
                ? "bg-accent text-on-accent shadow-sm"
                : "bg-surface border border-line text-ink-secondary hover:text-ink hover:border-accent/40"
            }`}
          >
            {t.faq.filterDelivery}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("calc")
              setOpenIndex(0)
            }}
            aria-pressed={activeCategory === "calc"}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeCategory === "calc"
                ? "bg-accent text-on-accent shadow-sm"
                : "bg-surface border border-line text-ink-secondary hover:text-ink hover:border-accent/40"
            }`}
          >
            {t.faq.filterCalc}
          </button>
        </div>

        {/* Accordion List */}
        <div className="space-y-4 mb-16">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            const buttonId = `landing-faq-q-${idx}`
            const panelId = `landing-faq-a-${idx}`
            return (
              <div
                key={idx}
                className="bg-surface rounded-2xl border border-line overflow-hidden transition-all shadow-sm hover:border-accent/40"
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => toggle(idx)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="w-full py-5 sm:py-6 px-6 sm:px-8 text-left flex items-center justify-between gap-4 hover:bg-surface-dim/40 transition-colors cursor-pointer"
                  >
                    <span className="text-base sm:text-lg font-bold text-ink leading-snug pr-2">
                      {faq.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`w-9 h-9 rounded-xl bg-surface-dim border border-line flex items-center justify-center text-accent transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 bg-accent text-on-accent border-accent" : ""
                      }`}
                    >
                      <IconChevronDown className="w-5 h-5" />
                    </span>
                  </button>
                </h3>

                {/* Панель рендерится всегда (hidden), чтобы aria-controls
                    кнопки указывал на существующий элемент. */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="px-6 sm:px-8 pb-6 pt-2 text-sm sm:text-base text-ink-secondary leading-relaxed border-t border-line/50 motion-safe:animate-fade-in"
                >
                  <p>{faq.a}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Help Banner */}
        <div className="p-7 sm:p-9 rounded-2xl bg-surface border border-line/90 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-ink">
              {t.faq.helpTitle}
            </h3>
            <p className="text-sm text-ink-secondary mt-1">
              {t.faq.helpDesc}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <LocalizedClientLink
              href={`/chat?prompt=${encodeURIComponent(
                locale === "kk"
                  ? "Сәлеметсіз бе! Менде қара сылақ материалдары мен Астана бойынша жеткізу шарттары туралы сұрақ бар, кеңес беріңізші."
                  : "Здравствуйте! У меня есть вопросы по черновым стройматериалам, расчету сметы и доставке в Астане. Проконсультируйте, пожалуйста."
              )}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-on-accent font-bold text-sm hover:bg-accent-pressed transition-colors shadow-sm"
            >
              <IconBot className="w-4 h-4" />
              <span>{t.faq.helpChat}</span>
            </LocalizedClientLink>
            <a
              href={landingWhatsAppHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20BA5C] text-white font-bold text-sm transition-all hover:shadow-md hover:scale-[1.02] shadow-sm group"
            >
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <IconWhatsApp className="w-3.5 h-3.5 text-[#25D366]" />
              </div>
              <span className="tracking-wide">{t.faq.helpWhatsapp}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
