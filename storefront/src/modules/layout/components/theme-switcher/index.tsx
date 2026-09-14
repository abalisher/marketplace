"use client"

import { updateTheme } from "@lib/data/theme-actions"
import { useMessages } from "@lib/i18n/i18n-context"
import { applyTheme } from "@lib/theme/apply-theme"
import { THEMES, Theme } from "@lib/theme/config"
import { clx } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

// Переключатель темы витрины (авто/светлая/тёмная). Тема применяется сразу на
// клиенте (без ожидания сервера), затем пишется в cookie и страница
// обновляется — корневой layout перечитывает cookie и рендерит тот же класс.
const ThemeSwitcher = ({ theme }: { theme: Theme }) => {
  const messages = useMessages()
  const router = useRouter()
  const [current, setCurrent] = useState<Theme>(theme)
  const [isPending, startTransition] = useTransition()

  const select = (next: Theme) => {
    if (next === current || isPending) {
      return
    }

    setCurrent(next)
    applyTheme(next)
    startTransition(async () => {
      await updateTheme(next)
      router.refresh()
    })
  }

  return (
    <div
      className="flex items-center gap-x-2"
      aria-label={messages.common.theme}
    >
      {THEMES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => select(option)}
          disabled={isPending}
          aria-pressed={option === current}
          className={clx(
            // Тап-таргет 48 px: на телефоне подписи «Авто/Светлая/Тёмная» были
            // строчками в 16 px высотой и промахивались пальцем (прогон
            // 2026-08-13).
            "flex min-h-[48px] min-w-[48px] items-center justify-center px-1 small:min-h-[32px] small:min-w-0 small:px-2",
            "txt-compact-small text-ui-fg-subtle hover:text-ui-fg-base transition-fg",
            { "text-ui-fg-base font-semibold": option === current }
          )}
          data-testid={`theme-${option}`}
        >
          {messages.theme[option]}
        </button>
      ))}
    </div>
  )
}

export default ThemeSwitcher
