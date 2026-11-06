import { orderLabel } from "../../../../lib/orders/order-number"
import { shopTimeZone } from "../../dashboard/constants"
import { loadDebts, loadPaymentEntries } from "../load"

type EntryRow = Awaited<ReturnType<typeof loadPaymentEntries>>["rows"][number]
type DebtRow = Awaited<ReturnType<typeof loadDebts>>["rows"][number]

// Подписи в файле — для бухгалтера, а не коды.
const METHOD_LABEL: Record<string, string> = {
  kaspi_qr: "Kaspi QR",
  kaspi_transfer: "Перевод Kaspi",
  debt: "В долг",
  bonus: "Бонусы",
}
const CHANNEL_LABEL: Record<string, string> = {
  kaspi_qr: "Kaspi QR",
  kaspi_transfer: "Перевод Kaspi",
  cash: "Наличные",
  card: "Карта",
  other: "Другое",
}
const STATUS_LABEL: Record<string, string> = {
  debt_requested: "Просит в долг",
  debt: "Долг",
  paid: "Погашен",
  canceled: "Отменён",
  refund_due: "Нужно вернуть",
  refunded: "Возвращено",
  awaiting: "Ждём оплату",
}

// Дата и время — в поясе магазина (Астана), как их видит продавец.
const shopDateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("ru-RU", {
        timeZone: shopTimeZone(),
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : ""

const shopDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("ru-RU", {
        timeZone: shopTimeZone(),
      })
    : ""

export const buildEntriesTable = (rows: EntryRow[]): (string | number | null)[][] => [
  [
    "Дата",
    "Заказ",
    "Покупатель",
    "Телефон",
    "Продавец",
    "Способ оплаты заказа",
    "Движение",
    "Как получены",
    "Сумма, ₸",
    "Кто отметил",
    "Комментарий",
  ],
  ...rows.map((row) => [
    shopDateTime(row.occurred_at),
    orderLabel(row.order_number, row.order_display_id),
    row.customer_name ?? "",
    row.customer_phone ?? "",
    row.seller_name ?? "",
    METHOD_LABEL[row.method] ?? row.method,
    row.kind === "payment" ? "Поступление" : "Возврат",
    CHANNEL_LABEL[row.channel] ?? row.channel,
    row.kind === "payment" ? row.amount : -row.amount,
    row.actor_type === "system" ? "Система" : row.actor_name ?? "",
    row.note ?? "",
  ]),
]

export const buildDebtsTable = (rows: DebtRow[]): (string | number | null)[][] => [
  [
    "Заказ",
    "Покупатель",
    "Телефон",
    "Продавец",
    "Состояние",
    "Сумма заказа, ₸",
    "Погашено, ₸",
    "Остаток долга, ₸",
    "Оформлен",
    "Срок",
    "Просрочка, дней",
  ],
  ...rows.map((row) => [
    orderLabel(row.order_number, row.order_display_id),
    row.customer_name ?? "",
    row.customer_phone ?? "",
    row.seller_name ?? "",
    STATUS_LABEL[row.status] ?? row.status,
    row.amount,
    row.paid_amount,
    row.outstanding,
    shopDate(row.created_at),
    shopDate(row.due_date),
    row.overdue ? row.overdue_days : "",
  ]),
]

export const paymentReportFileName = (view: "entries" | "debts", date: Date) =>
  `${view === "entries" ? "oplaty" : "dolgi"}-${date.toISOString().slice(0, 10)}.csv`
