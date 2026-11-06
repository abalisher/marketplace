"use client"

import { useLandingI18n } from "@lib/i18n/landing-i18n"
import {
  IconBot,
  IconWarehouse,
  IconChart,
  IconCheckSmall,
  IconTruck,
  IconSparkles,
  IconWhatsApp,
} from "@modules/landing/components/icons"
import { landingWhatsAppHref } from "@modules/landing/contacts"

export default function LandingSupplierBenefits() {
  const { locale, t } = useLandingI18n()
  const p1 = t.supplierBenefits.pillar1
  const p2 = t.supplierBenefits.pillar2
  const dash = p2.dashboardMockup

  return (
    <section id="supplier-benefits" className="scroll-mt-20 md:scroll-mt-28 py-20 md:py-28 bg-surface border-b border-line relative overflow-hidden">
      {/* Background soft ambient glows */}
      <div aria-hidden="true" className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div aria-hidden="true" className="absolute bottom-10 left-0 w-[450px] h-[450px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-container text-accent text-xs font-bold uppercase tracking-wider mb-3">
            <IconWarehouse className="w-4 h-4" />
            <span>{t.supplierBenefits.sectionBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight mb-4 leading-tight">
            {t.supplierBenefits.title}{" "}
            <span className="bg-gradient-to-r from-accent via-accent-pressed to-accent bg-clip-text text-transparent">
              {t.supplierBenefits.titleAccent}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-ink-secondary leading-relaxed">
            {t.supplierBenefits.desc}
          </p>
        </div>

        {/* 2 Main Pillar Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          {/* Pillar 1: No Operational Overload (5 cols on lg) */}
          <div className="lg:col-span-5 bg-surface-dim rounded-3xl p-8 border border-line shadow-sm flex flex-col justify-between hover:border-accent/40 transition-all">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-surface text-accent text-xs font-bold uppercase tracking-wider mb-5 border border-line">
                <IconBot className="w-4 h-4" />
                <span>{p1.tag}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-ink mb-4 leading-snug">
                {p1.title}
              </h3>

              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed mb-8">
                {p1.desc}
              </p>

              {/* Feature Points */}
              <div className="space-y-4 mb-8">
                {p1.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface border border-line shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-accent-container text-accent flex items-center justify-center shrink-0 mt-0.5">
                      {idx === 0 && <IconBot className="w-4 h-4" />}
                      {idx === 1 && <IconSparkles className="w-4 h-4" />}
                      {idx === 2 && <IconTruck className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ink mb-1">
                        {feat.title}
                      </h4>
                      <p className="text-xs text-ink-secondary leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar 1 Highlight Metric Badge */}
            <div className="pt-6 border-t border-line/70">
              <div className="p-4 rounded-2xl bg-accent-container/40 border border-accent/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-0.5">
                    {p1.metricLabel}
                  </div>
                  <div className="text-xs text-ink-secondary">
                    {locale === "kk" ? "Барлық механикалық әрекеттерді бот атқарады" : "Механика полностью передана боту"}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-accent">
                  {p1.metricValue}
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 2: 100% Enterprise Transparency & Live Dashboard (7 cols on lg) */}
          <div className="lg:col-span-7 bg-surface-dim rounded-3xl p-8 border border-line shadow-sm flex flex-col justify-between hover:border-accent/40 transition-all">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-surface text-accent text-xs font-bold uppercase tracking-wider mb-5 border border-line">
                <IconChart className="w-4 h-4" />
                <span>{p2.tag}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-ink mb-4 leading-snug">
                {p2.title}
              </h3>

              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed mb-6">
                {p2.desc}
              </p>

              {/* Live Interactive Warehouse Dashboard Mockup */}
              <div className="rounded-2xl bg-surface border border-line shadow-md p-5 sm:p-6 mb-6">
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent-container text-accent flex items-center justify-center font-bold">
                      <IconWarehouse className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-ink">
                        {dash.title}
                      </div>
                      <div className="text-[11px] text-ink-secondary">
                        {locale === "kk" ? "Астана • Алаш және Көктал тораптары" : "Астана • Узлы Алаш и Коктал"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-success text-[11px] font-bold">
                    <span aria-hidden="true" className="w-2 h-2 rounded-full bg-success animate-ping" />
                    <span>{dash.badgeLive}</span>
                  </div>
                </div>

                {/* 4 Stat KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-surface-dim border border-line">
                    <div className="text-[10px] text-ink-secondary mb-1">
                      {dash.statInflowLabel}
                    </div>
                    <div className="text-base sm:text-lg font-black font-mono text-success">
                      {dash.statInflow}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-dim border border-line">
                    <div className="text-[10px] text-ink-secondary mb-1">
                      {dash.statStockLabel}
                    </div>
                    <div className="text-base sm:text-lg font-black font-mono text-ink">
                      {dash.statStock}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-dim border border-line">
                    <div className="text-[10px] text-ink-secondary mb-1">
                      {dash.statOutflowLabel}
                    </div>
                    <div className="text-base sm:text-lg font-black font-mono text-accent">
                      {dash.statOutflow}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-dim border border-line">
                    <div className="text-[10px] text-ink-secondary mb-1">
                      {dash.statActiveTripsLabel}
                    </div>
                    <div className="text-base sm:text-lg font-black font-mono text-sky-600 dark:text-sky-400">
                      {dash.statActiveTrips}
                    </div>
                  </div>
                </div>

                {/* Live Movement Ledger Log */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase text-ink-secondary tracking-wider mb-1.5 flex items-center justify-between">
                    <span>{locale === "kk" ? "Тауар қозғалысы журналы (нақты уақыт):" : "Журнал движения товаров (онлайн):"}</span>
                    <span className="text-[10px] text-accent">Auto-sync 1C</span>
                  </div>

                  {dash.recentLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-surface-dim/70 border border-line flex items-center justify-between text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[10px] font-mono text-ink-secondary shrink-0">
                          {log.time}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            log.type === "in"
                              ? "bg-success"
                              : log.type === "out"
                              ? "bg-sky-500"
                              : "bg-warning"
                          }`}
                        />
                        <span className="truncate text-ink font-medium text-[11px]">
                          {log.text}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-accent bg-accent-container/50 px-2 py-0.5 rounded border border-accent/15 shrink-0">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Value bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {p2.features.map((feat, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-surface border border-line">
                    <div className="flex items-center gap-1.5 mb-1 text-accent font-bold text-xs">
                      <IconCheckSmall className="w-3.5 h-3.5" />
                      <span>{feat.title}</span>
                    </div>
                    <div className="text-[11px] text-ink-secondary leading-relaxed">
                      {feat.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Partner Connection Bar */}
            <div className="mt-6 pt-6 border-t border-line/70 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-ink-secondary text-center sm:text-left">
                <span className="font-semibold text-ink">
                  {locale === "kk" ? "Қоймаңызды СтройМаркет желісіне қосыңыз." : "Подключите свой склад к сети СтройМаркет."}
                </span>{" "}
                {locale === "kk"
                  ? "Қойма бағдарламаларымен және 1С-пен жылдам интеграция."
                  : "Готовая интеграция с 1С, Kaspi Pay и ЭСФ."}
              </div>

              <a
                href={landingWhatsAppHref(t.supplierBenefits.partnerWhatsappText)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-on-accent bg-accent hover:bg-accent-pressed shadow-md shadow-accent/20 hover:shadow-lg transition-all shrink-0 whitespace-nowrap"
              >
                <IconWhatsApp className="w-4 h-4" />
                <span>{t.supplierBenefits.ctaPartnerBtn}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
