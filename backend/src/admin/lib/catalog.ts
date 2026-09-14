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

// Категория каталога ядра (их ровно четыре — T10.10): у товара одна, панель
// показывает её колонкой и фильтрует по ней список.
export type AdminProductCategory = {
  id: string
  name: string
}

export type AdminProductCategoriesResponse = {
  product_categories: AdminProductCategory[]
  count: number
  offset: number
  limit: number
}

// Товар ядра в списке очереди модерации (усечён до запрошенных fields).
export type AdminModerationProduct = {
  id: string
  title: string
  thumbnail: string | null
  status: ProductModerationStatus
  updated_at: string
  categories: AdminProductCategory[] | null
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

// label — i18n-ключ (react-i18next), потребитель оборачивает в t().
export const SEGMENT_LABELS: Record<ProductSegment, string> = {
  economy: "productModeration.segment.economy",
  comfort: "productModeration.segment.comfort",
  business: "productModeration.segment.business",
}

// Цвета статусов модерации — те же, что у product.status в ядре.
// label — i18n-ключ (потребитель оборачивает в t()).
// dotClass — точка в списках (идиома StatusCell стандартных таблиц ядра),
// color — палитра StatusBadge.
export const PRODUCT_STATUS_META: Record<
  ProductModerationStatus,
  { label: string; color: "grey" | "orange" | "green" | "red"; dotClass: string }
> = {
  draft: {
    label: "productModeration.status.draft",
    color: "grey",
    dotClass: "bg-ui-tag-neutral-icon",
  },
  proposed: {
    label: "productModeration.status.proposed",
    color: "orange",
    dotClass: "bg-ui-tag-orange-icon",
  },
  published: {
    label: "productModeration.status.published",
    color: "green",
    dotClass: "bg-ui-tag-green-icon",
  },
  rejected: {
    label: "productModeration.status.rejected",
    color: "red",
    dotClass: "bg-ui-tag-red-icon",
  },
}
