import { Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import LanguageSwitcher from "@modules/layout/components/language-switcher"
import ThemeSwitcher from "@modules/layout/components/theme-switcher"
import { getServerMessages } from "@lib/i18n/server"
import { resolveTheme } from "@lib/theme/resolve-theme"

// Футер витрины: бренд, права и переключатели темы/языка. Списки категорий и
// коллекций убраны — классический каталог снят с пути покупателя (решение
// владельца 2026-08-03), покупатель ходит через чат. На экране чата футера нет
// вовсе (см. app/[countryCode]/(chat)/layout.tsx).
export default async function Footer() {
  const [m, theme] = await Promise.all([getServerMessages(), resolveTheme()])

  return (
    <footer className="w-full border-t border-line">
      <div className="content-container flex w-full flex-col gap-4 py-10 small:flex-row small:items-center small:justify-between">
        <div className="flex flex-col gap-1">
          <LocalizedClientLink
            href="/chat"
            className="text-title-medium uppercase text-ink-secondary hover:text-ink"
          >
            СтройМаркет
          </LocalizedClientLink>
          <Text className="text-body-medium text-ink-secondary">
            © {new Date().getFullYear()} СтройМаркет.{" "}
            {m.footer.allRightsReserved}
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <ThemeSwitcher theme={theme} />
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  )
}
