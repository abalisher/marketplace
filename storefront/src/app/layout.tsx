import { getBaseURL } from "@lib/util/env"
import { roboto } from "@lib/fonts/roboto"
import { robotoTenge } from "@lib/fonts/roboto-tenge"
import { getMessages } from "@lib/i18n/dictionaries"
import { resolveLocale } from "@lib/i18n/resolve-locale"
import { I18nProvider } from "@lib/i18n/i18n-context"
import { resolveTheme } from "@lib/theme/resolve-theme"
import ThemeScript from "@modules/layout/components/theme-script"
import { clx } from "@medusajs/ui"
import { Metadata } from "next"
import "styles/globals.css"
import "styles/tokens.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

// Локаль UI резолвится из cookie (см. resolve-locale) и сидирует I18nProvider,
// покрывающий все страницы (main + checkout). Строки — через useMessages().
// Тема — из cookie `_sm_theme`: явный light/dark ставится классом сразу в SSR,
// системная досчитывается ThemeScript до первого кадра (отсюда
// suppressHydrationWarning — класс на <html> правит скрипт, не React).
export default async function RootLayout(props: { children: React.ReactNode }) {
  const [locale, theme] = await Promise.all([resolveLocale(), resolveTheme()])
  const messages = getMessages(locale)
  const isDark = theme === "dark"

  return (
    <html
      lang={locale}
      className={clx(roboto.variable, robotoTenge.variable, { dark: isDark })}
      data-mode={isDark ? "dark" : "light"}
      style={{ colorScheme: isDark ? "dark" : "light" }}
      suppressHydrationWarning
    >
      <body className="bg-surface-dim text-ink font-sans antialiased">
        <ThemeScript theme={theme} />
        <I18nProvider locale={locale} messages={messages}>
          <main className="relative">{props.children}</main>
        </I18nProvider>
      </body>
    </html>
  )
}
