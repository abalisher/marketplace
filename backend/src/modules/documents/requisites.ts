import { DocumentType } from "./models/constants"

// Полнота реквизитов продавца — чистая проверка над строкой document_setting.
// Счёт без БИН, адреса и банковских реквизитов бухгалтерия ТОО не примет
// (находка фокус-группы T4.6, блокер 20), поэтому документ с пустыми
// реквизитами не выпускается вовсе: workflow выпуска падает с понятной
// ошибкой, а подписчики автовыпуска пропускают заказ и пишут предупреждение в
// лог. Список полей продублирован в admin/lib/documents.ts (браузерный бандл
// админки не может импортировать код модуля — идиома lib/bonus).

export type DocumentRequisites = {
  seller_name?: string | null
  seller_bin?: string | null
  seller_address?: string | null
  seller_bank_name?: string | null
  seller_bank_bik?: string | null
  seller_iban?: string | null
}

// Поля, без которых документ не выпускается. Телефон, email и приписка в
// подвале необязательны — они не влияют на пригодность документа для
// бухгалтерии.
export const REQUIRED_REQUISITE_FIELDS = [
  "seller_name",
  "seller_bin",
  "seller_address",
  "seller_bank_name",
  "seller_bank_bik",
  "seller_iban",
] as const

export type RequiredRequisiteField = (typeof REQUIRED_REQUISITE_FIELDS)[number]

// Человекочитаемые подписи для сообщения об ошибке (документация и UI — на
// русском, правило CLAUDE.md).
const FIELD_LABELS: Record<RequiredRequisiteField, string> = {
  seller_name: "наименование продавца",
  seller_bin: "БИН/ИИН",
  seller_address: "адрес",
  seller_bank_name: "банк",
  seller_bank_bik: "БИК",
  seller_iban: "IBAN",
}

// Дефолт модели: пока имя продавца не изменили, реквизиты считаются
// незаполненными (в базе стоит ядровая заглушка, а не название магазина).
const PLACEHOLDER_SELLER_NAME = "Marketplace"

// Возвращает список незаполненных обязательных полей (пустой — реквизиты
// пригодны для выпуска).
export const missingRequisites = (
  settings: DocumentRequisites | null | undefined
): RequiredRequisiteField[] => {
  if (!settings) {
    return [...REQUIRED_REQUISITE_FIELDS]
  }
  return REQUIRED_REQUISITE_FIELDS.filter((field) => {
    const value = settings[field]
    if (typeof value !== "string" || value.trim() === "") {
      return true
    }
    return field === "seller_name" && value.trim() === PLACEHOLDER_SELLER_NAME
  })
}

export const requisitesAreComplete = (
  settings: DocumentRequisites | null | undefined
): boolean => missingRequisites(settings).length === 0

// Текст ошибки для API и лога: перечисляет, чего именно не хватает.
export const missingRequisitesMessage = (
  missing: RequiredRequisiteField[]
): string =>
  `Реквизиты продавца заполнены не полностью: ${missing
    .map((field) => FIELD_LABELS[field])
    .join(", ")}. Заполните их в «Настройки → Реквизиты документов» — без них ` +
  `документ не примет бухгалтерия покупателя.`

// Типы, которые продавец может выпустить руками с экрана заказа.
export const MANUALLY_ISSUABLE_TYPES: readonly DocumentType[] = [
  "invoice",
  "waybill",
  "internal_avr",
]
