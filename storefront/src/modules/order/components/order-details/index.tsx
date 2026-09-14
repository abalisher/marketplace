import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { formatDate } from "@lib/i18n/format-date"
import { getServerMessages } from "@lib/i18n/server"
import { resolveLocale } from "@lib/i18n/resolve-locale"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = async ({ order, showStatus }: OrderDetailsProps) => {
  const [m, locale] = await Promise.all([getServerMessages(), resolveLocale()])

  // Статусы ядра переводим по словарю; неизвестное значение (новый статус
  // Medusa) показываем как есть, а не падаем.
  const label = (dictionary: Record<string, string>, value: string) =>
    dictionary[value] ?? value.split("_").join(" ")

  const orderDate = formatDate(order.created_at, locale)

  return (
    <div>
      <Text>
        {m.order.confirmationSent}{" "}
        <span className="text-ink font-semibold" data-testid="order-email">
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        {m.order.orderDate}: <span data-testid="order-date">{orderDate}</span>
      </Text>
      <Text className="mt-2 text-accent">
        {m.order.orderNumber}:{" "}
        <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              {m.order.orderStatus}:{" "}
              <span className="text-ink-secondary" data-testid="order-status">
                {label(m.order.fulfillmentStatus, order.fulfillment_status)}
              </span>
            </Text>
            <Text>
              {m.order.paymentStatus}:{" "}
              <span
                className="text-ink-secondary"
                data-testid="order-payment-status"
              >
                {label(m.order.paymentStatusValue, order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
