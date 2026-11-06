import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import {
  Bolt,
  CheckCircleSolid,
  Clock,
  EllipsisHorizontal,
  MapPin,
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
import { useTranslation } from "react-i18next"
import CancelOrderPrompt from "../components/cancel-order-prompt"
import DeliverOrderPrompt from "../components/deliver-order-prompt"
import RescheduleDeliveryPrompt from "../components/reschedule-delivery-prompt"
import { useOrderLifecycle } from "../hooks/use-order-lifecycle"
import { usePanelActor } from "../hooks/use-panel-actor"
import { formatDateTime } from "../lib/date"
import { formatDeliverySlot } from "../lib/delivery-slot"
import {
  AdminOrderLifecycleResponse,
  OrderLifecycleEvent,
  OrderLifecycleStatus,
  OrderTransition,
  canRescheduleDelivery,
  orderDeliveryMethodMeta,
  orderStatusMeta,
  orderTransitions,
  transitionsForActor,
} from "../lib/order"
import { sdk } from "../lib/sdk"

// Иконка пункта перехода в «...»-меню (по сегменту пути).
const TRANSITION_ICONS: Record<OrderTransition["path"], React.ReactNode> = {
  confirm: <CheckCircleSolid className="text-ui-fg-subtle" />,
  "start-assembly": <Bolt className="text-ui-fg-subtle" />,
  ship: <TruckFast className="text-ui-fg-subtle" />,
  deliver: <MapPin className="text-ui-fg-subtle" />,
  close: <CheckCircleSolid className="text-ui-fg-subtle" />,
  cancel: <XCircleSolid className="text-ui-fg-subtle" />,
}

// Откуда пришла запись лога: у перехода — прежний статус, у переноса доставки —
// прежнее окно («с 6 сент., 13:00–17:00»). Разделитель добавляется тут же,
// чтобы строка «откуда · кто · почему» собиралась одинаково для обоих родов.
const eventSource = (
  event: OrderLifecycleEvent,
  t: (key: string, options?: Record<string, unknown>) => string
): string => {
  if (event.kind === "slot") {
    return event.from_slot_date
      ? t("order.reschedule.logFrom", {
          slot: formatDeliverySlot(event.from_slot_date, event.from_slot_window),
        }) + " · "
      : ""
  }
  return event.from_status
    ? t("order.widget.fromStatus", {
        status: t(orderStatusMeta(event.from_status).label),
      }) + " · "
    : ""
}

// Widget жизненного цикла заказа на ядровой странице заказа: текущий бизнес-
// статус ТЗ (StatusBadge), доступные из него переходы (в «...»-меню, идиома
// секций ядра) и лог переходов. Статус/лог — своим запросом
// (GET /admin/orders/:id/lifecycle); позиции и fulfillment для переходов
// сборки/отгрузки/доставки берём из данных ядровой страницы заказа (prop data).
const OrderLifecycleCardWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const { t } = useTranslation()
  const { transitionMutation, rescheduleMutation } = useOrderLifecycle()
  const [cancelOpen, setCancelOpen] = useState(false)
  // Перенос доставки (T5.6b): статус не меняется, поэтому это не переход —
  // отдельный пункт меню и свой диалог.
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
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
  // Способ получения после пивота всегда delivery (см. lib/order.ts), но у
  // заказов до пивота в базе остались pickup/counter — читаем через словарь с
  // фолбэком, иначе виджет уронил бы всю страницу заказа.
  const method = detail?.delivery_method ?? "delivery"
  const actor = usePanelActor()
  const transitions = transitionsForActor(orderTransitions(method, status), actor)
  const statusMeta = status ? orderStatusMeta(status) : null

  const meta = (value: OrderLifecycleStatus) => orderStatusMeta(value)

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
        toast.error(t("order.widget.noItems"))
        return
      }
      body.items = items
    }

    if (transition.needsFulfillment) {
      const fulfillment = pickFulfillment(transition.path)
      if (!fulfillment) {
        toast.error(t("order.widget.noFulfillment"))
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
          <Heading level="h2">{t("order.widget.title")}</Heading>
          {statusMeta && (
            <StatusBadge color={statusMeta.color}>
              {t(statusMeta.label)}
            </StatusBadge>
          )}
          {detail?.delivery_method && (
            <StatusBadge color="grey">
              {t(orderDeliveryMethodMeta(detail.delivery_method).label)}
            </StatusBadge>
          )}
        </div>
        {/* Действия — в «...»-меню, как у секций стандартных страниц ядра. */}
        {(transitions.length > 0 || canRescheduleDelivery(method, status)) && (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              {/* Метка для скриншотера гейта U: селектор не должен зависеть от
                  языка подписи (идиома data-sm-action карточек-drawer'ов). */}
              <IconButton
                size="small"
                variant="transparent"
                data-sm-action="lifecycle-menu"
              >
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
                  {t(transition.label)}
                </DropdownMenu.Item>
              ))}
              {canRescheduleDelivery(method, status) && (
                <DropdownMenu.Item
                  className="gap-x-2"
                  onClick={() => setRescheduleOpen(true)}
                  disabled={rescheduleMutation.isPending}
                >
                  <Clock className="text-ui-fg-subtle" />
                  {t(
                    detail?.delivery_date
                      ? "order.reschedule.action"
                      : "order.reschedule.assignAction"
                  )}
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu>
        )}
      </div>

      {status === null ? (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading ? t("common.loading") : t("order.widget.empty")}
          </Text>
        </div>
      ) : (
        // Метка секции — для кадров гейта U: селектор не должен зависеть от
        // языка подписи (идиома data-sm-section карточек-drawer'ов).
        <div className="flex flex-col" data-sm-section="lifecycle-history">
          <div className="px-6 py-4">
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              {t("order.widget.history")}
            </Text>
          </div>
          {history.length ? (
            <ul className="flex flex-col">
              {history
                .slice()
                .reverse()
                .map((event) => {
                  // Перенос доставки (T5.6b) — тот же лог, но не переход:
                  // заголовком идёт новое окно, а не статус (он не менялся).
                  const slotEvent = event.kind === "slot"
                  return (
                    <li
                      key={event.id}
                      className="flex flex-col gap-y-1 border-t px-6 py-3"
                    >
                      <div className="flex items-center gap-x-2">
                        <div
                          className={`size-2 rounded-full ${
                            slotEvent
                              ? "bg-ui-tag-neutral-icon"
                              : meta(event.to_status).dotClass
                          }`}
                        />
                        <Text size="small" weight="plus">
                          {slotEvent
                            ? t("order.reschedule.logTitle", {
                                slot: formatDeliverySlot(
                                  event.to_slot_date,
                                  event.to_slot_window
                                ),
                              })
                            : t(meta(event.to_status).label)}
                        </Text>
                        <Text size="small" className="text-ui-fg-muted">
                          {formatDateTime(event.created_at)}
                        </Text>
                      </div>
                      <Text size="small" className="text-ui-fg-subtle">
                        {eventSource(event, t)}
                        {/* Имя человека, а не одна роль: «администратор» на
                            вопрос «кто перевёл» не отвечает, а лог статусов ТЗ
                            ведёт именно ради этого (T4.12). */}
                        {event.actor_name
                          ? t("order.widget.byPerson", {
                              name: event.actor_name,
                              actor: t(`order.actor.${event.actor_role ?? event.actor_type}`),
                            })
                          : t("order.widget.by", {
                              actor: t(`order.actor.${event.actor_role ?? event.actor_type}`),
                            })}
                        {event.reason ? ` · ${event.reason}` : ""}
                      </Text>
                    </li>
                  )
                })}
            </ul>
          ) : (
            <div className="border-t px-6 py-4">
              <Text size="small" className="text-ui-fg-subtle">
                {t("order.widget.noTransitions")}
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

      <RescheduleDeliveryPrompt
        order={
          rescheduleOpen ? { id: data.id, display_id: data.display_id } : null
        }
        onClose={() => setRescheduleOpen(false)}
        onSubmit={(id, slot, reason) =>
          rescheduleMutation.mutate(
            { orderId: id, slot, reason },
            { onSuccess: () => setRescheduleOpen(false) }
          )
        }
        isPending={rescheduleMutation.isPending}
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
