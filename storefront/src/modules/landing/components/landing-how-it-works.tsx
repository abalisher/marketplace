"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import KaspiLogo from "@modules/landing/components/kaspi-logo"
import { useLandingI18n } from "@lib/i18n/landing-i18n"
import {
  IconMicrophone,
  IconWaveform,
  IconSparkles,
  IconWarehouse,
  IconTruck,
  IconMapPin,
  IconBot,
  IconCheckSmall,
} from "@modules/landing/components/icons"

const QUIET_H2 =
  "text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-3 leading-tight"

// showSupplierLink — ссылка на блок «для поставщиков», которого нет на
// странице компании.
// quiet — спокойный заголовок секции для страницы компании (меньше и не
// «чёрный» кегль); лендинг площадки остаётся как есть.
export default function LandingHowItWorks({
  showSupplierLink = true,
  quiet = false,
}: { showSupplierLink?: boolean; quiet?: boolean } = {}) {
  const { locale, t } = useLandingI18n()
  const [activeStep, setActiveStep] = useState(0)

  const stepIcons = [
    IconMicrophone,
    IconSparkles,
    IconWarehouse,
    IconTruck,
    IconMapPin,
  ]

  const pipelineStages = locale === "kk" ? [
    "1. Өтінім",
    "2. Төлем",
    "3. Қойма",
    "4. Тиеу",
    "5. Жеткізу",
  ] : [
    "1. Заявка",
    "2. Оплата",
    "3. Склад",
    "4. Погрузка",
    "5. Доставка",
  ]

  return (
    <section id="how-it-works" className="scroll-mt-20 md:scroll-mt-28 py-20 md:py-28 bg-surface-dim border-b border-line relative overflow-hidden">
      {/* Blueprint grid accent backdrop */}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(rgb(var(--sm-accent))_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div aria-hidden="true" className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-container text-accent text-xs font-bold uppercase tracking-wider mb-3">
            <span aria-hidden="true" className={`w-2 h-2 rounded-full bg-accent ${quiet ? "" : "animate-ping"}`} />
            <span>{t.howItWorks.badge}</span>
          </div>
          <h2 className={quiet ? QUIET_H2 : "text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight mb-4 leading-tight"}>
            {t.howItWorks.title}
          </h2>
          <p className="text-base sm:text-lg text-ink-secondary leading-relaxed">
            {t.howItWorks.desc}
          </p>
        </div>

        {/* Visual Pipeline Progress Indicator */}
        <div className="mb-12 hidden md:block">
          <div className="bg-surface rounded-2xl p-4 border border-line shadow-sm">
            <div className="grid grid-cols-5 relative">
              {pipelineStages.map((stage, idx) => {
                const isPassed = idx <= activeStep
                const isCurrent = idx === activeStep
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    aria-pressed={isCurrent}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all relative z-10 ${
                      isCurrent
                        ? "bg-accent text-on-accent shadow-md shadow-accent/25 scale-[1.02]"
                        : isPassed
                        ? "text-accent hover:bg-accent-container/50"
                        : "text-ink-secondary hover:text-ink hover:bg-surface-dim"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isCurrent
                          ? "bg-surface text-accent"
                          : isPassed
                          ? "bg-accent-container text-accent"
                          : "bg-surface-dim text-ink-secondary border border-line"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="truncate">{stage}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 5-Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {t.howItWorks.steps.map((step, idx) => {
            const IconComponent = stepIcons[idx] || IconBot
            const isHighlight = activeStep === idx

            return (
              <div
                key={step.num}
                onMouseEnter={() => setActiveStep(idx)}
                className={`bg-surface rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between relative group ${
                  isHighlight
                    ? "border-accent shadow-lg shadow-accent/10 ring-1 ring-accent scale-[1.02]"
                    : "border-line shadow-sm hover:border-accent/40 hover:shadow-md"
                }`}
              >
                {/* Step Number Watermark */}
                <div aria-hidden="true" className="absolute top-5 right-5 text-3xl font-mono font-black text-ink/10 select-none group-hover:text-accent/20 transition-colors">
                  {step.num}
                </div>

                <div>
                  {/* Icon Header */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-105 ${
                      isHighlight
                        ? "bg-accent text-on-accent shadow-sm"
                        : "bg-accent-container text-accent border border-accent/20"
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent bg-accent-container/50 px-2 py-0.5 rounded mb-2.5 border border-accent/15">
                    {idx === 1 && <KaspiLogo size={12} />}
                    <span className="truncate">{step.tag}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-ink mb-2.5 leading-snug">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-ink-secondary leading-relaxed mb-5">
                    {step.desc}
                  </p>
                </div>

                <div>
                  {/* Micro-interactive preview badge */}
                  <div className="p-2.5 rounded-xl bg-surface-dim border border-line text-[11px] font-mono text-ink-secondary mb-3.5 flex items-center gap-2">
                    {idx === 0 && <IconWaveform className="w-3.5 h-3.5 text-accent shrink-0 animate-pulse" />}
                    {idx === 1 && <KaspiLogo size={14} className="shrink-0" />}
                    {idx === 2 && <IconWarehouse className="w-3.5 h-3.5 text-accent shrink-0" />}
                    {idx === 3 && <IconTruck className="w-3.5 h-3.5 text-accent shrink-0" />}
                    {idx === 4 && <IconMapPin className="w-3.5 h-3.5 text-accent shrink-0" />}
                    <span className="truncate text-[10px] leading-tight">{step.interactiveBadge}</span>
                  </div>

                  {/* Step Stage Footer */}
                  <div className="pt-3 border-t border-line/60 flex items-center justify-between text-[11px] font-semibold text-accent">
                    <span>{t.howItWorks.stageLabel(idx + 1, 5)}</span>
                    <span className="w-5 h-5 rounded-full bg-accent-container text-accent flex items-center justify-center">
                      <IconCheckSmall className="w-3.5 h-3.5 text-accent" />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Callout */}
        <div className="mt-14 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <LocalizedClientLink
            href={`/chat?prompt=${encodeURIComponent(
              locale === "kk"
                ? "Сәлеметсіз бе! Менің құрылыс жобама смета есептеп, тапсырысты жинақтау мен жеткізуді ұйымдастыруға көмектесіңіз."
                : "Здравствуйте! Помогите составить смету на черновые стройматериалы и провести заказ от подбора до доставки на объект в Астане."
            )}`}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold text-on-accent bg-accent hover:bg-accent-pressed shadow-md shadow-accent/25 hover:shadow-lg hover:shadow-accent/30 hover:scale-[1.01] transition-all"
          >
            <IconBot className="w-5 h-5" />
            <span>{t.howItWorks.ctaBtn}</span>
            <span aria-hidden="true" className="text-base leading-none">→</span>
          </LocalizedClientLink>

          {showSupplierLink && (
          <a
            href="#supplier-benefits"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold text-ink bg-surface hover:bg-surface-dim border border-line hover:border-accent/40 shadow-sm transition-all"
          >
            <span>{locale === "kk" ? "Жеткізушілерге арналған мүмкіндіктер" : "Преимущества для поставщиков"}</span>
            <span aria-hidden="true" className="text-xs text-accent">↓</span>
          </a>
          )}
        </div>
      </div>
    </section>
  )
}
