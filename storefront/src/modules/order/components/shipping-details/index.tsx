import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import { getServerMessages } from "@lib/i18n/server"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

// Блок «Доставка» страницы заказа: адрес, контакты, способ.
// На 400 px три колонки `w-1/3` наезжали друг на друга (адрес рвался на шесть
// строк, email вылезал на «Способ») — колонки раскрываются только с `small:`.
const ShippingDetails = async ({ order }: ShippingDetailsProps) => {
  const m = await getServerMessages()
  const address = order.shipping_address
  const method = order.shipping_methods?.[0]

  // Индекс у заказов из чата не заполняется (`set_delivery` его не спрашивает),
  // и строка выходила висячей запятой «, Астана». Собираем только заполненное;
  // код страны не печатаем вовсе — магазин работает по Астане.
  const cityLine = [address?.postal_code, address?.city]
    .filter((part) => !!part)
    .join(", ")
  const streetLine = [address?.address_1, address?.address_2]
    .filter((part) => !!part)
    .join(", ")

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        {m.checkout.shipping.title}
      </Heading>
      <div className="flex flex-col gap-y-6 small:flex-row small:items-start small:gap-x-8 small:gap-y-0">
        <div
          className="flex w-full min-w-0 flex-col small:w-1/3"
          data-testid="shipping-address-summary"
        >
          <Text className="text-body-large font-semibold text-ink mb-1">
            {m.checkout.addresses.shippingTitle}
          </Text>
          <Text className="text-body-large text-ink-secondary">
            {address?.first_name} {address?.last_name}
          </Text>
          <Text className="text-body-large text-ink-secondary">
            {streetLine}
          </Text>
          {!!cityLine && (
            <Text className="text-body-large text-ink-secondary">
              {cityLine}
            </Text>
          )}
        </div>

        <div
          className="flex w-full min-w-0 flex-col small:w-1/3"
          data-testid="shipping-contact-summary"
        >
          <Text className="text-body-large font-semibold text-ink mb-1">
            {m.order.contact}
          </Text>
          <Text className="text-body-large text-ink-secondary">
            {address?.phone}
          </Text>
          {/* Email не печатаем: со входом по номеру (T10.7) на заказе лежит
              служебный адрес `<цифры номера>@phone.invalid`, и покупатель
              видел в своей карточке заказа техническую строку, которой он не
              давал (находка гейта U T10.6b). Контакт покупателя — телефон. */}
        </div>

        <div
          className="flex w-full min-w-0 flex-col small:w-1/3"
          data-testid="shipping-method-summary"
        >
          <Text className="text-body-large font-semibold text-ink mb-1">
            {m.order.method}
          </Text>
          <Text className="text-body-large text-ink-secondary">
            {method
              ? `${method.name} (${convertToLocale({
                  amount: method.total ?? 0,
                  currency_code: order.currency_code,
                })})`
              : "—"}
          </Text>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default ShippingDetails
