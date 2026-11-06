import type { ReceiptStatus, ReceiptVerdict } from "../../modules/order-payment/models/values"
import { numericAmount } from "./amount"
import { ReceiptCheck, RECEIPT_CHECK_TEXT } from "./receipt-checks"

// Чек покупателя для экранов: продавцу — всё (файл, прочитанное, все
// замечания), покупателю — статус и только нарушения, из-за которых чек не
// примут. Признаки правки покупателю не называем: это подсказка продавцу, а
// не повод учить подделывать аккуратнее.

export type ReceiptRow = {
  id: string
  status: ReceiptStatus
  verdict: ReceiptVerdict
  file_url: string | null
  file_name: string | null
  mime_type: string
  amount: unknown
  paid_at: Date | string | null
  receipt_number: string | null
  recipient_name: string | null
  recipient_phone: string | null
  sender_name: string | null
  comment: string | null
  // Весь разбор чека: отсюда ИИН/БИН получателя (своей колонки у него нет).
  parsed?: unknown
  checks: unknown
  review_note: string | null
  reviewed_at: Date | string | null
  created_at: Date | string
}

const iso = (value: Date | string | null | undefined) =>
  value ? new Date(value).toISOString() : null

const checksOf = (row: ReceiptRow): ReceiptCheck[] =>
  Array.isArray(row.checks) ? (row.checks as ReceiptCheck[]) : []

const describe = (check: ReceiptCheck) =>
  check.detail && check.code !== "tamper_signs"
    ? `${RECEIPT_CHECK_TEXT[check.code]} (${check.detail})`
    : check.code === "tamper_signs" && check.detail
    ? `${RECEIPT_CHECK_TEXT[check.code]}: ${check.detail}`
    : RECEIPT_CHECK_TEXT[check.code]

export const adminReceiptView = (row: ReceiptRow) => ({
  id: row.id,
  status: row.status,
  verdict: row.verdict,
  file_url: row.file_url,
  file_name: row.file_name,
  mime_type: row.mime_type,
  amount: numericAmount(row.amount),
  paid_at: iso(row.paid_at),
  receipt_number: row.receipt_number,
  recipient_name: row.recipient_name,
  recipient_phone: row.recipient_phone,
  recipient_bin:
    (row.parsed as { recipient_bin?: string | null } | null | undefined)?.recipient_bin ?? null,
  sender_name: row.sender_name,
  comment: row.comment,
  checks: checksOf(row).map((check) => ({
    code: check.code,
    level: check.level,
    text: describe(check),
  })),
  review_note: row.review_note,
  reviewed_at: iso(row.reviewed_at),
  created_at: iso(row.created_at),
})

export const buyerReceiptView = (row: ReceiptRow) => ({
  id: row.id,
  status: row.status,
  amount: numericAmount(row.amount),
  created_at: iso(row.created_at),
  // Почему чек не примут — только нарушения, без признаков правки, и только
  // пока продавец не решил: засчитанный чек с «нарушениями» сбивал бы с толку,
  // у отклонённого покупатель видит причину продавца.
  problems:
    row.status === "pending" || row.status === "flagged"
      ? checksOf(row)
          .filter((check) => check.level === "fail")
          .map((check) => RECEIPT_CHECK_TEXT[check.code])
      : [],
  review_note: row.status === "rejected" ? row.review_note : null,
})
