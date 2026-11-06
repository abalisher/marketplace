import { OrderLifecycleEvent } from "@lib/data/order-lifecycle"
import { formatShortDateTime } from "@lib/i18n/format-date"
import { getServerMessages } from "@lib/i18n/server"
import { clx } from "@medusajs/ui"

// Шаги хода заказа для покупателя. «Собран частично» и «Завершён» — оттенки
// соседних шагов, а не отдельные: покупателю важно, у кого заказ сейчас.
const STEPS = [
  "new",
  "confirmed",
  "assembling",
  "assembled",
  "in_delivery",
  "delivered",
] as const
type Step = (typeof STEPS)[number]

const STEP_OF: Record<string, Step> = {
  new: "new",
  confirmed: "confirmed",
  assembling: "assembling",
  partially_assembled: "assembled",
  assembled: "assembled",
  in_delivery: "in_delivery",
  delivered: "delivered",
  closed: "delivered",
}

// У кого заказ на шаге: продавец принимает, склад собирает, водитель везёт.
const HOLDER: Record<Step, "seller" | "warehouse" | "driver" | "buyer"> = {
  new: "seller",
  confirmed: "seller",
  assembling: "warehouse",
  assembled: "warehouse",
  in_delivery: "driver",
  delivered: "buyer",
}

const HolderIcon = ({ holder }: { holder: string }) => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
    {holder === "driver" ? (
      <path
        d="M2.5 5.5h9v8h-9zM11.5 8.5h3l2.5 2.5v2.5h-5.5M5.5 15.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM14 15.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ) : holder === "warehouse" ? (
      <path
        d="M2.5 8l7.5-4.5L17.5 8v8.5h-15zM6 16.5v-5h8v5M6 13.5h8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ) : holder === "buyer" ? (
      <path
        d="M4.5 10.5l3.5 3.5 7.5-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M3 7.5l1.5-4h11l1.5 4M3 7.5h14M3 7.5a2.3 2.3 0 004.7 0 2.3 2.3 0 004.6 0 2.3 2.3 0 004.7 0M4.5 10v6.5h11V10M8 16.5v-4h4v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    )}
  </svg>
)

// Ход заказа в кабинете: где заказ сейчас и у кого — продавца, склада,
// водителя или уже у покупателя, — с временем каждого пройденного шага из
// лога переходов (GET /store/orders/:id/lifecycle).
const OrderProgress = async ({
  status,
  previousStatus,
  deliveryMethod,
  history = [],
  placedAt,
}: {
  status: string
  previousStatus?: string | null
  deliveryMethod?: "pickup" | "delivery" | null
  history?: OrderLifecycleEvent[]
  placedAt: string | Date
}) => {
  const m = await getServerMessages()
  const t = m.cabinet.order.progress
  const steps = STEPS.filter(
    (step) => !(deliveryMethod === "pickup" && step === "in_delivery")
  )
  const stopped = status === "canceled" || status === "returned"
  const current = STEP_OF[stopped ? previousStatus ?? "new" : status] ?? "new"
  const currentIndex = Math.max(0, steps.indexOf(current))
  const shown = stopped ? steps.slice(0, currentIndex + 1) : steps

  // Время шага — последний переход в него (повторный заход после отката
  // показывает свежее время).
  const statusEvents = history.filter(
    (event) => (event.kind ?? "status") === "status"
  )
  const timeOf = (step: Step): string | null => {
    if (step === "new") {
      return formatShortDateTime(placedAt)
    }
    const event = [...statusEvents]
      .reverse()
      .find((e) => STEP_OF[e.to_status] === step)
    return formatShortDateTime(event?.created_at)
  }
  const stoppedAt = stopped
    ? formatShortDateTime(
        [...statusEvents].reverse().find((e) => e.to_status === status)
          ?.created_at
      )
    : null
  const holder = HOLDER[current]

  return (
    <div className="flex flex-col gap-3" data-testid="order-progress">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-body-large font-semibold text-ink">{t.title}</h3>
        {!stopped && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-accent-container px-3 py-1 text-body-medium font-semibold text-accent"
            data-testid="order-progress-holder"
          >
            <HolderIcon holder={holder} />
            {t.now} {t.holder[holder]}
          </span>
        )}
      </div>

      <ol className="flex flex-col">
        {shown.map((step, index) => {
          // Пройден: всё до текущего, «Доставлен» и шаг, на котором заказ отменили.
          const done =
            index < currentIndex ||
            (index === currentIndex && (step === "delivered" || stopped))
          const active =
            index === currentIndex && !stopped && step !== "delivered"
          const last = index === shown.length - 1 && !stopped
          const time = index <= currentIndex ? timeOf(step) : null
          return (
            <li
              key={step}
              className="flex gap-3"
              data-testid={`order-progress-${step}`}
            >
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={clx(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    done && "bg-accent text-on-accent",
                    active && "border-2 border-accent bg-surface",
                    !done && !active && "border-2 border-line bg-surface"
                  )}
                >
                  {done ? (
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
                      <path
                        d="M4.5 10.5l3.5 3.5 7.5-8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : active ? (
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
                  ) : null}
                </span>
                {!last && (
                  <span
                    aria-hidden="true"
                    className={clx(
                      "my-1 w-0.5 flex-1 rounded-full",
                      index < currentIndex ? "bg-accent" : "bg-line"
                    )}
                  />
                )}
              </div>
              <div
                className={clx("flex min-w-0 flex-1 flex-col", !last && "pb-4")}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={clx(
                      "text-body-large",
                      active
                        ? "font-semibold text-ink"
                        : done
                        ? "text-ink"
                        : "text-ink-secondary"
                    )}
                  >
                    {t.steps[step].title}
                  </span>
                  {time && (
                    <span className="shrink-0 text-body-medium tabular-nums text-ink-secondary">
                      {time}
                    </span>
                  )}
                </div>
                {(active || (done && step === "delivered")) && (
                  <span className="text-body-medium text-ink-secondary">
                    {t.steps[step].hint}
                  </span>
                )}
              </div>
            </li>
          )
        })}
        {stopped && (
          <li className="flex gap-3" data-testid="order-progress-stopped">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-error/15 text-error"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
                <path
                  d="M6 6l8 8M14 6l-8 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div className="flex flex-1 items-baseline justify-between gap-2">
              <span className="text-body-large font-semibold text-error">
                {status === "returned" ? t.returned : t.canceled}
              </span>
              {stoppedAt && (
                <span className="text-body-medium tabular-nums text-ink-secondary">
                  {stoppedAt}
                </span>
              )}
            </div>
          </li>
        )}
      </ol>
    </div>
  )
}

export default OrderProgress
