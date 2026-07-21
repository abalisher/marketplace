import { getBaseURL } from "@lib/util/env"
import { getMessages } from "@lib/i18n/dictionaries"
import { resolveLocale } from "@lib/i18n/resolve-locale"
import { I18nProvider } from "@lib/i18n/i18n-context"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

// Локаль UI резолвится из cookie (см. resolve-locale) и сидирует I18nProvider,
// покрывающий все страницы (main + checkout). Строки — через useMessages().
export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await resolveLocale()
  const messages = getMessages(locale)

  return (
    <html lang={locale} data-mode="light">
      <body>
        <I18nProvider locale={locale} messages={messages}>
          <main className="relative">{props.children}</main>
        </I18nProvider>
      </body>
    </html>
  )
}
