import { StorefrontTenant, TenantTransparency } from "@lib/data/tenant"
import { Messages } from "@lib/i18n/messages/en"
import {
  IconChart,
  IconCheckSmall,
  IconWarehouse,
} from "@modules/landing/components/icons"

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""))

// Время событий — по Астане: склад и покупатели здесь, а сервер витрины может
// стоять в любом поясе. Только цифры, поэтому вывод не зависит от ICU.
const formatTime = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Almaty",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))

const formatQuantity = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value)

// «Учёт и контроль без слепых зон» на странице компании — тот же блок, что
// пример на лендинге, но из живой сводки её склада и заказов. Без сводки
// (бэкенд недоступен) честно говорим об этом, а не рисуем пример.
const TenantTransparencyBlock = ({
  tenant,
  data,
  m,
}: {
  tenant: StorefrontTenant
  data: TenantTransparency | null
  m: Messages
}) => {
  const t = m.tenant.transparency
  const stages = m.assistant.order.stage as Record<string, string>

  const kpis = data && [
    {
      label: fill(t.inflow, { days: data.window_days }),
      value: data.inflow.by_unit[0]
        ? `+${formatQuantity(data.inflow.by_unit[0].quantity)} ${data.inflow.by_unit[0].unit}`
        : "0",
      hint: fill(t.inflowReceipts, { count: data.inflow.receipts }),
      tone: "text-success",
    },
    {
      label: t.stock,
      value: data.stock.skus
        ? `${Math.round((data.stock.in_stock / data.stock.skus) * 1000) / 10}%`
        : "—",
      hint: fill(t.stockOf, {
        inStock: data.stock.in_stock,
        skus: data.stock.skus,
      }),
      tone: "text-ink",
    },
    {
      label: fill(t.shipped, { days: data.window_days }),
      value: fill(t.shippedValue, { count: data.outflow.shipped }),
      hint: fill(t.delivered, { count: data.outflow.delivered }),
      tone: "text-accent",
    },
    {
      label: t.drivers,
      value: fill(t.driversValue, { count: data.active_drivers }),
      hint: data.locations.join(", ") || t.noLocations,
      tone: "text-ink",
    },
  ]

  return (
    <section
      id="transparency"
      className="scroll-mt-28 py-20 md:py-28 bg-surface-dim border-b border-line relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-container text-accent text-xs font-bold uppercase tracking-wider mb-3">
            <IconChart className="w-4 h-4" />
            <span>{t.tag}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-3 leading-tight">
            {fill(t.title, { name: tenant.name })}
          </h2>
          <p className="text-base sm:text-lg text-ink-secondary leading-relaxed">
            {t.text}
          </p>
        </div>

        <div className="rounded-3xl bg-surface border border-line shadow-sm p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line mb-5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-accent-container text-accent flex items-center justify-center shrink-0">
                <IconWarehouse className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-ink">{t.panelTitle}</div>
                <div className="text-[11px] text-ink-secondary truncate">
                  {tenant.name}
                  {data?.locations.length ? ` • ${data.locations.join(", ")}` : ""}
                </div>
              </div>
            </div>
            {data && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-success text-[11px] font-bold">
                <span
                  aria-hidden="true"
                  className="w-2 h-2 rounded-full bg-success motion-safe:animate-ping"
                />
                <span>{t.live}</span>
              </div>
            )}
          </div>

          {!kpis ? (
            <p className="text-sm text-ink-secondary">{t.unavailable}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="p-3 rounded-xl bg-surface-dim border border-line min-w-0"
                  >
                    <div className="text-[11px] text-ink-secondary mb-1">
                      {kpi.label}
                    </div>
                    <div
                      className={`text-base sm:text-lg font-bold font-mono ${kpi.tone}`}
                    >
                      {kpi.value}
                    </div>
                    <div className="text-[11px] text-ink-secondary mt-1 truncate">
                      {kpi.hint}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase text-ink-secondary tracking-wider mb-1.5 flex items-center justify-between gap-2">
                  <span>{t.log}</span>
                  <span className="text-[10px] text-accent normal-case shrink-0">
                    {fill(t.updated, { time: formatTime(data.generated_at) })}
                  </span>
                </div>

                {data.log.length === 0 && (
                  <p className="p-3 rounded-lg bg-surface-dim border border-line text-xs text-ink-secondary">
                    {t.empty}
                  </p>
                )}

                {data.log.map((entry, idx) => (
                  <div
                    key={`${entry.type}-${entry.at}-${idx}`}
                    className="p-2.5 rounded-lg bg-surface-dim border border-line flex items-center justify-between text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-ink-secondary shrink-0">
                        {formatTime(entry.at)}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          entry.type === "in" ? "bg-success" : "bg-accent"
                        }`}
                      />
                      <span className="truncate text-ink font-medium text-[12px]">
                        {entry.type === "in"
                          ? fill(t.receipt, {
                              title: entry.title ?? t.receiptUntitled,
                              quantity: formatQuantity(entry.quantity),
                              unit: entry.unit,
                            }) +
                            (entry.more_lines
                              ? fill(t.receiptMore, { count: entry.more_lines })
                              : "")
                          : fill(m.assistant.order.number, {
                              id: entry.order_number,
                            })}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-accent bg-accent-container/50 px-2 py-0.5 rounded border border-accent/15 shrink-0">
                      {entry.type === "in"
                        ? t.posted
                        : stages[entry.status] ?? entry.status}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-5 flex items-center gap-1.5 text-[11px] text-ink-secondary">
            <IconCheckSmall className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{t.privacy}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TenantTransparencyBlock
