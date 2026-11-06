import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { getServerMessages } from "@lib/i18n/server"
import { ReactNode } from "react"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
  // Когда ждать машину («31 окт., 09:00–13:00») — в шапке карточки.
  slotLabel?: string | null
  // Ход заказа (кабинет) — под реквизитами доставки.
  children?: ReactNode
}

const ICONS = {
  address: (
    <path
      d="M10 17.5s5.5-4.8 5.5-9.3a5.5 5.5 0 00-11 0c0 4.5 5.5 9.3 5.5 9.3zM10 10.3a2 2 0 100-4 2 2 0 000 4z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  phone: (
    <path
      d="M5.5 3h2.2l1.2 3.4-1.6 1.1a8.6 8.6 0 004.2 4.2l1.1-1.6 3.4 1.2v2.2a1.8 1.8 0 01-1.9 1.8A12.4 12.4 0 013.7 4.9 1.8 1.8 0 015.5 3z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  method: (
    <path
      d="M2.5 5.5h9v8h-9zM11.5 8.5h3l2.5 2.5v2.5h-5.5M5.5 15.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM14 15.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
}

const Row = ({
  icon,
  label,
  children,
  testId,
}: {
  icon: keyof typeof ICONS
  label: string
  children: ReactNode
  testId: string
}) => (
  <div className="flex items-start gap-3 py-3" data-testid={testId}>
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-container text-accent"
    >
      <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]">
        {ICONS[icon]}
      </svg>
    </span>
    <div className="flex min-w-0 flex-col">
      <span className="text-body-medium text-ink-secondary">{label}</span>
      <div className="text-body-large text-ink">{children}</div>
    </div>
  </div>
)

// Блок «Доставка» страницы заказа карточкой: когда привезут, куда, контакт и
// способ с ценой; в кабинете под ними — ход заказа (у кого он сейчас).
const ShippingDetails = async ({
  order,
  slotLabel,
  children,
}: ShippingDetailsProps) => {
  const m = await getServerMessages()
  const address = order.shipping_address
  const method = order.shipping_methods?.[0]

  // Индекс у заказов из чата не заполняется (`set_delivery` его не спрашивает),
  // и строка выходила висячей запятой «, Астана». Собираем только заполненное;
  // код страны не печатаем вовсе — магазин работает по Астане.
  const streetLine = [address?.address_1, address?.address_2]
    .filter((part) => !!part)
    .join(", ")
  const cityLine = [address?.postal_code, address?.city]
    .filter((part) => !!part)
    .join(", ")
  const name = [address?.first_name, address?.last_name]
    .filter(Boolean)
    .join(" ")
  const price = method?.total ?? 0

  return (
    <div
      className="flex flex-col rounded-card border border-line bg-surface p-4"
      data-testid="shipping-details"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-title-medium text-ink">
          {m.checkout.shipping.title}
        </h2>
        {slotLabel && (
          <span className="rounded-full bg-surface-dim px-3 py-1 text-body-medium font-semibold text-ink">
            {slotLabel}
          </span>
        )}
      </div>

      <div className="mt-1 flex flex-col divide-y divide-line">
        <Row
          icon="address"
          label={m.order.address}
          testId="shipping-address-summary"
        >
          {streetLine && <span className="block">{streetLine}</span>}
          {cityLine && (
            <span className="block text-ink-secondary">{cityLine}</span>
          )}
          {name && (
            <span className="block text-body-medium text-ink-secondary">
              {name}
            </span>
          )}
        </Row>

        {/* Email не печатаем: со входом по номеру (T10.7) на заказе лежит
            служебный адрес `<цифры номера>@phone.invalid` — контакт покупателя
            только телефон (находка гейта U T10.6b). */}
        {address?.phone && (
          <Row
            icon="phone"
            label={m.order.phone}
            testId="shipping-contact-summary"
          >
            <span className="tabular-nums">{address.phone}</span>
          </Row>
        )}

        <Row
          icon="method"
          label={m.order.method}
          testId="shipping-method-summary"
        >
          {method ? (
            <span className="flex flex-wrap items-baseline gap-x-2">
              {method.name}
              <span
                className={
                  price > 0
                    ? "tabular-nums text-ink-secondary"
                    : "font-semibold text-success"
                }
              >
                {price > 0
                  ? convertToLocale({
                      amount: price,
                      currency_code: order.currency_code,
                    })
                  : m.order.shippingFree}
              </span>
            </span>
          ) : (
            "—"
          )}
        </Row>
      </div>

      {children && (
        <div className="mt-1 border-t border-line pt-4">{children}</div>
      )}
    </div>
  )
}

export default ShippingDetails
