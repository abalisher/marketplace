"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import KaspiLogo from "@modules/landing/components/kaspi-logo"
import {
  IconSparkles,
  IconTruck,
  IconCrane,
  IconCalculator,
  IconWaveform,
  IconCheckCircle,
  IconMicrophone,
  IconCheckSmall,
} from "./icons"
import { useLandingI18n } from "@lib/i18n/landing-i18n"

export default function LandingHero() {
  const { locale, t } = useLandingI18n()
  const quickPrompts = t.hero.prompts

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden bg-gradient-to-b from-surface-dim/60 via-surface to-surface border-b border-line">
      {/* Modern Ambient Luminous Halo */}
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[520px] bg-[radial-gradient(ellipse_85%_65%_at_50%_-15%,rgb(var(--sm-accent)/0.14),transparent_70%)] pointer-events-none" />
      <div aria-hidden="true" className="absolute top-24 right-0 w-[520px] h-[520px] bg-accent/8 rounded-full blur-3xl pointer-events-none -z-10" />
      <div aria-hidden="true" className="absolute -bottom-10 left-0 w-[420px] h-[420px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Core Value Proposition (7 cols) */}
          <div className="lg:col-span-7 space-y-7 text-left">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-ink tracking-tight leading-[1.12]">
              {t.hero.titlePart1}{" "}
              <span className="bg-gradient-to-r from-accent via-accent-pressed to-accent bg-clip-text text-transparent">
                {t.hero.titlePart2}
              </span>{" "}
              {t.hero.titlePart3}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-2xl">
              {t.hero.desc}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <LocalizedClientLink
                href={`/chat?prompt=${encodeURIComponent(
                  locale === "kk"
                    ? "Сәлеметсіз бе! Менің жобама қара сылақ материалдарының толық сметасын есептеп, Астана қоймаларынан жедел жеткізуді ұйымдастыруға көмектесіңіз."
                    : "Здравствуйте! Помогите составить полную смету черновых стройматериалов для моего объекта и оформить доставку со складов Астаны."
                )}`}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-sm sm:text-base font-bold text-on-accent bg-accent hover:bg-accent-pressed shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 transition-all group whitespace-nowrap shrink-0"
              >
                <IconSparkles className="w-5 h-5 group-hover:rotate-12 transition-transform shrink-0" />
                <span className="whitespace-nowrap">{t.hero.ctaCalc}</span>
                <svg
                  aria-hidden="true"
                  focusable="false"
                  className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </LocalizedClientLink>

              <a
                href="#calculator"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-sm sm:text-base font-semibold text-ink bg-surface hover:bg-surface-dim border border-line hover:border-accent/40 shadow-sm transition-all whitespace-nowrap shrink-0"
              >
                <IconCalculator className="w-5 h-5 text-accent shrink-0" />
                <span className="whitespace-nowrap">{locale === "kk" ? "Инженерлік калькулятор" : "Инженерный калькулятор"}</span>
              </a>
            </div>

            {/* Quick Prompt Selector */}
            <div className="pt-2">
              <div className="text-xs font-mono uppercase text-ink-secondary tracking-wider mb-2.5 flex items-center gap-1.5">
                <IconMicrophone className="w-4 h-4 text-accent" />
                <span>{t.hero.promptsTitle}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((p, idx) => (
                  <LocalizedClientLink
                    key={idx}
                    href={`/chat?prompt=${encodeURIComponent(p.query)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-dim hover:bg-accent-container text-ink hover:text-accent border border-line hover:border-accent/30 transition-all hover:scale-[1.01]"
                  >
                    <span aria-hidden="true">↳</span>
                    <span>{p.label}</span>
                  </LocalizedClientLink>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Simulated Product Assistant Interface (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-surface border border-line shadow-xl p-5 sm:p-6 overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-accent-container text-accent flex items-center justify-center font-bold">
                    <IconSparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-ink flex items-center gap-1.5">
                      <span>AI-Прораб «СтройМаркет»</span>
                      <span aria-hidden="true" className="w-2 h-2 rounded-full bg-success"></span>
                    </div>
                    <div className="text-[11px] text-ink-secondary">
                      Сметный расчет онлайн • Астана
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-dim border border-line text-ink-secondary">
                  v2.4 СНиП РК
                </span>
              </div>

              {/* Simulated Chat Messages */}
              <div className="space-y-3.5 text-xs">
                {/* User Message (Voice simulation) */}
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-accent text-on-accent p-3.5 shadow-sm space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] opacity-90 pb-1 border-b border-on-accent/20">
                      <IconWaveform className="w-4 h-4" />
                      <span>Голосовое сообщение (0:14)</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      «Салам! Нужно на ЖК Grand Turan залить стяжку 75 м², толщина
                      5 см. Посчитай объем цемента М400 Бухтарма, песок и доставку
                      на сегодня.»
                    </p>
                  </div>
                </div>

                {/* Assistant Response Card */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent-container text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <IconSparkles className="w-4 h-4" />
                  </div>
                  <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-surface-dim border border-line p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-ink-secondary">
                      <span className="font-semibold text-accent flex items-center gap-1">
                        <IconCheckSmall className="w-3.5 h-3.5" />
                        <span>Расчет по нормам СНиП (запас 5%)</span>
                      </span>
                      <span>14:02</span>
                    </div>

                    {/* Specification Box */}
                    <div className="space-y-1.5 bg-surface rounded-xl p-2.5 border border-line/60">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-ink font-medium">Цемент М400 Бухтарма (50 кг)</span>
                        <span className="font-mono font-bold text-ink">36 мешков</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-ink font-medium">Мытый речной песок</span>
                        <span className="font-mono font-bold text-ink">4.2 тонны</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-ink font-medium">Фиброволокно армирующее</span>
                        <span className="font-mono font-bold text-ink">4 пакета</span>
                      </div>
                    </div>

                    {/* Logistics & Cost */}
                    <div className="pt-2 border-t border-line/60 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-ink-secondary uppercase">
                          Итоговая стоимость:
                        </div>
                        <div className="text-base font-black text-ink">
                          125 700 ₸
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-kaspi/10 text-kaspi font-bold text-xs">
                        <KaspiLogo size={16} />
                        <span>Kaspi QR</span>
                      </div>
                    </div>

                    {/* Action Button inside widget */}
                    <LocalizedClientLink
                      href={`/chat?prompt=${encodeURIComponent(
                        locale === "kk"
                          ? "Сәлеметсіз бе! Тапсырысты рәсімдеу қажет: Бұқтырма М400 цементі (50 кг) - 36 қап, жуылған құм - 4.2 тонна, фиброталшық - 4 қаптама. Жалпы сомасы: 125 700 ₸. Kaspi QR арқылы төлеп, Астана бойынша жеткізуді бастайық."
                          : "Здравствуйте! Оформляем заказ: Цемент Бухтарма М400 (50 кг) — 36 мешков, Песок мытый сеяный — 4.2 тонны, Фиброволокно — 4 пакета. Сумма: 125 700 ₸. Готовы оплатить через Kaspi QR и принять доставку по Астане."
                      )}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-accent text-on-accent text-xs font-bold hover:bg-accent-pressed transition-colors shadow-sm"
                    >
                      <span>Открыть заказ в чате</span>
                      <span aria-hidden="true">→</span>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Trust Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto pt-10 border-t border-line/80">
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-dim/60 border border-line/60">
            <div className="w-10 h-10 rounded-lg bg-accent-container text-accent flex items-center justify-center shrink-0">
              <IconTruck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-ink leading-tight">от 2 часов</div>
              <div className="text-xs text-ink-secondary">Подача авто по Астане</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-dim/60 border border-line/60">
            <div className="w-10 h-10 rounded-lg bg-accent-container text-accent flex items-center justify-center shrink-0">
              <IconCrane className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-ink leading-tight">10 000+ т</div>
              <div className="text-xs text-ink-secondary">Отгружено на объекты</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-dim/60 border border-line/60">
            <div className="w-10 h-10 rounded-lg bg-kaspi/10 flex items-center justify-center shrink-0">
              <KaspiLogo size={24} />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-kaspi leading-tight">Kaspi Pay / Red</div>
              <div className="text-xs text-ink-secondary">Рассрочка в 1 клик</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-dim/60 border border-line/60">
            <div className="w-10 h-10 rounded-lg bg-accent-container text-accent flex items-center justify-center shrink-0">
              <IconCheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-ink leading-tight">100% ГОСТ</div>
              <div className="text-xs text-ink-secondary">Сертификаты и паспорта</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
