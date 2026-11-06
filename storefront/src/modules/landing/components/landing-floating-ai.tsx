"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { IconSparkles } from "./icons"
import { useLandingI18n } from "@lib/i18n/landing-i18n"

export default function LandingFloatingAi() {
  const { locale, t } = useLandingI18n()
  const [visible, setVisible] = useState(false)

  const floatingPrompt =
    locale === "kk"
      ? "Сәлеметсіз бе! Менің жобам бойынша құрылыс материалдарының сметасын тез есептеп, Астана бойынша жеткізуді ұйымдастыруға көмектесіңіз."
      : "Здравствуйте! Помогите быстро рассчитать смету черновых стройматериалов по проекту и оформить доставку в Астане."

  useEffect(() => {
    const handleScroll = () => {
      // Show only after scrolling down 300px
      setVisible(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-5 inset-x-0 flex justify-center z-40 pointer-events-none px-4 motion-safe:animate-fade-in">
      <LocalizedClientLink
        href={`/chat?prompt=${encodeURIComponent(floatingPrompt)}`}
        className="pointer-events-auto inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-ink/90 hover:bg-ink text-surface backdrop-blur-md border border-accent/40 shadow-xl shadow-scrim/15 hover:shadow-accent/25 hover:border-accent hover:scale-105 transition-all group cursor-pointer"
      >
        <span aria-hidden="true" className="w-2 h-2 rounded-full bg-accent animate-ping" />
        <IconSparkles className="w-4 h-4 text-accent group-hover:rotate-12 transition-transform" />
        <span className="text-xs sm:text-sm font-bold tracking-tight">
          {t.floatingAi.text} <span className="text-emerald-400 font-normal">{t.floatingAi.highlight}</span>
        </span>
        <span aria-hidden="true" className="text-xs text-accent font-black group-hover:translate-x-0.5 transition-transform">
          →
        </span>
      </LocalizedClientLink>
    </div>
  )
}
