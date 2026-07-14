// DTO admin-API карточек каталога (upsert-роут + ядровый /admin/products с
// полями link'а *product_card) и метаданные статусов/сегментов для экранов
// модерации. Значения продублированы из модели намеренно: код модуля нельзя
// импортировать в браузерный бандл админки.

export type ProductSegment = "economy" | "comfort" | "business"

export type ProductModerationStatus =
  | "draft"
  | "proposed"
  | "published"
  | "rejected"

export type ProductCertificate = {
  name: string
  url: string
}

export type AdminProductCard = {
  id: string
  segment: ProductSegment
  unit: string
  certificates: ProductCertificate[] | null
  rejection_reason: string | null
}

// Товар ядра в списке очереди модерации (усечён до запрошенных fields).
export type AdminModerationProduct = {
  id: string
  title: string
  thumbnail: string | null
  status: ProductModerationStatus
  updated_at: string
  product_card: AdminProductCard | null
}

export type AdminModerationProductsResponse = {
  products: AdminModerationProduct[]
  count: number
  offset: number
  limit: number
}

export type AdminProductWithCardResponse = {
  product: {
    id: string
    status: ProductModerationStatus
    product_card: AdminProductCard | null
  }
}

export type AdminProductCardResponse = {
  product_card: AdminProductCard
}

export const SEGMENT_LABELS: Record<ProductSegment, string> = {
  economy: "Economy",
  comfort: "Comfort",
  business: "Business",
}

// Подписи и цвета статусов модерации — те же, что у product.status в ядре.
// dotClass — точка в списках (идиома StatusCell стандартных таблиц ядра),
// color — палитра StatusBadge.
export const PRODUCT_STATUS_META: Record<
  ProductModerationStatus,
  { label: string; color: "grey" | "orange" | "green" | "red"; dotClass: string }
> = {
  draft: { label: "Draft", color: "grey", dotClass: "bg-ui-tag-neutral-icon" },
  proposed: {
    label: "Proposed",
    color: "orange",
    dotClass: "bg-ui-tag-orange-icon",
  },
  published: {
    label: "Published",
    color: "green",
    dotClass: "bg-ui-tag-green-icon",
  },
  rejected: { label: "Rejected", color: "red", dotClass: "bg-ui-tag-red-icon" },
}
