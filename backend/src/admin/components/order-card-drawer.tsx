import { ArrowUpRightOnBox, DocumentText } from "@medusajs/icons"
import {
  Badge,
  Button,
  Drawer,
  StatusBadge,
  Text,
  clx,
  toast,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useOrderLifecycle } from "../hooks/use-order-lifecycle"
import { formatDate, formatDateTime } from "../lib/date"
import { formatDeliverySlot } from "../lib/delivery-slot"
import { DOCUMENT_TYPE_META, DocumentType } from "../lib/documents"
import { formatAmount } from "../lib/money"
import {
  AdminOrderCard,
  AdminOrderCardResponse,
  OrderTransition,
  canRescheduleDelivery,
  orderCardStages,
  orderPaymentStateMeta,
  orderStatusMeta,
  orderTransitions,
} from "../lib/order"
import { sdk } from "../lib/sdk"
import DisputeCardDrawer from "./dispute-card-drawer"
import { disputeCategoryMeta } from "../lib/reviews"
import CancelOrderPrompt from "./cancel-order-prompt"
import DeliverOrderPrompt from "./deliver-order-prompt"
import RescheduleDeliveryPrompt from "./reschedule-delivery-prompt"

type OrderCardDrawerProps = {
  // null — карточка закрыта
  orderId: string | null
  onClose: () => void
}

// Карточка заказа поверх очереди (макет 1c, T4.2c): таймлайн статусов,
// покупатель с лимитом отсрочки, позиции с итогами, доставка, документы и
// кнопки переходов. До неё клик по строке очереди уводил на ядровую страницу
// заказа — оператор терял фильтры и место в списке, а «очередь — тупик» был
// блокером 1 Мадины (фокус-группа T4.6).
//
// Данные — ОДНИМ запросом GET /admin/orders/:id/lifecycle/card: экран ничего не
// считает, включая выбор fulfillment'а под отгрузку/вручение (в виджете
// страницы заказа это делал браузер по ядровым данным).
const OrderCardDrawer = ({ orderId, onClose }: OrderCardDrawerProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { transitionMutation, rescheduleMutation } = useOrderLifecycle()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [deliverOpen, setDeliverOpen] = useState(false)
  // Перенос доставки (T5.6b) — диалог поверх карточки, как отмена и вручение.
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  // Открытое рабочее место претензии по этому заказу (T4.11).
  const [disputeId, setDisputeId] = useState<string | null>(null)

  useEffect(() => {
    setCancelOpen(false)
    setDeliverOpen(false)
    setRescheduleOpen(false)
  }, [orderId])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["order-lifecycle", "card", orderId],
    queryFn: () =>
      sdk.client.fetch<AdminOrderCardResponse>(
        `/admin/orders/${orderId}/lifecycle/card`
      ),
    enabled: !!orderId,
  })

  const card = data?.order_card ?? null
  const statusMeta = card?.status ? orderStatusMeta(card.status) : null
  const transitions = card
    ? orderTransitions(card.delivery_method, card.status)
    : []
  const cancelTransition = transitions.find((entry) => entry.path === "cancel")
  const deliverTransition = transitions.find((entry) => entry.path === "deliver")

  // Переход из карточки. Позиции и fulfillment берём из ответа бэкенда
  // (transition_targets); вручение и отмена идут через диалоги — код получения
  // называет покупатель, отмена необратима.
  const runTransition = (transition: OrderTransition) => {
    if (!card) {
      return
    }
    if (transition.prompt) {
      setCancelOpen(true)
      return
    }

    const targets = card.transition_targets
    const body: {
      items?: { id: string; quantity: number }[]
      fulfillment_id?: string
    } = {}

    if (transition.needsItems) {
      if (!targets.items.length) {
        toast.error(t("order.widget.noItems"))
        return
      }
      body.items = targets.items
    }

    if (transition.needsFulfillment) {
      const fulfillmentId =
        transition.path === "deliver"
          ? targets.deliver_fulfillment_id
          : targets.ship_fulfillment_id
      if (!fulfillmentId) {
        toast.error(t("order.widget.noFulfillment"))
        return
      }
      body.fulfillment_id = fulfillmentId
    }

    if (transition.needsCode) {
      setDeliverOpen(true)
      return
    }

    transitionMutation.mutate({ orderId: card.order_id, transition, body })
  }

  return (
    <Drawer open={!!orderId} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Content className="sm-order-card">
        <Drawer.Header>
          <div className="flex flex-col gap-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Drawer.Title>
                {card?.display_id != null
                  ? t("orderQueue.orderNo", { id: card.display_id })
                  : t("orderCard.title")}
              </Drawer.Title>
              {statusMeta && (
                <StatusBadge color={statusMeta.color}>
                  {t(statusMeta.label)}
                </StatusBadge>
              )}
              {card && (
                <Badge size="2xsmall">
                  {t(orderPaymentStateMeta(card.payment_state).label)}
                </Badge>
              )}
            </div>
            {card && (
              <div className="flex flex-wrap items-center gap-x-3">
                {card.created_at && (
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {formatDateTime(card.created_at)}
                  </Text>
                )}
                {/* Полная страница заказа остаётся доступной: там история версий
                    документов, отзывы и ядровые операции. Ссылка живёт в шапке,
                    а не среди кнопок футера — футер отдан действиям над
                    заказом, и четвёртая кнопка ломала его в две строки. */}
                <button
                  type="button"
                  className="sm-card-link"
                  onClick={() => navigate(`/orders/${card.order_id}`)}
                >
                  <ArrowUpRightOnBox />
                  {t("orderCard.openOrder")}
                </button>
              </div>
            )}
          </div>
        </Drawer.Header>

        <Drawer.Body className="flex flex-col gap-y-6 overflow-y-auto">
          {isError ? (
            <div className="flex flex-col items-start gap-y-3">
              <Text size="small" className="text-ui-fg-subtle">
                {t("orderCard.error")}
              </Text>
              <Button size="small" variant="secondary" onClick={() => refetch()}>
                {t("orderQueue.retry")}
              </Button>
            </div>
          ) : !card ? (
            <Text size="small" className="text-ui-fg-subtle">
              {isLoading ? t("common.loading") : t("order.widget.empty")}
            </Text>
          ) : (
            <>
              <ActiveDispute card={card} onOpen={setDisputeId} />
              <Timeline card={card} />
              <Customer card={card} />
              <Items card={card} />
              <Delivery card={card} onReschedule={() => setRescheduleOpen(true)} />
              <Documents card={card} />
            </>
          )}
        </Drawer.Body>

        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="small" variant="secondary">
              {t("common.close")}
            </Button>
          </Drawer.Close>
          {/* Действия: опасное (отмена) — danger-кнопкой, остальные — обычными.
              Порядок как в карте переходов: сначала движение вперёд. */}
          {transitions
            .filter((entry) => !entry.danger)
            .map((entry) => (
              <Button
                key={entry.path}
                size="small"
                isLoading={transitionMutation.isPending}
                onClick={() => runTransition(entry)}
              >
                {t(entry.label)}
              </Button>
            ))}
          {cancelTransition && (
            <Button
              size="small"
              variant="danger"
              disabled={transitionMutation.isPending}
              onClick={() => setCancelOpen(true)}
            >
              {t(cancelTransition.label)}
            </Button>
          )}
        </Drawer.Footer>
      </Drawer.Content>

      <CancelOrderPrompt
        order={
          cancelOpen && card
            ? { id: card.order_id, display_id: card.display_id ?? undefined }
            : null
        }
        onClose={() => setCancelOpen(false)}
        onSubmit={(id, reason) => {
          if (!cancelTransition) {
            return
          }
          transitionMutation.mutate(
            { orderId: id, transition: cancelTransition, body: { reason } },
            { onSuccess: () => setCancelOpen(false) }
          )
        }}
        isPending={transitionMutation.isPending}
      />

      <RescheduleDeliveryPrompt
        order={
          rescheduleOpen && card
            ? { id: card.order_id, display_id: card.display_id ?? undefined }
            : null
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

      <DisputeCardDrawer
        disputeId={disputeId}
        onClose={() => setDisputeId(null)}
      />

      <DeliverOrderPrompt
        order={
          deliverOpen && card
            ? { id: card.order_id, display_id: card.display_id ?? undefined }
            : null
        }
        onClose={() => setDeliverOpen(false)}
        onSubmit={(id, code) => {
          const fulfillmentId = card?.transition_targets.deliver_fulfillment_id
          if (!deliverTransition || !fulfillmentId) {
            return
          }
          transitionMutation.mutate(
            {
              orderId: id,
              transition: deliverTransition,
              body: { fulfillment_id: fulfillmentId, delivery_code: code },
            },
            { onSuccess: () => setDeliverOpen(false) }
          )
        }}
        isPending={transitionMutation.isPending}
      />
    </Drawer>
  )
}

// Активная претензия по заказу — первым блоком карточки. Продавец обязан узнать
// о ней, ОТКРЫВ заказ: до T4.11 претензия жила только внизу ядровой страницы
// заказа, и оператор сборки/отгрузки о ней не знал (Ф-прогон 2026-08-18).
const ActiveDispute = ({
  card,
  onOpen,
}: {
  card: AdminOrderCard
  onOpen: (disputeId: string) => void
}) => {
  const { t } = useTranslation()
  const dispute = card.active_dispute

  if (!dispute) {
    return null
  }

  return (
    <div className="border-ui-tag-red-border bg-ui-tag-red-bg flex flex-col gap-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-x-3">
        <Text size="small" weight="plus">
          {t("reviews.card.activeOnOrder", {
            category: t(disputeCategoryMeta(dispute.category).label),
          })}
        </Text>
        <Button
          size="small"
          variant="secondary"
          data-sm-action="open-claim"
          onClick={() => onOpen(dispute.id)}
        >
          {t("reviews.card.openClaim")}
        </Button>
      </div>
      <Text size="xsmall" className="text-ui-fg-subtle">
        {dispute.description}
      </Text>
    </div>
  )
}

// Заголовок блока карточки.
const Section = ({
  title,
  anchor,
  action,
  children,
}: {
  title: string
  // Метка блока для скриншотера гейта U (scrollTo к «Документам»).
  anchor?: string
  action?: React.ReactNode
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-y-3" data-sm-section={anchor}>
    <div className="flex items-center justify-between gap-x-2">
      <Text size="small" weight="plus">
        {title}
      </Text>
      {action}
    </div>
    {children}
  </div>
)

// Пара «подпись + значение».
const Field = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-y-1">
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text size="small">{children}</Text>
  </div>
)

// Таймлайн статусов: прямой путь заказа, пройденные стадии — с датой перехода.
// Дата у стадии «Новый» пустая намеренно: создание заказа переходом не
// логируется, а выдуманная дата хуже прочерка.
const Timeline = ({ card }: { card: AdminOrderCard }) => {
  const { t } = useTranslation()
  const stages = orderCardStages(card.status, card.history)

  return (
    <Section title={t("orderCard.timeline")}>
      <ol className="sm-order-timeline">
        {stages.map((stage) => (
          <li
            key={stage.status}
            className={clx("sm-order-stage", {
              "sm-order-stage-done": stage.state === "done",
              "sm-order-stage-current": stage.state === "current",
            })}
          >
            <Text
              size="small"
              weight={stage.state === "current" ? "plus" : "regular"}
              className={
                stage.state === "upcoming" ? "text-ui-fg-muted" : undefined
              }
            >
              {t(orderStatusMeta(stage.status).label)}
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              {stage.at ? formatDateTime(stage.at) : ""}
            </Text>
          </li>
        ))}
      </ol>
      {card.note && (
        <Text size="xsmall" className="text-ui-fg-subtle">
          {t("orderCard.note", { note: card.note })}
        </Text>
      )}
    </Section>
  )
}

// Покупатель. У юрлица — лимит отсрочки: продавцу перед сборкой важно, хватает
// ли компании свободного лимита (постоплата), и это единственное место карточки,
// где эти деньги видны.
const Customer = ({ card }: { card: AdminOrderCard }) => {
  const { t } = useTranslation()
  const { customer, credit } = card

  return (
    <Section title={t("orderCard.customer")}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Field label={t("orderCard.buyer")}>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{customer.name ?? "—"}</span>
            {customer.is_company && (
              <Badge size="2xsmall" color="blue">
                {t("orderQueue.companyBadge")}
              </Badge>
            )}
          </span>
        </Field>
        {customer.company_bin && (
          <Field label={t("orderCard.bin")}>{customer.company_bin}</Field>
        )}
        {/* Контакты не повторяют плательщика: без имени им и становится
            телефон (или почта), и карточка показывала одну строку дважды —
            «Плательщик: +7…» и «Телефон: +7…» (находка Ф-прогона Асель). */}
        {!(customer.phone && customer.phone === customer.name) && (
          <Field label={t("orderCard.phone")}>{customer.phone ?? "—"}</Field>
        )}
        {/* Почта показывается, только если она есть и не дублирует имя:
            у покупателя, вошедшего по телефону, почты нет вовсе — бэкенд
            отдаёт null вместо системного адреса (T12.13). */}
        {customer.email && customer.email !== customer.name && (
          <Field label={t("orderCard.email")}>{customer.email}</Field>
        )}
        {customer.is_company && (
          <Field label={t("orderCard.creditLimit")}>
            {/* Лимит 0 — это «не назначен», а не «свободно 0 из 0»: карточка
                скоринга у компании есть, но отсрочку ей не открывали. */}
            {credit && credit.limit > 0
              ? t("orderCard.creditValue", {
                  available: formatAmount(
                    credit.available,
                    card.totals.currency_code
                  ),
                  limit: formatAmount(credit.limit, card.totals.currency_code),
                })
              : t("orderCard.creditNone")}
          </Field>
        )}
      </div>
    </Section>
  )
}

// Позиции и итоги. Деньги СХОДЯТСЯ: «Товары» + «Доставка» − «Скидка» = «Итого»
// (нулевые строки скидки не печатаем — пустая цифра читается как потерянная,
// грабля T3.11).
const Items = ({ card }: { card: AdminOrderCard }) => {
  const { t } = useTranslation()
  const currency = card.totals.currency_code
  const money = (amount: number | null) =>
    amount == null ? "—" : formatAmount(amount, currency)

  return (
    <Section title={t("orderCard.items")}>
      <ul className="flex flex-col gap-y-3">
        {card.items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-x-4">
            <div className="flex min-w-0 flex-col">
              <Text size="small" className="truncate">
                {item.title}
              </Text>
              {/* Количество — числом со знаком умножения: единицу (мешок,
                  тонна, лист) несёт подпись варианта, а склонять её на клиенте
                  нельзя (грабля T2.11 — «за тонна»). */}
              <Text size="xsmall" className="text-ui-fg-subtle">
                {[
                  item.variant_title,
                  item.unit_price != null
                    ? `${item.quantity} × ${money(item.unit_price)}`
                    : `× ${item.quantity}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </div>
            <Text size="small" className="sm-cell-num sm-cell-strong">
              {money(item.total)}
            </Text>
          </li>
        ))}
        {!card.items.length && (
          <Text size="small" className="text-ui-fg-subtle">
            {t("orderCard.noItems")}
          </Text>
        )}
      </ul>
      <div className="flex flex-col gap-y-1 border-t pt-3">
        <TotalRow label={t("orderCard.itemTotal")} value={money(card.totals.item_total)} />
        <TotalRow
          label={t("orderCard.shippingTotal")}
          value={money(card.totals.shipping_total)}
        />
        {!!card.totals.discount_total && (
          <TotalRow
            label={t("orderCard.discountTotal")}
            value={`− ${money(card.totals.discount_total)}`}
          />
        )}
        <TotalRow label={t("orderCard.total")} value={money(card.totals.total)} strong />
      </div>
    </Section>
  )
}

const TotalRow = ({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) => (
  <div className="flex items-center justify-between gap-x-4">
    <Text size="small" className={strong ? undefined : "text-ui-fg-subtle"}>
      {label}
    </Text>
    <Text
      size="small"
      weight={strong ? "plus" : "regular"}
      className="sm-cell-num"
    >
      {value}
    </Text>
  </div>
)

// Доставка: слот (дата и окно приезда), адрес, получатель, телефон и тариф.
// Слот можно подвинуть, пока заказ не уехал (T5.6b) — кнопка стоит в шапке
// блока доставки, а не среди действий заказа: перенос не двигает статус.
// Слот первым полем — на вопрос «когда везём» продавец отвечает чаще, чем на
// «куда», и покупателю в чате обещано именно это окно (T5.6). У заказов,
// оформленных до появления слотов, вместо него прочерк и подпись-объяснение:
// пустое поле без причины читается как сбой загрузки.
const Delivery = ({
  card,
  onReschedule,
}: {
  card: AdminOrderCard
  onReschedule: () => void
}) => {
  const { t } = useTranslation()
  const { delivery } = card
  const address = [delivery.postal_code, delivery.city, delivery.address]
    .filter((part) => !!part)
    .join(", ")

  return (
    <Section
      title={t("orderCard.delivery")}
      anchor="delivery"
      action={
        canRescheduleDelivery(card.delivery_method, card.status) ? (
          <Button
            size="small"
            variant="secondary"
            data-sm-action="reschedule-delivery"
            onClick={onReschedule}
          >
            {t(
              card.delivery.slot_date
                ? "order.reschedule.action"
                : "order.reschedule.assignAction"
            )}
          </Button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Field label={t("orderCard.slot")}>
          {formatDeliverySlot(delivery.slot_date, delivery.slot_window)}
        </Field>
        <Field label={t("orderCard.address")}>{address || "—"}</Field>
        <Field label={t("orderCard.recipient")}>
          {delivery.recipient ?? "—"}
        </Field>
        <Field label={t("orderCard.deliveryPhone")}>
          {delivery.phone ?? "—"}
        </Field>
        <Field label={t("orderCard.shippingMethod")}>
          {delivery.shipping_method ?? "—"}
        </Field>
      </div>
      {!delivery.slot_date && (
        <Text size="xsmall" className="text-ui-fg-muted">
          {t("orderCard.slotHint")}
        </Text>
      )}
    </Section>
  )
}

// Документы заказа — актуальные версии со ссылкой на PDF. Выпуск и отметка
// «отправлен клиенту» остаются на странице заказа (widget T4.9): в карточке
// оператору нужно видеть, что документы есть.
const Documents = ({ card }: { card: AdminOrderCard }) => {
  const { t } = useTranslation()

  if (!card.documents.length) {
    return (
      <Section title={t("orderCard.documents")} anchor="documents">
        <Text size="small" className="text-ui-fg-subtle">
          {t("documents.widget.empty")}
        </Text>
      </Section>
    )
  }

  return (
    <Section title={t("orderCard.documents")} anchor="documents">
      <ul className="flex flex-col gap-y-2">
        {card.documents.map((doc) => {
          const meta = DOCUMENT_TYPE_META[doc.type as DocumentType]
          return (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-x-3"
            >
              <div className="flex min-w-0 items-center gap-x-2">
                <DocumentText className="text-ui-fg-subtle" />
                <div className="flex min-w-0 flex-col">
                  <Text size="small" className="truncate">
                    {(meta ? t(meta.label) : doc.type) + " · " + doc.number}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {[
                      doc.created_at ? formatDate(doc.created_at) : null,
                      doc.sent_to_buyer_at
                        ? t("documents.widget.sent")
                        : t("orderCard.documentNotSent"),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </div>
              </div>
              {doc.file_url ? (
                <a href={doc.file_url} target="_blank" rel="noreferrer">
                  <Button size="small" variant="transparent">
                    PDF
                  </Button>
                </a>
              ) : (
                <Text size="xsmall" className="text-ui-fg-muted">
                  {t("documents.widget.rendering")}
                </Text>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

export default OrderCardDrawer
