// DTO и подписи admin-API отзывов/диспутов для браузерного бандла админки
// (код модуля reviews импортировать нельзя — значения продублированы намеренно,
// идиома lib/order, lib/bonus).

export type ReviewTarget = "supplier" | "delivery"
export type ReviewStatus = "published" | "hidden"
export type DisputeCategory =
  | "not_delivered"
  | "damaged"
  | "wrong_item"
  | "quality"
  | "other"
export type DisputeStatus = "open" | "in_review" | "resolved" | "rejected"

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
  created_at: string | null
}

export type AdminReviewsResponse = { reviews: AdminReview[] }
export type AdminReviewResponse = { review: AdminReview }
export type AdminDisputesResponse = { disputes: AdminDispute[] }
export type AdminDisputeResponse = { dispute: AdminDispute }
export type AdminDisputeQueueResponse = {
  disputes: AdminDispute[]
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

export const REVIEW_TARGET_META: Record<ReviewTarget, { label: string }> = {
  supplier: { label: "Supplier" },
  delivery: { label: "Delivery" },
}

export const DISPUTE_CATEGORY_META: Record<
  DisputeCategory,
  { label: string }
> = {
  not_delivered: { label: "Not delivered" },
  damaged: { label: "Damaged" },
  wrong_item: { label: "Wrong item" },
  quality: { label: "Quality" },
  other: { label: "Other" },
}

// Точка (dotClass — как StatusCell списков ядра) + бейдж (color — StatusBadge).
export const DISPUTE_STATUS_META: Record<
  DisputeStatus,
  { label: string; dotClass: string; color: "orange" | "blue" | "green" | "red" }
> = {
  open: { label: "Open", dotClass: "bg-ui-tag-orange-icon", color: "orange" },
  in_review: { label: "In review", dotClass: "bg-ui-tag-blue-icon", color: "blue" },
  resolved: { label: "Resolved", dotClass: "bg-ui-tag-green-icon", color: "green" },
  rejected: { label: "Rejected", dotClass: "bg-ui-tag-red-icon", color: "red" },
}

export const DISPUTE_STATUSES: DisputeStatus[] = [
  "open",
  "in_review",
  "resolved",
  "rejected",
]

// Доступные переходы из статуса (для кнопок ведения; зеркалит стейт-машину
// сервиса — сервер проверяет ещё раз).
export const DISPUTE_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  open: ["in_review", "resolved", "rejected"],
  in_review: ["resolved", "rejected"],
  resolved: [],
  rejected: [],
}
