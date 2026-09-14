// DTO и подписи admin-API отзывов и претензий для браузерного бандла админки
// (код модуля reviews импортировать нельзя — значения продублированы намеренно,
// идиома lib/order, lib/bonus).

import { AdminOrderCard, AdminOrderLifecycleRowOrder } from "./order"

export type ReviewTarget = "supplier" | "delivery"
export type ReviewStatus = "published" | "hidden"
export type DisputeCategory =
  | "not_delivered"
  | "damaged"
  | "wrong_item"
  | "quality"
  | "other"
export type DisputeStatus = "open" | "in_review" | "resolved" | "rejected"
// Последствие решения — что получает покупатель (T4.11).
export type DisputeOutcome =
  | "refund"
  | "redelivery"
  | "replacement"
  | "bonus"
  | "none"
// Кто завёл претензию: покупатель через чат или оператор с его слов (звонок).
export type DisputeSource = "buyer" | "operator"

export type AdminReview = {
  id: string
  order_id: string
  customer_id?: string
  target: ReviewTarget
  rating: number
  comment: string | null
  status: ReviewStatus
  created_at: string | null
}

export type AdminDispute = {
  id: string
  order_id: string
  customer_id?: string
  category: DisputeCategory
  description: string
  status: DisputeStatus
  resolution: string | null
  outcome: DisputeOutcome | null
  source: DisputeSource
  created_at: string | null
}

// Строка очереди претензий: претензия + заказ, по которому она открыта, +
// возраст обращения и признак просрочки. Всё считает бэкенд (T4.11).
export type AdminDisputeRow = AdminDispute & {
  order: AdminOrderLifecycleRowOrder | null
  age_hours: number
  overdue: boolean
}

export type AdminReviewsResponse = { reviews: AdminReview[] }
export type AdminReviewResponse = { review: AdminReview }
export type AdminDisputesResponse = { disputes: AdminDispute[] }
export type AdminDisputeResponse = { dispute: AdminDispute }
export type AdminDisputeCounts = {
  total: number
  by_status: Record<DisputeStatus, number>
  overdue: number
}

export type AdminDisputeQueueResponse = {
  disputes: AdminDisputeRow[]
  counts: AdminDisputeCounts
  sla_hours: number
  count: number
  offset: number
  limit: number
}

// Прошлое обращение того же покупателя (история в карточке претензии).
export type DisputeHistoryEntry = {
  id: string
  order_id: string
  order_display_id: number | null
  category: DisputeCategory
  status: DisputeStatus
  outcome: DisputeOutcome | null
  created_at: string | null
}

export type DisputeCustomerHistory = {
  order_count: number
  dispute_count: number
  resolved_count: number
  rejected_count: number
  others: DisputeHistoryEntry[]
}

// Рабочее место претензии (GET /admin/disputes/:id/card): претензия со сроком,
// заказ целиком, отзывы по заказу и история обращений покупателя одним ответом.
export type AdminDisputeCard = {
  dispute: AdminDispute & { age_hours: number; overdue: boolean }
  sla_hours: number
  order: AdminOrderCard | null
  reviews: AdminReview[]
  customer_history: DisputeCustomerHistory
}

export type AdminDisputeCardResponse = { dispute_card: AdminDisputeCard }

// Строка раздела «Отзывы»: отзыв + заказ, по которому он оставлен.
export type AdminReviewRow = AdminReview & {
  order: AdminOrderLifecycleRowOrder | null
}

export type AdminReviewListResponse = {
  reviews: AdminReviewRow[]
  counts: { total: number; published: number; hidden: number }
  summaries: AdminReviewSummary[]
  count: number
  offset: number
  limit: number
}
export type AdminReviewSummary = {
  target: ReviewTarget
  count: number
  average: number
}
export type AdminReviewSummariesResponse = {
  summaries: AdminReviewSummary[]
}

// label — i18n-ключи (потребитель оборачивает в t()).
export const REVIEW_TARGET_META: Record<ReviewTarget, { label: string }> = {
  supplier: { label: "reviews.target.supplier" },
  delivery: { label: "reviews.target.delivery" },
}

// label — i18n-ключи (потребитель оборачивает в t()).
export const DISPUTE_CATEGORY_META: Record<
  DisputeCategory,
  { label: string }
> = {
  not_delivered: { label: "reviews.category.not_delivered" },
  damaged: { label: "reviews.category.damaged" },
  wrong_item: { label: "reviews.category.wrong_item" },
  quality: { label: "reviews.category.quality" },
  other: { label: "reviews.category.other" },
}

// Точка (dotClass — как StatusCell списков ядра) + бейдж (color — StatusBadge).
// label — i18n-ключи (потребитель оборачивает в t()).
export const DISPUTE_STATUS_META: Record<
  DisputeStatus,
  {
    label: string
    dotClass: string
    color: "orange" | "blue" | "green" | "red" | "grey"
  }
> = {
  open: { label: "reviews.status.open", dotClass: "bg-ui-tag-orange-icon", color: "orange" },
  in_review: { label: "reviews.status.in_review", dotClass: "bg-ui-tag-blue-icon", color: "blue" },
  resolved: { label: "reviews.status.resolved", dotClass: "bg-ui-tag-green-icon", color: "green" },
  rejected: { label: "reviews.status.rejected", dotClass: "bg-ui-tag-red-icon", color: "red" },
}

export const DISPUTE_STATUSES: DisputeStatus[] = [
  "open",
  "in_review",
  "resolved",
  "rejected",
]

// Закрытые претензии: решения по ним приняты, срок ответа больше не идёт —
// экраны не показывают по ним ни ожидание, ни просрочку.
export const DISPUTE_CLOSED: DisputeStatus[] = ["resolved", "rejected"]

// Последствия решения в порядке частоты для оператора. label — i18n-ключи.
export const DISPUTE_OUTCOMES: DisputeOutcome[] = [
  "refund",
  "redelivery",
  "replacement",
  "bonus",
  "none",
]

export const DISPUTE_OUTCOME_META: Record<DisputeOutcome, { label: string }> = {
  refund: { label: "reviews.outcome.refund" },
  redelivery: { label: "reviews.outcome.redelivery" },
  replacement: { label: "reviews.outcome.replacement" },
  bonus: { label: "reviews.outcome.bonus" },
  none: { label: "reviews.outcome.none" },
}

export const DISPUTE_SOURCE_META: Record<DisputeSource, { label: string }> = {
  buyer: { label: "reviews.source.buyer" },
  operator: { label: "reviews.source.operator" },
}

// Чипы-фильтры очереди претензий (идиома ORDER_QUEUE_CHIPS). Дефолт — «Требуют
// ответа» (открытые + на рассмотрении): это очередь на разбор, а не журнал.
// statuses — значения фильтра `status`; null у «Все» невозможен (без параметра
// бэкенд отдаёт активные), поэтому чип «Все» перечисляет статусы явно.
export type DisputeQueueChip = {
  key: string
  label: string
  statuses: DisputeStatus[]
}

export const DISPUTE_QUEUE_CHIPS: DisputeQueueChip[] = [
  {
    key: "active",
    label: "reviews.chip.active",
    statuses: ["open", "in_review"],
  },
  { key: "open", label: "reviews.status.open", statuses: ["open"] },
  {
    key: "in_review",
    label: "reviews.status.in_review",
    statuses: ["in_review"],
  },
  { key: "resolved", label: "reviews.status.resolved", statuses: ["resolved"] },
  { key: "rejected", label: "reviews.status.rejected", statuses: ["rejected"] },
  { key: "all", label: "reviews.chip.all", statuses: DISPUTE_STATUSES },
]

export const disputeQueueChipCount = (
  counts: AdminDisputeCounts,
  chip: DisputeQueueChip
): number => {
  if (chip.key === "all") {
    return counts.total
  }
  return chip.statuses.reduce(
    (sum, status) => sum + (counts.by_status[status] ?? 0),
    0
  )
}

// --- Безопасное чтение словарей ---
//
// Статус, категория и последствие приходят из БД строками, а не из TS-типа.
// Прямая индексация уже РОНЯЛА экран «Споры» (T4.11a: обёртка строки таблицы
// давала undefined, и `DISPUTE_STATUS_META[undefined].color` рушил рендер),
// поэтому читаем ТОЛЬКО через эти функции: неизвестное значение — прочерк.
const UNKNOWN_META = {
  label: "common.unknownValue",
  dotClass: "bg-ui-tag-neutral-icon",
  color: "grey" as const,
}

export const disputeStatusMeta = (status: string | null | undefined) =>
  (status ? DISPUTE_STATUS_META[status as DisputeStatus] : null) ?? UNKNOWN_META

export const disputeCategoryMeta = (category: string | null | undefined) =>
  (category ? DISPUTE_CATEGORY_META[category as DisputeCategory] : null) ?? {
    label: "common.unknownValue",
  }

export const disputeOutcomeMeta = (outcome: string | null | undefined) =>
  (outcome ? DISPUTE_OUTCOME_META[outcome as DisputeOutcome] : null) ?? {
    label: "common.unknownValue",
  }

export const disputeSourceMeta = (source: string | null | undefined) =>
  (source ? DISPUTE_SOURCE_META[source as DisputeSource] : null) ??
  DISPUTE_SOURCE_META.buyer

export const reviewTargetMeta = (target: string | null | undefined) =>
  (target ? REVIEW_TARGET_META[target as ReviewTarget] : null) ?? {
    label: "common.unknownValue",
  }

// Доступные переходы из статуса (для кнопок ведения; зеркалит стейт-машину
// сервиса — сервер проверяет ещё раз).
export const DISPUTE_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  open: ["in_review", "resolved", "rejected"],
  in_review: ["resolved", "rejected"],
  resolved: [],
  rejected: [],
}
