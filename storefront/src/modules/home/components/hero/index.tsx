import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getServerMessages } from "@lib/i18n/server"

const Hero = async () => {
  const m = await getServerMessages()

  return (
    <div className="relative h-[75vh] w-full border-b border-line bg-surface-dim">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 text-center small:p-32">
        <span className="flex flex-col gap-4">
          <h1 className="text-heading-large text-ink small:text-4xl small:leading-tight">
            {m.home.heroTitle}
          </h1>
          <h2 className="text-body-large text-ink-secondary small:text-2xl small:leading-10">
            {m.home.heroSubtitle}
          </h2>
        </span>
        <LocalizedClientLink
          href="/store"
          className="flex min-h-[48px] items-center rounded-chip bg-accent px-6 text-button text-on-accent transition-colors hover:bg-accent-pressed"
        >
          {m.home.goToCatalogue}
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Hero
