// Типы документов платформы (ТЗ 4.10). Все — основание = заказ.
export const DOCUMENT_TYPES = [
  "invoice", // счёт на оплату — автоматически при оформлении заказа
  "waybill", // накладная — при отгрузке/частичной отгрузке
  "internal_avr", // внутренний АВР для юрлиц — информационный, НЕ официальный
] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

// Префиксы человекочитаемых номеров (латиница — правило «код на английском»).
// Итоговый номер формируется как <PREFIX>-<YEAR>-<seq6>, см. nextDocumentNumber.
export const DOCUMENT_NUMBER_PREFIXES: Record<DocumentType, string> = {
  invoice: "INV",
  waybill: "WB",
  internal_avr: "AVR",
}
