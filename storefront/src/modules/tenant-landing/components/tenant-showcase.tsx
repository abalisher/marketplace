import { StorefrontTenant, TenantShowcaseItem } from "@lib/data/tenant"
import { Messages } from "@lib/i18n/messages/en"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { IconSack, IconSparkles } from "@modules/landing/components/icons"

const SHOWCASE_SIZE = 8

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""))

const formatQty = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value)

// Ассортимент компании: реальные товары её канала с ценой и остатком её
// склада. Сначала то, что есть в наличии, потом — с фото. Заказ — через
// консультанта с готовой репликой: корзины в интерфейсе витрины нет.
const TenantShowcase = ({
  tenant,
  items,
  m,
}: {
  tenant: StorefrontTenant
  items: TenantShowcaseItem[]
  m: Messages
}) => {
  const t = m.tenant.showcase
  const shown = [...items]
    .sort(
      (a, b) =>
        Number(b.in_stock > 0) - Number(a.in_stock > 0) ||
        Number(!!b.thumbnail) - Number(!!a.thumbnail)
    )
    .slice(0, SHOWCASE_SIZE)

  return (
    <section
      id="assortment"
      className="scroll-mt-28 py-20 md:py-24 bg-surface border-b border-line"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-accent mb-3">
              {t.tag}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight leading-tight mb-3">
              {t.title}
            </h2>
            <p className="text-base text-ink-secondary leading-relaxed">
              {t.text}
            </p>
          </div>
          <LocalizedClientLink
            href={`/chat?prompt=${encodeURIComponent(
              fill(t.allPrompt, { name: tenant.name })
            )}`}
            className="inline-flex items-center gap-2 self-start md:self-auto px-5 py-3 rounded-xl border border-line text-sm font-bold text-ink hover:border-accent hover:text-accent transition-colors shrink-0"
          >
            <IconSparkles className="w-4 h-4 text-accent" />
            {t.all}
          </LocalizedClientLink>
        </div>

        {shown.length === 0 ? (
          <p className="p-6 rounded-2xl border border-line bg-surface-dim text-sm text-ink-secondary">
            {t.empty}
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {shown.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col rounded-2xl border border-line bg-surface overflow-hidden hover:border-accent/50 hover:shadow-md transition-all"
              >
                <div className="relative aspect-[4/3] bg-surface-dim">
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-ink-secondary/40">
                      <IconSack className="w-12 h-12" />
                    </div>
                  )}
                  <span
                    className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      item.in_stock > 0
                        ? "bg-success text-on-accent"
                        : "bg-surface text-ink-secondary border border-line"
                    }`}
                  >
                    {item.in_stock > 0
                      ? fill(t.inStock, { qty: formatQty(item.in_stock) })
                      : t.onOrder}
                  </span>
                </div>
                <div className="flex flex-col flex-1 p-3.5 sm:p-4">
                  {item.category && (
                    <div className="text-[11px] text-ink-secondary mb-1 truncate">
                      {item.category}
                    </div>
                  )}
                  <h3 className="text-sm font-bold text-ink leading-snug mb-3 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-base font-bold text-ink tabular-nums">
                      {item.price != null
                        ? fill(t.from, {
                            price: convertToLocale({
                              amount: item.price,
                              currency_code: "kzt",
                            }),
                          })
                        : "—"}
                    </span>
                    <LocalizedClientLink
                      href={`/chat?prompt=${encodeURIComponent(
                        fill(t.orderPrompt, { title: item.title })
                      )}`}
                      className="px-3 py-1.5 rounded-lg bg-accent-container text-accent text-xs font-bold hover:bg-accent hover:text-on-accent transition-colors"
                    >
                      {t.order}
                    </LocalizedClientLink>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default TenantShowcase
