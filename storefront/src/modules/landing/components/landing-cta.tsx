"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import KaspiLogo from "@modules/landing/components/kaspi-logo"
import { useLandingI18n } from "@lib/i18n/landing-i18n"
import {
  IconBot,
  IconZap,
  IconWarehouse,
  IconDocument,
} from "@modules/landing/components/icons"

export default function LandingCta() {
  const { locale, t } = useLandingI18n()

  return (
    <section className="py-20 md:py-24 bg-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-accent via-accent-pressed to-accent text-on-accent p-8 sm:p-14 lg:p-16 overflow-hidden shadow-xl shadow-accent/20">
          {/* Engineering subtle grid pattern overlay */}
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(rgb(var(--sm-on-accent)/0.15)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          {/* Ambient Glows inside banner */}
          <div aria-hidden="true" className="absolute -top-24 -right-24 w-96 h-96 bg-on-accent/10 rounded-full blur-2xl pointer-events-none" />
          <div aria-hidden="true" className="absolute -bottom-24 -left-24 w-80 h-80 bg-kaspi/25 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-on-accent/15 text-on-accent text-xs font-semibold mb-6 border border-on-accent/20 backdrop-blur-sm">
              <IconZap className="w-3.5 h-3.5 text-on-accent" />
              <span>{t.cta.badge}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-accent tracking-tight mb-6 leading-tight">
              {t.cta.title}
            </h2>

            <p className="text-sm sm:text-base lg:text-lg text-on-accent/90 leading-relaxed mb-10 max-w-2xl mx-auto">
              {t.cta.desc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <LocalizedClientLink
                href={`/chat?prompt=${encodeURIComponent(
                  locale === "kk"
                    ? "Сәлеметсіз бе! Менің нысаныма құрылыс материалдарының толық сметасын есептеп, Астана қоймаларынан жедел жеткізуді ұйымдастыруға көмектесіңіз."
                    : "Здравствуйте! Помогите составить смету на черновые стройматериалы и организовать поставку со складов Астаны с гарантией качества."
                )}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm sm:text-base font-extrabold text-accent bg-surface hover:bg-surface-dim shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all group"
              >
                <IconBot className="w-5 h-5 text-accent" />
                <span>{t.cta.btnAi}</span>
                <svg
                  aria-hidden="true"
                  focusable="false"
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </LocalizedClientLink>

              <LocalizedClientLink
                href="/cabinet/profile"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm sm:text-base font-semibold text-on-accent bg-on-accent/10 hover:bg-on-accent/20 border border-on-accent/25 backdrop-blur-sm transition-all"
              >
                <span>{t.cta.btnCabinet}</span>
              </LocalizedClientLink>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-on-accent/85 font-medium">
              <span className="flex items-center gap-1.5">
                <IconWarehouse className="w-4 h-4 text-on-accent" />
                <span>{t.cta.tagWarehouses}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <KaspiLogo size={16} />
                <span>{t.cta.tagKaspi}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <IconDocument className="w-4 h-4 text-on-accent" />
                <span>{t.cta.tagVat}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
