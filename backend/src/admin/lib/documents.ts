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
  created_at: string | null
}

export type AdminOrderDocumentsResponse = {
  documents: AdminOrderDocument[]
}

// Подписи типов документов (английский до локализации, как остальная админка).
export const DOCUMENT_TYPE_META: Record<DocumentType, { label: string }> = {
  invoice: { label: "Invoice" },
  waybill: { label: "Waybill" },
  internal_avr: { label: "Internal act" },
}

// Поля реквизитов продавца в порядке отображения: ключ, подпись,
// признак «многострочное» и «обязательное».
export const DOCUMENT_SETTINGS_FIELDS: {
  key: keyof Omit<AdminDocumentSettings, "id">
  label: string
  multiline?: boolean
  required?: boolean
}[] = [
  { key: "seller_name", label: "Seller name", required: true },
  { key: "seller_bin", label: "BIN / IIN" },
  { key: "seller_address", label: "Address", multiline: true },
  { key: "seller_phone", label: "Phone" },
  { key: "seller_email", label: "Email" },
  { key: "seller_bank_name", label: "Bank name" },
  { key: "seller_bank_bik", label: "Bank BIK" },
  { key: "seller_iban", label: "IBAN" },
  { key: "footer_note", label: "Footer note", multiline: true },
]
