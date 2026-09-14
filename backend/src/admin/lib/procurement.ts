// DTO admin-API закупа (procurement) для браузерного бандла админки. Код модуля
// не импортируем — типы/значения продублированы намеренно (идиома lib/order,
// lib/scoring). Себестоимость — в тенге (Medusa v2 хранит суммы в основной
// единице валюты, как sale-price ядра; см. DECISIONS 2026-07-23) — вводится и
// показывается целыми тенге, ×100 не делаем.

export type AdminSupplier = {
  id: string
  name: string
  bin: string | null
  contact_phone: string | null
  contact_email: string | null
  note: string | null
  active: boolean
}

export type AdminSuppliersResponse = { suppliers: AdminSupplier[] }
export type AdminSupplierResponse = { supplier: AdminSupplier }

export type AdminReceiptLine = {
  id: string
  variant_id: string | null
  recognized_title: string | null
  material_kind: string | null
  quantity: number
  unit: string
  unit_cost: number
  line_cost: number
  expires_at: string | null
}

export type AdminBatch = {
  id: string
  variant_id: string
  receipt_line_id: string
  quantity_received: number
  quantity_remaining: number
  unit_cost: number
  received_at: string | null
  expires_at: string | null
}

export type ReceiptStatus = "draft" | "posted"
export type ReceiptSource = "manual" | "invoice_ai" | "photo_ai"

export type AdminReceipt = {
  id: string
  supplier_id: string | null
  location_id: string
  reference: string | null
  status: ReceiptStatus
  source: ReceiptSource
  document_file_id: string | null
  received_at: string | null
  total_cost: number
  note: string | null
  lines: AdminReceiptLine[]
  batches: AdminBatch[]
}

export type AdminReceiptsResponse = { receipts: AdminReceipt[] }
export type AdminReceiptResponse = { receipt: AdminReceipt }

// Распознанная ИИ накладная (POST /admin/procurement/parse-invoice, подзадача 2):
// рекомендательные строки без сопоставления с SKU (variant_id продавец назначает
// в форме). Цена — целые тенге. Ничего не персистит до сохранения черновика.
export type AdminRecognizedInvoiceLine = {
  recognized_title: string
  quantity: number
  unit: string
  unit_cost: number
}

export type AdminParseInvoiceResponse = {
  recognized: {
    reference: string | null
    received_at: string | null
    lines: AdminRecognizedInvoiceLine[]
  }
  // Поставщик из шапки накладной: бэкенд нашёл его в реестре или завёл сам
  // (`created: true`) — форма только подставляет и сообщает об этом.
  supplier: { id: string; name: string; created: boolean } | null
}

// Статус прихода: точка в списках (идиома StatusCell ядра) + цвет StatusBadge в
// шапке карточки. label/color — как у draft/posted-статусов ядра. Значения label
// — i18n-ключи (потребитель оборачивает в t()).
export const RECEIPT_STATUS_META: Record<
  ReceiptStatus,
  { label: string; color: "grey" | "green"; dotClass: string }
> = {
  draft: {
    label: "procurement.status.draft",
    color: "grey",
    dotClass: "bg-ui-tag-neutral-icon",
  },
  posted: {
    label: "procurement.status.posted",
    color: "green",
    dotClass: "bg-ui-tag-green-icon",
  },
}

// Источник строк прихода (label — i18n-ключ). manual — ручной ввод; invoice_ai/
// photo_ai появятся с ИИ-приёмкой (подзадача 2).
export const RECEIPT_SOURCE_LABELS: Record<ReceiptSource, string> = {
  manual: "procurement.source.manual",
  invoice_ai: "procurement.source.invoice_ai",
  photo_ai: "procurement.source.photo_ai",
}

// Деньги форматирует ОДИН модуль панели — `lib/money.ts` (`formatTenge`).
// Исторические копии этой функции здесь и в `lib/scoring.ts` расходились в
// локали и в знаке валюты: закуп показывал «94 000 ₸», скоринг — «5000» без
// валюты вовсе (Ф-прогон T4.6). Копии удалены в T4.8.

// --- Себестоимость и наценка позиции (T4.9a) ---
// Свод GET /admin/procurement/product-costs: карточка товара показывает
// «купили по столько, продаём по столько» без похода на экран приходов.
// Деньги — целые тенге (как и остальной закуп), проценты — с одним знаком.

// База средней себестоимости: по остатку на складе или, когда остатка нет, по
// всем приходам (историческая цифра — экран говорит это словами).
export type AverageCostBasis = "stock" | "receipts"

// Строка истории приходов по позиции. Черновик тоже показываем: «завели, но не
// провели» — частая причина, почему цифра не сходится.
export type AdminVariantCostReceipt = {
  id: string
  receipt_id: string | null
  reference: string | null
  status: ReceiptStatus | null
  source: ReceiptSource | null
  supplier_name: string | null
  received_at: string | null
  quantity: number
  unit: string
  unit_cost: number
  line_cost: number
}

export type AdminVariantCost = {
  variant_id: string
  title: string | null
  sku: string | null
  last_cost: number | null
  last_cost_at: string | null
  average_cost: number | null
  average_basis: AverageCostBasis | null
  batch_quantity: number
  batch_cost_value: number
  price: number | null
  margin: number | null
  markup_percent: number | null
  receipts_count: number
  receipts: AdminVariantCostReceipt[]
}

export type AdminProductCostsResponse = {
  currency_code: string
  product: { id: string; title: string | null; unit: string | null }
  variants: AdminVariantCost[]
}
