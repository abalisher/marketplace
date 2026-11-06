// DTO admin-API документов (реквизиты продавца + документы заказа) и подписи
// типов. Значения продублированы из модуля намеренно: код модуля нельзя
// импортировать в браузерный бандл админки (идиома lib/bonus).

export type DocumentType = "invoice" | "waybill" | "internal_avr"

export type AdminDocumentSettings = {
  id: string
  seller_name: string
  seller_bin: string | null
  seller_address: string | null
  seller_phone: string | null
  seller_email: string | null
  seller_bank_name: string | null
  seller_bank_bik: string | null
  seller_iban: string | null
  seller_kbe: string
  seller_knp: string
  director_name: string | null
  footer_note: string | null
}

export type AdminDocumentSettingsResponse = {
  document_settings: AdminDocumentSettings
}

export type AdminOrderDocument = {
  id: string
  type: DocumentType
  number: string
  version: number
  is_latest: boolean
  file_id: string | null
  file_url: string | null
  total_money: number
  total_bonus: number
  currency_code: string
  note: string | null
  // Отметка «отправлен покупателю» (T4.9): канал отправки не выбран
  // (развилка №0), отметку ставит человек. null — не отправлен.
  sent_to_buyer_at: string | null
  created_at: string | null
}

export type AdminOrderDocumentsResponse = {
  documents: AdminOrderDocument[]
  // Реквизиты продавца ЭТОГО заказа: у заказа компании — её, иначе площадки.
  requisites?: { ready: boolean; missing: string[]; tenant: boolean }
}

// Заказ, к которому относится документ, в реестре: номер и плательщик
// человекочитаемо (технических id на экране быть не должно — принцип #8).
export type AdminDocumentOrder = {
  id: string
  display_id: number | null
  // Номер для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  order_number?: string | null
  buyer: string | null
  is_company: boolean
}

export type AdminRegistryDocument = AdminOrderDocument & {
  order: AdminDocumentOrder | null
}

export type AdminDocumentsResponse = {
  documents: AdminRegistryDocument[]
  counts: Record<string, number> & { all: number }
  // Незаполненные обязательные реквизиты продавца: пока список непуст, выпуск
  // документов запрещён (см. modules/documents/requisites.ts).
  requisites_missing: string[]
  count: number
  offset: number
  limit: number
}

// Чипы-фильтры реестра по типу документа (идиома ORDER_QUEUE_CHIPS).
export type DocumentChip = {
  key: string
  label: string
  types?: DocumentType[]
}

export const DOCUMENT_CHIPS: DocumentChip[] = [
  { key: "all", label: "documents.chip.all" },
  { key: "invoice", label: "documents.type.invoice", types: ["invoice"] },
  { key: "waybill", label: "documents.type.waybill", types: ["waybill"] },
  {
    key: "internal_avr",
    label: "documents.type.internal_avr",
    types: ["internal_avr"],
  },
]

export const documentChipCount = (
  counts: Record<string, number> & { all: number },
  chip: DocumentChip
): number =>
  chip.types
    ? chip.types.reduce((sum, type) => sum + (counts[type] ?? 0), 0)
    : counts.all

// Подписи типов документов: label — i18n-ключ (перевод через t() при потреблении).
export const DOCUMENT_TYPE_META: Record<DocumentType, { label: string }> = {
  invoice: { label: "documents.type.invoice" },
  waybill: { label: "documents.type.waybill" },
  internal_avr: { label: "documents.type.internal_avr" },
}

// Обязательные реквизиты продавца: без них документ не выпускается (счёт без
// БИН и банка бухгалтерия покупателя не примет — блокер 20 фокус-группы T4.6).
// Список продублирован из modules/documents/requisites.ts намеренно: код модуля
// нельзя импортировать в браузерный бандл админки.
export const REQUIRED_REQUISITE_FIELDS = [
  "seller_name",
  "seller_bin",
  "seller_address",
  "seller_bank_name",
  "seller_bank_bik",
  "seller_iban",
]

// Поля реквизитов продавца в порядке отображения: ключ, i18n-ключ подписи,
// признак «многострочное» и «обязательное». label переводится через t() при потреблении.
export const DOCUMENT_SETTINGS_FIELDS: {
  key: keyof Omit<AdminDocumentSettings, "id">
  label: string
  multiline?: boolean
  required?: boolean
}[] = [
  { key: "seller_name", label: "documents.field.seller_name", required: true },
  { key: "seller_bin", label: "documents.field.seller_bin", required: true },
  {
    key: "seller_address",
    label: "documents.field.seller_address",
    multiline: true,
    required: true,
  },
  { key: "seller_phone", label: "documents.field.seller_phone" },
  { key: "seller_email", label: "documents.field.seller_email" },
  {
    key: "seller_bank_name",
    label: "documents.field.seller_bank_name",
    required: true,
  },
  {
    key: "seller_bank_bik",
    label: "documents.field.seller_bank_bik",
    required: true,
  },
  { key: "seller_iban", label: "documents.field.seller_iban", required: true },
  // Кбе и КНП печатаются в рамке платёжного поручения счёта юрлицу: без них
  // банк покупателя платёж не проведёт, поэтому очистить их нельзя (в модели
  // это not null с типовыми дефолтами 17 и 710).
  { key: "seller_kbe", label: "documents.field.seller_kbe", required: true },
  { key: "seller_knp", label: "documents.field.seller_knp", required: true },
  { key: "director_name", label: "documents.field.director_name" },
  { key: "footer_note", label: "documents.field.footer_note", multiline: true },
]
