"use client"

import { CABINET_SECTIONS } from "@lib/cabinet/sections"
import { useMessages } from "@lib/i18n/i18n-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArchiveBox, DocumentText, ShoppingCart, User } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { usePathname } from "next/navigation"

const ICONS = {
  orders: ArchiveBox,
  cart: ShoppingCart,
  documents: DocumentText,
  profile: User,
} as const

// Кабинет клиента в рельсе истории (T10.6, метафора «проектов» Gemini): те же
// четыре раздела, что и в ряду над содержимым. Активный раздел подсвечивается
// по текущему пути; на свёрнутом рельсе остаются только иконки с подписью в
// tooltip. Раньше здесь была одна ссылка «Мои заказы» в стартерный «Аккаунт».
const CabinetRailLinks = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const m = useMessages()
  const pathname = usePathname()

  return (
    <nav
      className={clx(
        "flex flex-col gap-1 small:gap-0",
        isCollapsed && "items-center"
      )}
      aria-label={m.cabinet.title}
      data-testid="cabinet-rail-links"
    >
      {CABINET_SECTIONS.map((section) => {
        const Icon = ICONS[section.key]
        const label = m.cabinet.nav[section.key]
        // Раздел активен и на вложенной странице (карточка заказа).
        const isActive = pathname.includes(section.href)

        return (
          <LocalizedClientLink
            key={section.key}
            href={section.href}
            aria-label={label}
            title={label}
            aria-current={isActive ? "page" : undefined}
            className={clx(
              "flex items-center gap-3 rounded-full text-body-large transition-colors small:text-rail",
              isCollapsed
                ? "h-12 w-12 justify-center small:h-9 small:w-9"
                : "min-h-[48px] px-3 small:min-h-[36px]",
              isActive
                ? "bg-accent-container font-semibold text-accent"
                : "text-ink hover:bg-surface-dim hover:text-accent"
            )}
            data-testid={`cabinet-link-${section.key}`}
          >
            <Icon />
            {!isCollapsed && label}
          </LocalizedClientLink>
        )
      })}
    </nav>
  )
}

export default CabinetRailLinks
