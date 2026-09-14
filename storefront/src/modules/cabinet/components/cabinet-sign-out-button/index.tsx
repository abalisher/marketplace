"use client"

import { signout } from "@lib/data/customer"
import { useMessages } from "@lib/i18n/i18n-context"
import { ArrowRightOnRectangle } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useParams } from "next/navigation"
import { useState } from "react"

// Выход из учётной записи в рельсе кабинета (дефект приёмки 2026-09-07: выйти
// было НЕЧЕМ — покупатель, вошедший по чужому номеру или с истёкшей сессией,
// оставался в ней навсегда). Стоит рядом с разделами кабинета: там же, где
// покупатель ищет «свой» блок интерфейса.
//
// После выхода уводим в чат, а не на страницу входа: подбор и расчёт работают
// и гостю, и обрывать разговор незачем — вход снова предложит сам ассистент.
const CabinetSignOutButton = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const m = useMessages()
  const { countryCode } = useParams() as { countryCode: string }
  const [isLeaving, setIsLeaving] = useState(false)

  const label = m.cabinet.signOut

  return (
    <button
      type="button"
      disabled={isLeaving}
      onClick={async () => {
        setIsLeaving(true)
        await signout(countryCode, `/${countryCode}/chat`)
      }}
      aria-label={label}
      title={label}
      className={clx(
        "flex items-center gap-3 rounded-full text-body-large text-ink-secondary small:text-rail transition-colors hover:bg-surface-dim hover:text-accent disabled:opacity-60",
        isCollapsed
          ? "h-12 w-12 justify-center small:h-9 small:w-9"
          : "min-h-[48px] px-3 small:min-h-[36px]"
      )}
      data-testid="cabinet-sign-out"
    >
      <ArrowRightOnRectangle />
      {!isCollapsed && label}
    </button>
  )
}

export default CabinetSignOutButton
