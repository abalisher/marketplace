import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import {
  Bolt,
  CheckCircleSolid,
  EllipsisHorizontal,
  MapPin,
  SquaresPlus,
  TruckFast,
  XCircleSolid,
} from "@medusajs/icons"
import {
  Container,
  DropdownMenu,
  Heading,
  IconButton,
  StatusBadge,
  Text,
  toast,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import CancelOrderPrompt from "../components/cancel-order-prompt"
import DeliverOrderPrompt from "../components/deliver-order-prompt"
import { useOrderLifecycle } from "../hooks/use-order-lifecycle"
import {
  AdminOrderLifecycleResponse,
  ORDER_DELIVERY_METHOD_META,
  ORDER_LIFECYCLE_STATUS_META,
  ORDER_TRANSITIONS,
  OrderLifecycleStatus,
  OrderTransition,
} from "../lib/order"
import { sdk } from "../lib/sdk"

// Иконка пункта перехода в «...»-меню (по сегменту пути).
const TRANSITION_ICONS: Record<OrderTransition["path"], React.ReactNode> = {
  confirm: <CheckCircleSolid className="text-ui-fg-subtle" />,
  "start-assembly": <Bolt className="text-ui-fg-subtle" />,
  "complete-assembly": <SquaresPlus className="text-ui-fg-subtle" />,
  ship: <TruckFast className="text-ui-fg-subtle" />,
  deliver: <MapPin className="text-ui-fg-subtle" />,
  close: <CheckCircleSolid className="text-ui-fg-subtle" />,
  cancel: <XCircleSolid className="text-ui-fg-subtle" />,
}

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

// Widget жизненного цикла заказа на ядровой странице заказа: текущий бизнес-
// статус ТЗ (StatusBadge), доступные из него переходы (в «...»-меню, идиома
// секций ядра) и лог переходов. Статус/лог — своим запросом
// (GET /admin/orders/:id/lifecycle); позиции и fulfillment для переходов
// сборки/отгрузки/доставки берём из данных ядровой страницы заказа (prop data).
const OrderLifecycleCardWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const { transitionMutation } = useOrderLifecycle()
  const [cancelOpen, setCancelOpen] = useState(false)
  // Вручение по коду: диалог хранит fulfillment, выбранный при открытии.
  const [deliverFulfillmentId, setDeliverFulfillmentId] = useState<
    string | null
  >(null)

  const { data: detail, isLoading } = useQuery({
    queryKey: ["order-lifecycle", "detail", data.id],
    queryFn: () =>
      sdk.client.fetch<AdminOrderLifecycleResponse>(
        `/admin/orders/${data.id}/lifecycle`
      ),
  })

  const status = detail?.status ?? null
  const history = detail?.history ?? []
  // Карта переходов зависит от способа получения (delivery/pickup/counter).
  const method = detail?.delivery_method ?? "delivery"
  const transitions = status ? ORDER_TRANSITIONS[method][status] : []
  const statusMeta = status ? ORDER_LIFECYCLE_STATUS_META[status] : null

  const meta = (value: OrderLifecycleStatus) =>
    ORDER_LIFECYCLE_STATUS_META[value]

  // Позиции заказа для сборки/отгрузки — все позиции (полная сборка/отгрузка).
  const orderItems = () =>
    (data.items ?? []).map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }))

  // Fulfillment под отгрузку/доставку: для ship — ещё не отгруженный, для
  // deliver — отгруженный, но не доставленный (оба без отмены).
  const pickFulfillment = (path: OrderTransition["path"]) => {
    const fulfillments = (data.fulfillments ?? []).filter(
      (f) => !f.canceled_at
    )
    if (path === "deliver") {
      return (
        fulfillments.find((f) => f.shipped_at && !f.delivered_at) ??
        fulfillments.find((f) => !f.delivered_at)
      )
    }
    return fulfillments.find((f) => !f.shipped_at) ?? fulfillments[0]
  }

  const runTransition = (transition: OrderTransition) => {
    // Отмена — через диалог (необязательная причина).
    if (transition.prompt) {
      setCancelOpen(true)
      return
    }

    const body: {
      items?: { id: string; quantity: number }[]
      fulfillment_id?: string
    } = {}

    if (transition.needsItems) {
      const items = orderItems()
      if (!items.length) {
        toast.error("This order has no items to fulfill.")
        return
      }
      body.items = items
    }

    if (transition.needsFulfillment) {
      const fulfillment = pickFulfillment(transition.path)
      if (!fulfillment) {
        toast.error("No fulfillment found. Complete assembly first.")
        return
      }
      body.fulfillment_id = fulfillment.id
    }

    // Вручение по коду получения — через диалог (код называет покупатель).
    if (transition.needsCode) {
      setDeliverFulfillmentId(body.fulfillment_id ?? null)
      return
    }

    transitionMutation.mutate({ orderId: data.id, transition, body })
  }

  const cancelTransition = transitions.find((t) => t.path === "cancel")
  const deliverTransition = transitions.find((t) => t.path === "deliver")

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-x-3">
          <Heading level="h2">Order lifecycle</Heading>
          {statusMeta && (
            <StatusBadge color={statusMeta.color}>
              {statusMeta.label}
            </StatusBadge>
          )}
          {detail?.delivery_method && (
            <StatusBadge color="grey">
              {ORDER_DELIVERY_METHOD_META[detail.delivery_method].label}
            </StatusBadge>
          )}
        </div>
        {/* Действия — в «...»-меню, как у секций стандартных страниц ядра. */}
        {transitions.length > 0 && (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <IconButton size="small" variant="transparent">
                <EllipsisHorizontal />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              {transitions.map((transition) => (
                <DropdownMenu.Item
                  key={transition.path}
                  className="gap-x-2"
                  onClick={() => runTransition(transition)}
                  disabled={transitionMutation.isPending}
                >
                  {TRANSITION_ICONS[transition.path]}
                  {transition.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu>
        )}
      </div>

      {status === null ? (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading
              ? "Loading…"
              : "This order has no lifecycle record (it was not placed through the marketplace flow)."}
          </Text>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="px-6 py-4">
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              History
            </Text>
          </div>
          {history.length ? (
            <ul className="flex flex-col">
              {history
                .slice()
                .reverse()
                .map((event) => (
                  <li
                    key={event.id}
                    className="flex flex-col gap-y-1 border-t px-6 py-3"
                  >
                    <div className="flex items-center gap-x-2">
                      <div
                        className={`size-2 rounded-full ${
                          meta(event.to_status).dotClass
                        }`}
                      />
                      <Text size="small" weight="plus">
                        {meta(event.to_status).label}
                      </Text>
                      <Text size="small" className="text-ui-fg-muted">
                        {formatDateTime(event.created_at)}
                      </Text>
                    </div>
                    <Text size="small" className="text-ui-fg-subtle">
                      {event.from_status
                        ? `from ${meta(event.from_status).label} · `
                        : ""}
                      by {event.actor_type}
                      {event.reason ? ` · ${event.reason}` : ""}
                    </Text>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="border-t px-6 py-4">
              <Text size="small" className="text-ui-fg-subtle">
                No transitions yet.
              </Text>
            </div>
          )}
        </div>
      )}

      <CancelOrderPrompt
        order={
          cancelOpen ? { id: data.id, display_id: data.display_id } : null
        }
        onClose={() => setCancelOpen(false)}
        onSubmit={(id, reason) => {
          if (!cancelTransition) {
            return
          }
          transitionMutation.mutate(
            {
              orderId: id,
              transition: cancelTransition,
              body: { reason },
            },
            { onSuccess: () => setCancelOpen(false) }
          )
        }}
        isPending={transitionMutation.isPending}
      />

      <DeliverOrderPrompt
        order={
          deliverFulfillmentId
            ? { id: data.id, display_id: data.display_id }
            : null
        }
        onClose={() => setDeliverFulfillmentId(null)}
        onSubmit={(id, code) => {
          if (!deliverTransition || !deliverFulfillmentId) {
            return
          }
          transitionMutation.mutate(
            {
              orderId: id,
              transition: deliverTransition,
              body: {
                fulfillment_id: deliverFulfillmentId,
                delivery_code: code,
              },
            },
            { onSuccess: () => setDeliverFulfillmentId(null) }
          )
        }}
        isPending={transitionMutation.isPending}
      />
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderLifecycleCardWidget
