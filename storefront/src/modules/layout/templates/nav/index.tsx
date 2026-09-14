import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SideMenu from "@modules/layout/components/side-menu"
import { getServerMessages } from "@lib/i18n/server"

// Шапка витрины. Живёт только на маршрутах `(main)`: у разговорных `(chat)`
// своя оболочка по эталону Gemini, и шапки там нет вовсе (решение владельца
// 2026-09-14) — всё, что было в ней, есть в рельсе диалогов.
export default async function Nav() {
  // Список регионов шапке больше не нужен: выбор страны доставки убран из
  // бокового меню (регион один — Казахстан, T3.11).
  const [locales, currentLocale, m] = await Promise.all([
    listLocales(),
    getLocale(),
    getServerMessages(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-surface border-line">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu locales={locales} currentLocale={currentLocale} />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/chat"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
              data-testid="nav-store-link"
            >
              СтройМаркет
            </LocalizedClientLink>
          </div>

          {/* Корзины в шапке нет: её ведёт ассистент внутри диалога, а cookie-корзина
              стартера после пивота не наполняется вовсе и всегда показывала «(0)»
              (T3.10). Аккаунт виден на любой ширине — на мобильном это
              единственная ссылка справа. */}
          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <LocalizedClientLink
              className="hidden small:block hover:text-ui-fg-base"
              href="/chat"
              data-testid="nav-assistant-link"
            >
              {m.assistant.navLink}
            </LocalizedClientLink>
            <LocalizedClientLink
              className="hover:text-ui-fg-base"
              href="/account"
              data-testid="nav-account-link"
            >
              {m.nav.account}
            </LocalizedClientLink>
          </div>
        </nav>
      </header>
    </div>
  )
}
