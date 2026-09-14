"use client"

import { updateLocale } from "@lib/data/locale-actions"
import { LOCALES, LOCALE_LABELS, Locale } from "@lib/i18n/config"
import { useLocale, useMessages } from "@lib/i18n/i18n-context"
import { clx } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

// Переключатель языка UI витрины (ru/kk/en). Пишет локаль в cookie через
// updateLocale (server action) и обновляет страницу — корневой layout
// перечитывает cookie и пересидирует словарь.
const LanguageSwitcher = () => {
  const current = useLocale()
  const messages = useMessages()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const select = (locale: Locale) => {
    if (locale === current || isPending) {
      return
    }
    startTransition(async () => {
      await updateLocale(locale)
      router.refresh()
    })
  }

  return (
    <div
      className="flex items-center gap-x-2"
      aria-label={messages.common.language}
    >
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => select(locale)}
          disabled={isPending}
          className={clx(
            // Тап-таргет 48 px (та же правка, что у переключателя темы, T3.11).
            "flex min-h-[48px] min-w-[48px] items-center justify-center px-1 small:min-h-[32px] small:min-w-0 small:px-2",
            "txt-compact-small text-ui-fg-subtle hover:text-ui-fg-base transition-fg",
            { "text-ui-fg-base font-semibold": locale === current }
          )}
          data-testid={`locale-${locale}`}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
