import { ArrowUpRightOnBox, DocumentText } from "@medusajs/icons"
import {
  Badge,
  Button,
  Drawer,
  Label,
  Select,
  StatusBadge,
  Text,
  Textarea,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useReviews } from "../hooks/use-reviews"
import { formatDate, formatDateTime } from "../lib/date"
import { DOCUMENT_TYPE_META, DocumentType } from "../lib/documents"
import { formatAmount } from "../lib/money"
import { AdminOrderCard, orderStatusMeta } from "../lib/order"
import {
  AdminDisputeCard,
  AdminDisputeCardResponse,
  DISPUTE_CLOSED,
  DISPUTE_OUTCOMES,
  DISPUTE_TRANSITIONS,
  DisputeCustomerHistory,
  DisputeOutcome,
  DisputeStatus,
  disputeCategoryMeta,
  disputeOutcomeMeta,
  disputeSourceMeta,
  disputeStatusMeta,
  reviewTargetMeta,
} from "../lib/reviews"
import { sdk } from "../lib/sdk"
import { waitingUnit } from "../lib/waiting"

type DisputeCardDrawerProps = {
  // null — рабочее место закрыто
  disputeId: string | null
  onClose: () => void
}

// Сколько претензия ждёт ответа — словами: часы до двух суток, дальше сутки
// (см. lib/waiting). У закрытой претензии ожидания нет вовсе: null.
const waitingLabel = (
  t: (key: string, params?: Record<string, unknown>) => string,
  dispute: { status: DisputeStatus; age_hours: number }
): string | null => {
  if (DISPUTE_CLOSED.includes(dispute.status)) {
    return null
  }
  const waiting = waitingUnit(dispute.age_hours)
  return waiting.unit === "days"
    ? t("reviews.card.ageDays", { count: waiting.value })
    : t("reviews.card.ageHours", { count: waiting.value })
}

// Значения — i18n-ключи (потребитель оборачивает в t()).
const ACTION_LABEL: Record<DisputeStatus, string> = {
  open: "reviews.action.open",
  in_review: "reviews.action.in_review",
  resolved: "reviews.action.resolved",
  rejected: "reviews.action.rejected",
}

// Рабочее место претензии (T4.11) — drawer поверх очереди: суть жалобы, заказ
// целиком (покупатель, состав, деньги, стадии, документы), история обращений
// покупателя, отзывы и ведение по стейт-машине с последствием решения.
//
// До него оператор видел только текст жалобы и кнопки статусов: заказ из
// претензии было не поднять (в списке — внутренний id, поиском не находится),
// последствия решения нигде не фиксировались, а история покупателя была
// недоступна (Ф-прогон 2026-08-18, Асель: «как я по этому должна принять
// решение и потом его защищать»).
//
// Данные — ОДНИМ запросом GET /admin/disputes/:id/card: экран ничего не считает
// и не склеивает четыре ответа (идиома карточки заказа T4.2c).
const DisputeCardDrawer = ({ disputeId, onClose }: DisputeCardDrawerProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { transitionDispute } = useReviews()
  const [resolution, setResolution] = useState("")
  const [outcome, setOutcome] = useState<DisputeOutcome | "">("")

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dispute-card", disputeId],
    queryFn: () =>
      sdk.client.fetch<AdminDisputeCardResponse>(
        `/admin/disputes/${disputeId}/card`
      ),
    enabled: !!disputeId,
  })

  const card = data?.dispute_card ?? null
  const dispute = card?.dispute ?? null

  // Черновик решения подставляем из уже сохранённого: оператор дописывает, а не
  // печатает заново (и видит, что писал в прошлый раз).
  useEffect(() => {
    setResolution(dispute?.resolution ?? "")
    setOutcome(dispute?.outcome ?? "")
  }, [dispute?.id, dispute?.resolution, dispute?.outcome])

  const statusMeta = disputeStatusMeta(dispute?.status)
  const transitions = dispute ? (DISPUTE_TRANSITIONS[dispute.status] ?? []) : []
  const resolutionMissing = resolution.trim() === ""

  // Удовлетворение требует и обоснования, и последствия: без них решение
  // невозможно ни объяснить покупателю, ни проверить через месяц (правило
  // проверяет и бэкенд).
  const disabledFor = (to: DisputeStatus) => {
    if (transitionDispute.isPending) {
      return true
    }
    if (to === "resolved") {
      return resolutionMissing || outcome === ""
    }
    if (to === "rejected") {
      return resolutionMissing
    }
    return false
  }

  // Чего не хватает для закрытия претензии: строку показываем под футером —
  // выключенная кнопка обязана объяснять себя (идиома T4.15).
  const blockedReason = () => {
    if (!transitions.includes("resolved")) {
      return null
    }
    if (resolutionMissing && outcome === "") {
      return t("reviews.card.needBoth")
    }
    if (resolutionMissing) {
      return t("reviews.card.needResolution")
    }
    if (outcome === "") {
      return t("reviews.card.needOutcome")
    }
    return null
  }

  const run = (to: DisputeStatus) => {
    if (!dispute || disabledFor(to)) {
      return
    }
    transitionDispute.mutate(
      {
        id: dispute.id,
        to,
        resolution: resolution.trim() || undefined,
        // Отказ — всегда «без компенсации» (бэкенд ставит его сам).
        outcome: to === "resolved" ? (outcome as DisputeOutcome) : undefined,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Drawer open={!!disputeId} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Content className="sm-order-card">
        <Drawer.Header>
          <div className="flex flex-col gap-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Drawer.Title>
                {card?.order?.display_id != null
                  ? t("reviews.card.titleForOrder", {
                      id: card.order.display_id,
                    })
                  : t("reviews.card.title")}
              </Drawer.Title>
              {dispute && (
                <StatusBadge color={statusMeta.color}>
                  {t(statusMeta.label)}
                </StatusBadge>
              )}
              {dispute?.overdue && (
                <Badge size="2xsmall" color="red">
                  {t("reviews.card.overdue")}
                </Badge>
              )}
            </div>
            {dispute && (
              <div className="flex flex-wrap items-center gap-x-3">
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {[
                    t(disputeCategoryMeta(dispute.category).label),
                    dispute.created_at
                      ? formatDateTime(dispute.created_at)
                      : null,
                    waitingLabel(t, dispute),
                    t(disputeSourceMeta(dispute.source).label),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
                {card?.order && (
                  <button
                    type="button"
                    className="sm-card-link"
                    onClick={() => navigate(`/orders/${card.order!.order_id}`)}
                  >
                    <ArrowUpRightOnBox />
                    {t("orderCard.openOrder")}
                  </button>
                )}
              </div>
            )}
          </div>
        </Drawer.Header>

        <Drawer.Body className="flex flex-col gap-y-6 overflow-y-auto">
          {isError ? (
            <div className="flex flex-col items-start gap-y-3">
              <Text size="small" className="text-ui-fg-subtle">
                {t("reviews.card.error")}
              </Text>
              <Button
                size="small"
                variant="secondary"
                onClick={() => refetch()}
              >
                {t("orderQueue.retry")}
              </Button>
            </div>
          ) : !card || !dispute ? (
            <Text size="small" className="text-ui-fg-subtle">
              {isLoading ? t("common.loading") : t("reviews.card.missing")}
            </Text>
          ) : (
            <>
              <Complaint card={card} />
              <OrderContext card={card} />
              <History history={card.customer_history} />
              <Reviews card={card} />
              <BuyerChannel />
              <Decision
                card={card}
                resolution={resolution}
                onResolutionChange={setResolution}
                outcome={outcome}
                onOutcomeChange={setOutcome}
              />
            </>
          )}
        </Drawer.Body>

        <Drawer.Footer className="flex-col items-stretch gap-y-2">
          <div className="flex items-center justify-end gap-x-2">
            <Drawer.Close asChild>
              <Button size="small" variant="secondary">
                {t("common.close")}
              </Button>
            </Drawer.Close>
            {transitions.map((to) => (
              <Button
                key={to}
                size="small"
                variant={to === "rejected" ? "danger" : "primary"}
                disabled={disabledFor(to)}
                onClick={() => run(to)}
              >
                {t(ACTION_LABEL[to])}
              </Button>
            ))}
          </div>
          {blockedReason() && (
            <Text size="xsmall" className="text-ui-fg-subtle text-right">
              {blockedReason()}
            </Text>
          )}
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

// Заголовок блока карточки (идиома карточки заказа).
const Section = ({
  title,
  anchor,
  children,
}: {
  title: string
  // Метка блока для скриншотера гейта U.
  anchor?: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-y-3" data-sm-section={anchor}>
    <Text size="small" weight="plus">
      {title}
    </Text>
    {children}
  </div>
)

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

// Суть жалобы словами покупателя — первым блоком: до T4.11 её можно было
// прочитать только пролистав чужой заказ до самого низа.
const Complaint = ({ card }: { card: AdminDisputeCard }) => {
  const { t } = useTranslation()
  const { dispute } = card

  return (
    <Section title={t("reviews.card.complaint")} anchor="complaint">
      <Text size="small">{dispute.description}</Text>
      <Text size="xsmall" className="text-ui-fg-subtle">
        {[
          t("reviews.card.slaWindow", { hours: card.sla_hours }),
          waitingLabel(t, dispute),
        ]
          .filter(Boolean)
          .join(" · ")}
      </Text>
    </Section>
  )
}

// Заказ претензии: покупатель с телефоном (звонить приходится из панели),
// деньги, стадия, состав и документы. Состав нужен буквально: жалоба «порваны
// мешки цемента» на заказе из минваты — либо ошибка покупателя, либо привязка
// не к тому заказу, и увидеть это можно только рядом.
const OrderContext = ({ card }: { card: AdminDisputeCard }) => {
  const { t } = useTranslation()
  const order = card.order

  if (!order) {
    return (
      <Section title={t("reviews.card.order")}>
        <Text size="small" className="text-ui-fg-subtle">
          {t("reviews.card.orderMissing")}
        </Text>
      </Section>
    )
  }

  const currency = order.totals.currency_code
  const money = (amount: number | null) =>
    amount == null ? "—" : formatAmount(amount, currency)
  const statusMeta = orderStatusMeta(order.status)
  const address = [order.delivery.city, order.delivery.address]
    .filter((part) => !!part)
    .join(", ")

  return (
    <>
      <Section title={t("reviews.card.order")} anchor="order">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Field label={t("orderCard.buyer")}>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{order.customer.name ?? "—"}</span>
              {order.customer.is_company && (
                <Badge size="2xsmall" color="blue">
                  {t("orderQueue.companyBadge")}
                </Badge>
              )}
            </span>
          </Field>
          <Field label={t("orderCard.phone")}>
            {order.customer.phone ?? "—"}
          </Field>
          <Field label={t("common.status")}>{t(statusMeta.label)}</Field>
          <Field label={t("orderCard.total")}>
            {money(order.totals.total)}
          </Field>
          <Field label={t("orderCard.address")}>{address || "—"}</Field>
          <Field label={t("reviews.card.orderDate")}>
            {order.created_at ? formatDate(order.created_at) : "—"}
          </Field>
        </div>
      </Section>

      <Section title={t("orderCard.items")}>
        <ul className="flex flex-col gap-y-2">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-x-4"
            >
              <div className="flex min-w-0 flex-col">
                <Text size="small" className="truncate">
                  {item.title}
                </Text>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {[item.variant_title, `× ${item.quantity}`]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </div>
              <Text size="small" className="sm-cell-num sm-cell-strong">
                {money(item.total)}
              </Text>
            </li>
          ))}
          {!order.items.length && (
            <Text size="small" className="text-ui-fg-subtle">
              {t("orderCard.noItems")}
            </Text>
          )}
        </ul>
      </Section>

      <Shipment order={order} />
      <Documents order={order} />
    </>
  )
}

// Отгрузка и вручение — из лога переходов заказа: что и когда уехало и кто
// перевёл. Водителя, фото выгрузки и подписи получателя система пока не хранит
// (появятся с рейсами водителя) — говорим об этом прямо, чтобы оператор не
// искал их по экранам.
const Shipment = ({ order }: { order: AdminOrderCard }) => {
  const { t } = useTranslation()
  const events = order.history.filter((event) =>
    ["assembled", "in_delivery", "delivered"].includes(event.to_status)
  )

  return (
    <Section title={t("reviews.card.shipment")} anchor="shipment">
      {events.length ? (
        <ul className="flex flex-col gap-y-2">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-start justify-between gap-x-4"
            >
              <Text size="small">
                {t(orderStatusMeta(event.to_status).label)}
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                {[
                  event.created_at ? formatDateTime(event.created_at) : null,
                  // Имя человека, если оно известно: «кто отгрузил» — первый
                  // вопрос оператора претензии (T4.12).
                  event.actor_name
                    ? t("order.widget.byPerson", {
                        name: event.actor_name,
                        actor: t(`order.actor.${event.actor_type}`),
                      })
                    : t("order.widget.by", {
                        actor: t(`order.actor.${event.actor_type}`),
                      }),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </li>
          ))}
        </ul>
      ) : (
        <Text size="small" className="text-ui-fg-subtle">
          {t("reviews.card.notShipped")}
        </Text>
      )}
      <Text size="xsmall" className="text-ui-fg-muted">
        {t("reviews.card.proofHint")}
      </Text>
    </Section>
  )
}

// Документы заказа: ими обосновывают решение по претензии.
const Documents = ({ order }: { order: AdminOrderCard }) => {
  const { t } = useTranslation()

  if (!order.documents.length) {
    return (
      <Section title={t("orderCard.documents")}>
        <Text size="small" className="text-ui-fg-subtle">
          {t("documents.widget.empty")}
        </Text>
      </Section>
    )
  }

  return (
    <Section title={t("orderCard.documents")} anchor="documents">
      <ul className="flex flex-col gap-y-2">
        {order.documents.map((doc) => {
          const meta = DOCUMENT_TYPE_META[doc.type as DocumentType]
          return (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-x-3"
            >
              <div className="flex min-w-0 items-center gap-x-2">
                <DocumentText className="text-ui-fg-subtle" />
                <Text size="small" className="truncate">
                  {(meta ? t(meta.label) : doc.type) + " · " + doc.number}
                </Text>
              </div>
              {doc.file_url && (
                <a href={doc.file_url} target="_blank" rel="noreferrer">
                  <Button size="small" variant="transparent">
                    PDF
                  </Button>
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

// История обращений покупателя: жалуется впервые или на каждую поставку — ровно
// то, на чём строится решение (МЕШАЕТ 7 Ф-прогона).
const History = ({ history }: { history: DisputeCustomerHistory }) => {
  const { t } = useTranslation()

  return (
    <Section title={t("reviews.card.history")} anchor="history">
      <Text size="small">
        {t("reviews.card.historySummary", {
          disputes: history.dispute_count,
          orders: history.order_count,
          resolved: history.resolved_count,
          rejected: history.rejected_count,
        })}
      </Text>
      {history.others.length ? (
        <ul className="flex flex-col gap-y-2">
          {history.others.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start justify-between gap-x-4"
            >
              <Text size="small">
                {[
                  entry.order_display_id != null
                    ? t("orderQueue.orderNo", { id: entry.order_display_id })
                    : null,
                  t(disputeCategoryMeta(entry.category).label),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                {[
                  t(disputeStatusMeta(entry.status).label),
                  entry.outcome
                    ? t(disputeOutcomeMeta(entry.outcome).label)
                    : null,
                  entry.created_at ? formatDate(entry.created_at) : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </li>
          ))}
        </ul>
      ) : (
        <Text size="small" className="text-ui-fg-subtle">
          {t("reviews.card.historyEmpty")}
        </Text>
      )}
    </Section>
  )
}

// Отзывы по этому же заказу: оценка поставщика и доставки рядом с претензией
// (часто это один и тот же случай, описанный дважды).
const Reviews = ({ card }: { card: AdminDisputeCard }) => {
  const { t } = useTranslation()

  if (!card.reviews.length) {
    return null
  }

  return (
    <Section title={t("reviews.widget.reviews")} anchor="reviews">
      <ul className="flex flex-col gap-y-2">
        {card.reviews.map((review) => (
          <li key={review.id} className="flex flex-col gap-y-1">
            <Text size="small">
              {t("reviews.card.reviewLine", {
                target: t(reviewTargetMeta(review.target).label),
                rating: review.rating,
              })}
              {review.status === "hidden"
                ? ` · ${t("reviews.widget.hidden")}`
                : ""}
            </Text>
            {review.comment && (
              <Text size="xsmall" className="text-ui-fg-subtle">
                {review.comment}
              </Text>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}

// Как покупатель узнает о решении. Канала уведомлений в системе НЕТ — решение
// владельца 2026-08-18: единственный канал покупателя — диалог с ассистентом
// (плюс «Заказы» в приложении и на витрине). Оператор должен знать это точно, а
// не догадываться: «доказать через месяц, что я ответила, будет нечем» —
// блокер 4 Ф-прогона.
const BuyerChannel = () => {
  const { t } = useTranslation()

  return (
    <Section title={t("reviews.card.buyerChannel")}>
      <Text size="small" className="text-ui-fg-subtle">
        {t("reviews.card.buyerChannelHint")}
      </Text>
    </Section>
  )
}

// Решение: обоснование + последствие. Оба обязательны при удовлетворении —
// «возврат / повторная доставка / бонусы» перестают быть догадкой покупателя.
const Decision = ({
  card,
  resolution,
  onResolutionChange,
  outcome,
  onOutcomeChange,
}: {
  card: AdminDisputeCard
  resolution: string
  onResolutionChange: (value: string) => void
  outcome: DisputeOutcome | ""
  onOutcomeChange: (value: DisputeOutcome) => void
}) => {
  const { t } = useTranslation()
  const closed = !DISPUTE_TRANSITIONS[card.dispute.status]?.length

  if (closed) {
    return (
      <Section title={t("reviews.card.decision")} anchor="decision">
        <Text size="small" className="text-ui-fg-subtle">
          {t("reviews.drawer.closed")}
        </Text>
        {card.dispute.resolution && (
          <Text size="small">{card.dispute.resolution}</Text>
        )}
        <Field label={t("reviews.card.outcome")}>
          {t(disputeOutcomeMeta(card.dispute.outcome).label)}
        </Field>
      </Section>
    )
  }

  return (
    <Section title={t("reviews.card.decision")} anchor="decision">
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="dispute-resolution" size="small">
          {t("reviews.drawer.resolution")}
        </Label>
        <Textarea
          id="dispute-resolution"
          value={resolution}
          onChange={(event) => onResolutionChange(event.target.value)}
          placeholder={t("reviews.drawer.resolutionPlaceholder")}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="dispute-outcome" size="small">
          {t("reviews.card.outcome")}
        </Label>
        <Select
          value={outcome}
          onValueChange={(value) => onOutcomeChange(value as DisputeOutcome)}
        >
          <Select.Trigger id="dispute-outcome">
            <Select.Value placeholder={t("reviews.card.outcomePlaceholder")} />
          </Select.Trigger>
          <Select.Content>
            {DISPUTE_OUTCOMES.map((value) => (
              <Select.Item key={value} value={value}>
                {t(disputeOutcomeMeta(value).label)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Text size="xsmall" className="text-ui-fg-muted">
          {t("reviews.card.outcomeHint")}
        </Text>
      </div>
    </Section>
  )
}

export default DisputeCardDrawer
