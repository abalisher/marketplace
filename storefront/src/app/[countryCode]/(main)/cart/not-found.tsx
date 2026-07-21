import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"
import { getServerMessages } from "@lib/i18n/server"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default async function NotFound() {
  const m = await getServerMessages()
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">{m.common.pageNotFound}</h1>
      <p className="text-small-regular text-ui-fg-base">
        {m.common.cartNotFoundDesc}
      </p>
      <InteractiveLink href="/">{m.common.goToFrontpage}</InteractiveLink>
    </div>
  )
}
