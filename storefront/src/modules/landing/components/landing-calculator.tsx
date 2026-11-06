"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import KaspiLogo from "@modules/landing/components/kaspi-logo"
import { useLandingI18n } from "@lib/i18n/landing-i18n"
import { IconSack, IconBlocks, IconDrywall, IconCalculator, IconCheckCircle } from "./icons"

type CalcTab = "screed" | "plaster" | "blocks" | "drywall"

// quiet — спокойный заголовок секции для страницы компании.
export default function LandingCalculator({
  quiet = false,
}: { quiet?: boolean } = {}) {
  const { locale, t } = useLandingI18n()
  const [activeTab, setActiveTab] = useState<CalcTab>("screed")

  // State for Screed
  const [screedArea, setScreedArea] = useState<number>(50)
  const [screedThickness, setScreedThickness] = useState<number>(50) // mm

  // State for Plaster
  const [plasterArea, setPlasterArea] = useState<number>(80)
  const [plasterThickness, setPlasterThickness] = useState<number>(15) // mm

  // State for Blocks
  const [blockLength, setBlockLength] = useState<number>(6) // m
  const [blockHeight, setBlockHeight] = useState<number>(2.8) // m

  // State for Drywall
  const [drywallArea, setDrywallArea] = useState<number>(45) // m²

  // Calculations
  const getResults = () => {
    switch (activeTab) {
      case "screed": {
        const volume = screedArea * (screedThickness / 1000)
        const cementBags = Math.ceil(((volume * 450) / 50) * 1.05)
        const sandTons = Number((volume * 1.5 * 0.75).toFixed(1))
        const estCost = cementBags * 2850 + Math.ceil(sandTons * 5500)
        const m = t.calculator.materials.screed
        return {
          title: m.title(screedArea, screedThickness),
          items: [
            { name: m.cementName, qty: `${cementBags} ${m.cementUnit}`, desc: m.cementDesc },
            { name: m.sandName, qty: `${sandTons} ${m.sandUnit}`, desc: m.sandDesc },
            { name: m.fiberName, qty: `${Math.ceil(screedArea * 0.05)} ${m.fiberUnit}`, desc: m.fiberDesc },
            { name: m.tapeName, qty: `${Math.ceil(Math.sqrt(screedArea) * 4)} ${m.tapeUnit}`, desc: m.tapeDesc },
          ],
          estCost,
        }
      }
      case "plaster": {
        const totalKg = plasterArea * (plasterThickness / 10) * 8.5 * 1.05
        const plasterBags = Math.ceil(totalKg / 30)
        const primerCanisters = Math.ceil((plasterArea * 0.2) / 10)
        const beacons = Math.ceil(plasterArea / 1.4)
        const estCost = plasterBags * 3100 + primerCanisters * 5200 + beacons * 320
        const m = t.calculator.materials.plaster
        return {
          title: m.title(plasterArea, plasterThickness),
          items: [
            { name: m.rotbandName, qty: `${plasterBags} ${m.rotbandUnit}`, desc: m.rotbandDesc },
            { name: m.primerName, qty: `${primerCanisters} ${m.primerUnit}`, desc: m.primerDesc },
            { name: m.beaconName, qty: `${beacons} ${m.beaconUnit}`, desc: m.beaconDesc },
            { name: m.meshName, qty: `${Math.ceil(plasterArea * 0.15)} ${m.meshUnit}`, desc: m.meshDesc },
          ],
          estCost,
        }
      }
      case "blocks": {
        const wallArea = blockLength * blockHeight
        const blockQty = Math.ceil((wallArea / 0.18) * 1.05)
        const glueBags = Math.ceil(blockQty / 35)
        const rebarRolls = Math.ceil(wallArea / 5)
        const estCost = blockQty * 680 + glueBags * 1850 + rebarRolls * 1500
        const m = t.calculator.materials.blocks
        return {
          title: m.title(blockLength, blockHeight, wallArea.toFixed(1)),
          items: [
            { name: m.blockName, qty: `${blockQty} ${m.blockUnit}`, desc: m.blockDesc },
            { name: m.glueName, qty: `${glueBags} ${m.glueUnit}`, desc: m.glueDesc },
            { name: m.meshName, qty: `${rebarRolls} ${m.meshUnit}`, desc: m.meshDesc },
            { name: m.hangerName, qty: `${Math.ceil(blockLength * 3)} ${m.hangerUnit}`, desc: m.hangerDesc },
          ],
          estCost,
        }
      }
      case "drywall": {
        const sheets = Math.ceil((drywallArea / 3) * 1.1)
        const profileCD = Math.ceil(drywallArea * 1.8)
        const profileUD = Math.ceil(drywallArea * 0.7)
        const screws = Math.ceil(drywallArea * 25)
        const estCost = sheets * 3400 + Math.ceil(profileCD * 450) + Math.ceil(profileUD * 380) + 2500
        const m = t.calculator.materials.drywall
        return {
          title: m.title(drywallArea),
          items: [
            { name: m.sheetName, qty: `${sheets} ${m.sheetUnit}`, desc: m.sheetDesc },
            { name: m.profileCdName, qty: `${Math.ceil(profileCD / 3)} ${m.profileCdUnit}`, desc: m.profileCdDesc },
            { name: m.profileUdName, qty: `${Math.ceil(profileUD / 3)} ${m.profileUdUnit}`, desc: m.profileUdDesc },
            { name: m.screwsName, qty: `${screws} ${m.screwsUnit}`, desc: m.screwsDesc },
          ],
          estCost,
        }
      }
    }
  }

  const results = getResults()

  const buildCalculatorPrompt = () => {
    const itemsList = results.items.map((it) => `${it.name}: ${it.qty}`).join(", ")
    const formattedCost = results.estCost.toLocaleString("ru-RU")

    if (locale === "kk") {
      return `Сәлеметсіз бе! Инженерлік калькулятор бойынша есеп: ${results.title}. Есептелген материалдар тізімі: ${itemsList}. Шамамен шыққан сома: ~${formattedCost} ₸. Астана қоймаларынан осы партияның барын тексеріп, нысанға дейін жеткізумен тапсырыс жасауға көмектесіңіз.`
    }

    return `Здравствуйте! Расчет из инженерного калькулятора: ${results.title}. Необходимые материалы: ${itemsList}. Ориентировочная сумма: ~${formattedCost} ₸. Помогите проверить наличие на складе в Астане и оформить заказ с оперативной доставкой на объект.`
  }

  return (
    <section id="calculator" className="scroll-mt-20 md:scroll-mt-28 py-20 md:py-28 bg-surface border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-dim border border-line text-ink-secondary text-xs font-mono uppercase tracking-wider mb-3">
            <IconCalculator className="w-4 h-4 text-accent" />
            <span>{t.calculator.badge}</span>
          </div>
          <h2
            className={
              quiet
                ? "text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-3"
                : "text-3xl sm:text-4xl font-black text-ink tracking-tight mb-4"
            }
          >
            {t.calculator.title}
          </h2>
          <p className="text-base sm:text-lg text-ink-secondary leading-relaxed">
            {t.calculator.desc}
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="bg-surface-dim rounded-2xl border border-line shadow-md overflow-hidden max-w-5xl mx-auto">
          {/* Tabs header with clean SVG icons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-line bg-surface">
            <button
              type="button"
              onClick={() => setActiveTab("screed")}
              aria-pressed={activeTab === "screed"}
              className={`py-4 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 border-b-2 transition-all ${
                activeTab === "screed"
                  ? "border-accent text-accent bg-surface-dim"
                  : "border-transparent text-ink-secondary hover:text-ink"
              }`}
            >
              <IconSack className="w-4 h-4" />
              <span>{t.calculator.tabs.screed}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("plaster")}
              aria-pressed={activeTab === "plaster"}
              className={`py-4 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 border-b-2 transition-all ${
                activeTab === "plaster"
                  ? "border-accent text-accent bg-surface-dim"
                  : "border-transparent text-ink-secondary hover:text-ink"
              }`}
            >
              <IconCalculator className="w-4 h-4" />
              <span>{t.calculator.tabs.plaster}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("blocks")}
              aria-pressed={activeTab === "blocks"}
              className={`py-4 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 border-b-2 transition-all ${
                activeTab === "blocks"
                  ? "border-accent text-accent bg-surface-dim"
                  : "border-transparent text-ink-secondary hover:text-ink"
              }`}
            >
              <IconBlocks className="w-4 h-4" />
              <span>{t.calculator.tabs.blocks}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("drywall")}
              aria-pressed={activeTab === "drywall"}
              className={`py-4 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 border-b-2 transition-all ${
                activeTab === "drywall"
                  ? "border-accent text-accent bg-surface-dim"
                  : "border-transparent text-ink-secondary hover:text-ink"
              }`}
            >
              <IconDrywall className="w-4 h-4" />
              <span>{t.calculator.tabs.drywall}</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls (Left 6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-ink-secondary">
                {t.calculator.parametersTitle}
              </div>

              {activeTab === "screed" && (
                <>
                  <div className="space-y-2 bg-surface p-4 rounded-xl border border-line/60">
                    <div className="flex justify-between text-sm font-semibold">
                      <span id="calc-screed-area" className="text-ink">{t.calculator.screedArea}</span>
                      <span className="font-mono text-accent text-base font-bold">{screedArea} м²</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={250}
                      step={5}
                      value={screedArea}
                      onChange={(e) => setScreedArea(Number(e.target.value))}
                      aria-labelledby="calc-screed-area"
                      className="w-full accent-accent cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-ink-secondary font-mono">
                      <span>10 м²</span>
                      <span>100 м²</span>
                      <span>250 м²</span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-surface p-4 rounded-xl border border-line/60">
                    <div className="flex justify-between text-sm font-semibold">
                      <span id="calc-screed-thickness" className="text-ink">{t.calculator.screedThickness}</span>
                      <span className="font-mono text-accent text-base font-bold">{screedThickness} мм</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={120}
                      step={5}
                      value={screedThickness}
                      onChange={(e) => setScreedThickness(Number(e.target.value))}
                      aria-labelledby="calc-screed-thickness"
                      className="w-full accent-accent cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-ink-secondary font-mono">
                      <span>20 мм</span>
                      <span>{t.calculator.screedThicknessStandard}</span>
                      <span>120 мм</span>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "plaster" && (
                <>
                  <div className="space-y-2 bg-surface p-4 rounded-xl border border-line/60">
                    <div className="flex justify-between text-sm font-semibold">
                      <span id="calc-plaster-area" className="text-ink">{t.calculator.plasterArea}</span>
                      <span className="font-mono text-accent text-base font-bold">{plasterArea} м²</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={350}
                      step={10}
                      value={plasterArea}
                      onChange={(e) => setPlasterArea(Number(e.target.value))}
                      aria-labelledby="calc-plaster-area"
                      className="w-full accent-accent cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-ink-secondary font-mono">
                      <span>20 м²</span>
                      <span>150 м²</span>
                      <span>350 м²</span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-surface p-4 rounded-xl border border-line/60">
                    <div className="flex justify-between text-sm font-semibold">
                      <span id="calc-plaster-thickness" className="text-ink">{t.calculator.plasterThickness}</span>
                      <span className="font-mono text-accent text-base font-bold">{plasterThickness} мм</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={35}
                      step={1}
                      value={plasterThickness}
                      onChange={(e) => setPlasterThickness(Number(e.target.value))}
                      aria-labelledby="calc-plaster-thickness"
                      className="w-full accent-accent cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-ink-secondary font-mono">
                      <span>5 мм</span>
                      <span>{t.calculator.plasterThicknessStandard}</span>
                      <span>35 мм</span>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "blocks" && (
                <>
                  <div className="space-y-2 bg-surface p-4 rounded-xl border border-line/60">
                    <div className="flex justify-between text-sm font-semibold">
                      <span id="calc-block-length" className="text-ink">{t.calculator.blockLength}</span>
                      <span className="font-mono text-accent text-base font-bold">{blockLength} м</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={25}
                      step={0.5}
                      value={blockLength}
                      onChange={(e) => setBlockLength(Number(e.target.value))}
                      aria-labelledby="calc-block-length"
                      className="w-full accent-accent cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-ink-secondary font-mono">
                      <span>2 м</span>
                      <span>10 м</span>
                      <span>25 м</span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-surface p-4 rounded-xl border border-line/60">
                    <div className="flex justify-between text-sm font-semibold">
                      <span id="calc-block-height" className="text-ink">{t.calculator.blockHeight}</span>
                      <span className="font-mono text-accent text-base font-bold">{blockHeight} м</span>
                    </div>
                    <input
                      type="range"
                      min={2.4}
                      max={4.2}
                      step={0.1}
                      value={blockHeight}
                      onChange={(e) => setBlockHeight(Number(e.target.value))}
                      aria-labelledby="calc-block-height"
                      className="w-full accent-accent cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-ink-secondary font-mono">
                      <span>{t.calculator.blockHeightStandard}</span>
                      <span>3.0 м</span>
                      <span>4.2 м</span>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "drywall" && (
                <div className="space-y-2 bg-surface p-4 rounded-xl border border-line/60">
                  <div className="flex justify-between text-sm font-semibold">
                    <span id="calc-drywall-area" className="text-ink">{t.calculator.drywallArea}</span>
                    <span className="font-mono text-accent text-base font-bold">{drywallArea} м²</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={5}
                    value={drywallArea}
                    onChange={(e) => setDrywallArea(Number(e.target.value))}
                    aria-labelledby="calc-drywall-area"
                    className="w-full accent-accent cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-ink-secondary font-mono">
                    <span>10 м²</span>
                    <span>80 м²</span>
                    <span>200 м²</span>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-surface border border-line text-xs text-ink-secondary flex items-start gap-3">
                <IconCheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <span>{t.calculator.disclaimer}</span>
              </div>
            </div>

            {/* Results Output (Right 6 cols) */}
            <div className="lg:col-span-6 bg-surface rounded-xl p-6 border border-line flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-secondary">
                    {t.calculator.billOfMaterials}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-dim border border-line text-ink">
                    {t.calculator.warehousesAstana}
                  </span>
                </div>

                <div className="space-y-2.5 mb-6">
                  {results.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-dim/70 border border-line/60"
                    >
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-ink">{item.name}</div>
                        <div className="text-[11px] text-ink-secondary">{item.desc}</div>
                      </div>
                      <div className="font-mono text-xs font-bold text-accent bg-accent-container px-2.5 py-1 rounded">
                        {item.qty}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="pt-4 border-t border-line flex items-center justify-between mb-5">
                  <div>
                    <div className="text-xs text-ink-secondary font-medium">
                      {t.calculator.estTotal}
                    </div>
                    <div className="text-2xl font-black text-ink">
                      ~ {results.estCost.toLocaleString("ru-RU")} ₸
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-ink-secondary flex flex-col items-end">
                    <span className="flex items-center gap-1 font-semibold text-kaspi">
                      <KaspiLogo size={14} /> Kaspi QR / Red
                    </span>
                    <span className="font-mono">{t.calculator.deliveryTime}</span>
                  </div>
                </div>

                {/* Primary Transfer Button to AI Chat */}
                <LocalizedClientLink
                  href={`/chat?prompt=${encodeURIComponent(buildCalculatorPrompt())}`}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-bold text-on-accent bg-accent hover:bg-accent-pressed shadow-md shadow-accent/20 transition-all hover:scale-[1.01]"
                >
                  <span>{t.calculator.ctaOrderAi}</span>
                  <svg aria-hidden="true" focusable="false" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
