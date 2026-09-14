"use client"

import { CABINET_SECTIONS } from "@lib/cabinet/sections"
import { useMessages } from "@lib/i18n/i18n-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@medusajs/ui"
import { usePathname } from "next/navigation"

// Ряд-переключатель разделов кабинета над содержимым. Нужен ТОЛЬКО там, где
// рельса нет: на мобильном она спрятана в drawer, и без этого ряда покупатель
// ходил бы между заказами и документами через меню. На десктопе ряд скрыт —
// рядом с ним рельс показывает те же четыре раздела, и дубль сбивал бы с толку
// (находка гейта U T10.6b). Форма — чипы композера (pill 40px), чтобы кабинет
// читался как продолжение чата, а не как чужой экран.
const CabinetNav = () => {
  const m = useMessages()
  const pathname = usePathname()

  return (
    <nav
      className="flex flex-wrap gap-2 small:hidden"
      aria-label={m.cabinet.title}
      data-testid="cabinet-nav"
    >
      {CABINET_SECTIONS.map((section) => {
        const isActive = pathname.includes(section.href)

        return (
          <LocalizedClientLink
            key={section.key}
            href={section.href}
            aria-current={isActive ? "page" : undefined}
            className={clx(
              "flex min-h-[40px] items-center rounded-chip border px-4 text-body-medium transition-colors",
              isActive
                ? "border-accent bg-accent-container font-semibold text-accent"
                : "border-line bg-surface text-ink hover:border-accent hover:text-accent"
            )}
            data-testid={`cabinet-tab-${section.key}`}
          >
            {m.cabinet.nav[section.key]}
          </LocalizedClientLink>
        )
      })}
    </nav>
  )
}

export default CabinetNav
