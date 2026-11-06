import { TenantChatExampleLine } from "@lib/data/tenant"
import { Messages } from "@lib/i18n/messages/en"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { IconCheckSmall, IconSparkles } from "@modules/landing/components/icons"
import KaspiLogo from "@modules/landing/components/kaspi-logo"
import TenantLogo from "./tenant-logo"

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""))

const kzt = (amount: number) => convertToLocale({ amount, currency_code: "kzt" })

// Карточка чата в первом экране страницы компании — как на лендинге площадки,
// но пример настоящий: товары, варианты, цены и наличие — из каталога и склада
// компании (retrieveTenantChatExample), сумма считается здесь же. Если у
// компании нет товаров примера, карточка показывает вопрос и короткий ответ
// без расчёта — выдуманных цифр нет.
const TenantChatPreview = ({
  name,
  logoUrl,
  lines,
  deliveryPrice,
  t,
}: {
  name: string
  logoUrl: string | null
  lines: TenantChatExampleLine[]
  deliveryPrice: number | null
  t: Messages["tenant"]["chat"]
}) => {
  const materials = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
  const total = materials + (deliveryPrice ?? 0)
  const quantity = (line: TenantChatExampleLine) =>
    fill(t.units[line.unit], { n: line.quantity })
  const orderPrompt = fill(t.orderPrompt, {
    lines: lines
      .map((line) => `${line.title} (${line.variant}) — ${quantity(line)}`)
      .join(", "),
  })

  return (
    <div className="relative rounded-2xl bg-surface border border-line shadow-xl p-4 sm:p-5 overflow-hidden">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-line mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <TenantLogo name={name} logoUrl={logoUrl} className="w-9 h-9 rounded-xl text-base" />
          <div className="min-w-0">
            <div className="text-sm font-bold text-ink flex items-center gap-1.5">
              <span className="break-words">{fill(t.title, { name })}</span>
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-success shrink-0" />
            </div>
            <div className="text-[11px] text-ink-secondary">{t.subtitle}</div>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-surface-dim border border-line text-ink-secondary shrink-0">
          {t.example}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-accent text-on-accent px-3.5 py-2.5 shadow-sm leading-relaxed">
            {t.question}
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent-container text-accent flex items-center justify-center shrink-0 mt-0.5">
            <IconSparkles className="w-4 h-4" />
          </div>
          {lines.length ? (
            <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm bg-surface-dim border border-line p-3.5 space-y-2.5 shadow-sm">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-accent">
                <IconCheckSmall className="w-3.5 h-3.5 shrink-0" />
                <span>{t.answerNote}</span>
              </div>

              <ul className="space-y-1.5 bg-surface rounded-xl px-3 py-2.5 border border-line/60">
                {lines.map((line) => (
                  <li
                    key={`${line.title}-${line.variant}`}
                    className="flex items-baseline gap-2 text-[11px]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="text-ink font-medium">{line.title}</span>
                      <span className="text-ink-secondary"> · {line.variant}</span>
                    </span>
                    <span className="text-ink-secondary tabular-nums whitespace-nowrap">
                      {kzt(line.price)}
                    </span>
                    <span className="w-14 text-right font-mono font-bold text-ink whitespace-nowrap">
                      {quantity(line)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="space-y-1 text-[11px] text-ink-secondary">
                <div className="flex justify-between">
                  <dt>{t.materials}</dt>
                  <dd className="tabular-nums text-ink">{kzt(materials)}</dd>
                </div>
                {deliveryPrice != null && (
                  <div className="flex justify-between">
                    <dt>{t.delivery}</dt>
                    <dd className="tabular-nums text-ink">{kzt(deliveryPrice)}</dd>
                  </div>
                )}
              </dl>

              <div className="pt-2 border-t border-line/60 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-ink-secondary">
                    <span className="uppercase">{t.total}</span> · {t.livePrices}
                  </div>
                  <div className="text-base font-bold text-ink tabular-nums">{kzt(total)}</div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-kaspi/10 text-kaspi font-bold text-xs">
                  <KaspiLogo size={16} />
                  <span>Kaspi QR</span>
                </div>
              </div>

              <LocalizedClientLink
                href={`/chat?prompt=${encodeURIComponent(orderPrompt)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-accent text-on-accent text-xs font-bold hover:bg-accent-pressed transition-colors shadow-sm"
              >
                <span>{t.order}</span>
                <span aria-hidden="true">→</span>
              </LocalizedClientLink>
            </div>
          ) : (
            <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm bg-surface-dim border border-line p-4 space-y-3 shadow-sm">
              <p className="text-ink leading-relaxed">{t.fallback}</p>
              <LocalizedClientLink
                href={`/chat?prompt=${encodeURIComponent(t.question)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-accent text-on-accent text-xs font-bold hover:bg-accent-pressed transition-colors shadow-sm"
              >
                <span>{t.order}</span>
                <span aria-hidden="true">→</span>
              </LocalizedClientLink>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TenantChatPreview
