import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowPath, Clock, MapPin, Phone, TruckFast } from "@medusajs/icons"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import DeliverOrderPrompt from "../../components/deliver-order-prompt"
import { DataTableListError } from "../../components/data-table-list-error"
import { formatDeliverySlot } from "../../lib/delivery-slot"
import { formatAmount } from "../../lib/money"
import { orderPaymentStateMeta } from "../../lib/order"
import { orderLabel } from "../../lib/order-label"
import { routeLabel } from "../../lib/route-label"
import { sdk } from "../../lib/sdk"
import "../../styles/orders.css"
import "../../styles/delivery.css"

type DeliveryOrder = {
  order_id: string
  display_id: number | null
  order_number: string | null
  delivery_date: string | null
  delivery_window: string | null
  customer_name: string | null
  phone: string | null
  address: string | null
  items: { id: string; title: string | null; variant_title: string | null; quantity: number }[]
  total: number | null
  currency_code: string | null
  payment_state: string | null
  payment_method: string | null
  deliver_fulfillment_id: string | null
}

type DeliveryQueueResponse = { delivery_orders: DeliveryOrder[]; count: number }

// Экран «Доставка» — рабочее место водителя компании (и диспетчерский взгляд
// сотрудника площадки): заказы «В доставке», ближайший слот сверху. На точке
// водитель звонит покупателю в одно касание, сверяет состав и вручает заказ
// по коду получения, который называет покупатель: без верного кода сервер
// заказ врученным не отметит. Экран рассчитан на телефон — крупные карточки,
// а не таблица.
const DeliveryPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [deliverOrder, setDeliverOrder] = useState<DeliveryOrder | null>(null)

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["delivery-queue"],
    queryFn: () => sdk.client.fetch<DeliveryQueueResponse>("/admin/delivery-queue"),
    // Заказы появляются, когда их отгружают на складе: сверяемся при возврате
    // в приложение и раз в минуту.
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  })

  const deliver = useMutation({
    mutationFn: (input: { order: DeliveryOrder; code: string }) =>
      sdk.client.fetch(`/admin/orders/${input.order.order_id}/lifecycle/deliver`, {
        method: "POST",
        body: {
          fulfillment_id: input.order.deliver_fulfillment_id,
          delivery_code: input.code,
        },
      }),
    onSuccess: (_data, input) => {
      toast.success(
        t("delivery.delivered", {
          id: orderLabel(input.order.order_number, input.order.display_id),
        })
      )
      setDeliverOrder(null)
      void queryClient.invalidateQueries({ queryKey: ["delivery-queue"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || t("delivery.deliverError"))
    },
  })

  const orders = data?.delivery_orders ?? []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between gap-x-4 px-6 py-4">
        <div>
          <Heading level="h1">{t("delivery.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("delivery.subtitle")}
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          onClick={() => refetch()}
          isLoading={isFetching && !isLoading}
        >
          <ArrowPath />
          {t("delivery.refresh")}
        </Button>
      </div>

      {isError ? (
        <DataTableListError message={t("delivery.error")} onRetry={refetch} />
      ) : isLoading ? (
        <div className="sm-dlv-empty">{t("delivery.loading")}</div>
      ) : orders.length ? (
        <div className="sm-dlv-list">
          {orders.map((order) => {
            const payment = orderPaymentStateMeta(order.payment_state)
            return (
              <article key={order.order_id} className="sm-dlv-card">
                <div className="sm-dlv-head">
                  <span className="sm-dlv-number">
                    {orderLabel(order.order_number, order.display_id)}
                  </span>
                  {order.total != null && (
                    <span className="sm-dlv-total">
                      {formatAmount(order.total, order.currency_code)}
                    </span>
                  )}
                </div>

                <div className="sm-dlv-rows">
                  <div className="sm-dlv-row">
                    <Clock />
                    <span>
                      {order.delivery_date
                        ? formatDeliverySlot(order.delivery_date, order.delivery_window)
                        : t("delivery.noSlot")}
                    </span>
                  </div>
                  <div className="sm-dlv-row">
                    <MapPin />
                    <span>{order.address ?? t("delivery.noAddress")}</span>
                  </div>
                  <div className="sm-dlv-row">
                    <Phone />
                    <span>
                      {order.customer_name ?? t("delivery.noName")}
                      {order.phone && (
                        <>
                          {" · "}
                          <a className="sm-dlv-phone" href={`tel:${order.phone}`}>
                            {order.phone}
                          </a>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <ul className="sm-dlv-items">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <span>
                        {item.title}
                        {item.variant_title ? ` · ${item.variant_title}` : ""}
                      </span>
                      <span className="sm-dlv-qty">× {item.quantity}</span>
                    </li>
                  ))}
                </ul>

                <div className="sm-dlv-foot">
                  <span className={payment.className}>
                    {t(payment.label)}
                    {order.payment_method
                      ? ` · ${t(`payments.method.${order.payment_method}`)}`
                      : ""}
                  </span>
                  <Button
                    className="sm-dlv-action"
                    disabled={!order.deliver_fulfillment_id}
                    onClick={() => setDeliverOrder(order)}
                  >
                    {t("delivery.deliver")}
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="sm-dlv-empty">
          <TruckFast />
          <span>{t("delivery.empty")}</span>
        </div>
      )}

      <DeliverOrderPrompt
        order={
          deliverOrder
            ? {
                id: deliverOrder.order_id,
                display_id: deliverOrder.display_id ?? undefined,
                order_number: deliverOrder.order_number,
              }
            : null
        }
        onClose={() => setDeliverOrder(null)}
        onSubmit={(_id, code) => {
          if (deliverOrder) {
            deliver.mutate({ order: deliverOrder, code })
          }
        }}
        isPending={deliver.isPending}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Delivery", ru: "Доставка" }),
  icon: TruckFast,
})

export default DeliveryPage
