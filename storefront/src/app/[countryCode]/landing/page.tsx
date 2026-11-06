import { Metadata } from "next"
import LandingNav from "@modules/landing/components/landing-nav"
import LandingHero from "@modules/landing/components/landing-hero"
import LandingHowItWorks from "@modules/landing/components/landing-how-it-works"
import LandingSupplierBenefits from "@modules/landing/components/landing-supplier-benefits"
import LandingCalculator from "@modules/landing/components/landing-calculator"
import LandingDelivery from "@modules/landing/components/landing-delivery"
import LandingFaq from "@modules/landing/components/landing-faq"
import LandingCta from "@modules/landing/components/landing-cta"
import LandingFloatingAi from "@modules/landing/components/landing-floating-ai"
import LandingFooter from "@modules/landing/components/landing-footer"
import { LandingI18nProvider } from "@lib/i18n/landing-i18n"
import { resolveLocale } from "@lib/i18n/resolve-locale"

export const metadata: Metadata = {
  title: "СтройМаркет — Черновые стройматериалы в Астане с AI-подбором и оперативной доставкой",
  description:
    "Умная платформа черновых стройматериалов в Астане: от заказа до доставки на объект за 2 часа. Автоматизация для поставщиков, расчет сметы через AI-прораба и оплата Kaspi.",
  openGraph: {
    title: "СтройМаркет — Черновые стройматериалы в Астане: от заказа до доставки",
    description:
      "Сквозной процесс от заявки до разгрузки на объекте. Нулевая операционка для поставщиков, прозрачный учет остатков и оперативная доставка.",
    type: "website",
  },
}

export default async function LandingPage() {
  const locale = await resolveLocale()

  return (
    <LandingI18nProvider initialLocale={locale}>
      <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-accent selection:text-on-accent">
        {/* Landing Dedicated Sticky Navigation */}
        <LandingNav />

        <main className="flex-1">
          {/* 1. Hero Section with AI Prompts & Live Estimator Preview */}
          <LandingHero />

          {/* 2. End-to-End Workflow: From Order to Delivery (5 Steps) */}
          <LandingHowItWorks />

          {/* 3. Supplier & Enterprise Advantages: 0% Ops Overload + 100% Real-Time Transparency */}
          <LandingSupplierBenefits />

          {/* 4. Interactive Materials Calculator */}
          <LandingCalculator />

          {/* 5. Streamlined Logistics, Fleet & Guarantees */}
          <LandingDelivery />

          {/* 6. FAQ Accordion for Buyers & Suppliers */}
          <LandingFaq />

          {/* 7. Conversion CTA Banner */}
          <LandingCta />
        </main>

        {/* Floating AI Assistant Capsule */}
        <LandingFloatingAi />

        {/* Landing Dedicated Footer */}
        <LandingFooter />
      </div>
    </LandingI18nProvider>
  )
}
