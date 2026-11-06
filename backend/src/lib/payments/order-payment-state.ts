import type {
  OrderPaymentStatus,
  PaymentMethod,
} from "../../modules/order-payment/models/values"

// Состояние оплаты заказа — из суммы, полученного, возвращённого и решений
// продавца. Хранится в строке order_payment, но считается всегда здесь: после
// каждой записи журнала и каждого решения статус пересчитывается целиком, а не
// «переключается», и разъехаться с суммами не может.

export type OrderPaymentFacts = {
  method: PaymentMethod
  amount: number
  paid_amount: number
  refunded_amount: number
  // Долг одобрен продавцом.
  approved: boolean
  // Заказ отменён.
  canceled: boolean
}

// Копейки не теряем, но и хвостов плавающей точки не копим.
export const roundMoney = (value: number): number =>
  Math.round(value * 100) / 100

export const orderPaymentStatus = (facts: OrderPaymentFacts): OrderPaymentStatus => {
  const paid = roundMoney(facts.paid_amount)
  const refunded = roundMoney(facts.refunded_amount)
  if (facts.canceled) {
    if (paid - refunded > 0) {
      return "refund_due"
    }
    return paid > 0 ? "refunded" : "canceled"
  }
  if (paid >= roundMoney(facts.amount)) {
    return "paid"
  }
  if (facts.method === "debt") {
    return facts.approved ? "debt" : "debt_requested"
  }
  return "awaiting"
}

// Состояние сразу после оформления: Kaspi QR оплачен ещё до заказа (кроме
// Kaspi QR с оплатой после оформления — `deferred`, его счёт выставлен на
// заказ), перевод ждём, долг ждёт решения продавца, бонусы — оплата целиком.
export const initialPaymentFacts = (
  method: PaymentMethod,
  amount: number,
  deferred = false
): OrderPaymentFacts => ({
  method,
  amount,
  paid_amount:
    (method === "kaspi_qr" && !deferred) || method === "bonus" ? amount : 0,
  refunded_amount: 0,
  approved: false,
  canceled: false,
})

// Что сделать с Kaspi сразу после оформления:
// - "entry" — QR оплачен до заказа: поступление пишется в журнал;
// - "invoice" — QR с оплатой после оформления: на заказ выставляется счёт;
// - "none" — постоянный QR магазина (deferred без счёта: оплату подтверждают
//   чек и продавец) и все прочие способы. Раньше этот случай проваливался в
//   ветку «оплачен до заказа» и писал в журнал поступление, которого не было
//   (NUR-26-0001, 2026-11-05).
export const initialKaspiAction = (
  method: PaymentMethod,
  amount: number,
  deferred: boolean,
  staticQr: boolean
): "entry" | "invoice" | "none" => {
  if (method !== "kaspi_qr" || amount <= 0) {
    return "none"
  }
  if (deferred) {
    return staticQr ? "none" : "invoice"
  }
  return "entry"
}

// Сколько покупатель ещё должен (0 у отменённого заказа: его долг снят).
export const outstandingAmount = (facts: OrderPaymentFacts): number =>
  facts.canceled
    ? 0
    : Math.max(roundMoney(facts.amount - facts.paid_amount), 0)

// Сколько продавец должен вернуть по отменённому заказу.
export const refundDueAmount = (facts: OrderPaymentFacts): number =>
  facts.canceled
    ? Math.max(roundMoney(facts.paid_amount - facts.refunded_amount), 0)
    : 0

// Отметить поступление можно, пока заказ не оплачен целиком и не отменён.
const RECEIVABLE: readonly OrderPaymentStatus[] = [
  "awaiting",
  "debt_requested",
  "debt",
]

export type PaymentMovementError =
  | "not_positive"
  | "not_receivable"
  | "over_outstanding"
  | "not_refundable"
  | "over_refund_due"

export const receiveError = (
  status: OrderPaymentStatus,
  facts: OrderPaymentFacts,
  amount: number
): PaymentMovementError | null => {
  if (!(amount > 0)) {
    return "not_positive"
  }
  if (!RECEIVABLE.includes(status)) {
    return "not_receivable"
  }
  if (roundMoney(amount) > outstandingAmount(facts)) {
    return "over_outstanding"
  }
  return null
}

export const refundError = (
  facts: OrderPaymentFacts,
  amount: number
): PaymentMovementError | null => {
  if (!(amount > 0)) {
    return "not_positive"
  }
  if (refundDueAmount(facts) <= 0) {
    return "not_refundable"
  }
  if (roundMoney(amount) > refundDueAmount(facts)) {
    return "over_refund_due"
  }
  return null
}

// Срок долга по умолчанию: N суток от одобрения, конец дня не считаем —
// продавец видит дату, а не час.
export const defaultDueDate = (from: Date, termDays: number): Date =>
  new Date(from.getTime() + Math.max(termDays, 0) * 24 * 3_600_000)

// Долг просрочен: одобрен, не погашен, срок прошёл.
export const isDebtOverdue = (
  status: OrderPaymentStatus,
  dueDate: Date | string | null,
  now: Date = new Date()
): boolean =>
  status === "debt" && !!dueDate && new Date(dueDate).getTime() < now.getTime()

// Заказ можно подтверждать (пускать в сборку): перевод — только после
// поступления денег; Kaspi QR, выставленный уже после оформления (покупатель
// сменил способ), — только после оплаты; долг — подтверждение и есть одобрение
// (см. workflow).
export type ConfirmBlock = "transfer_not_received" | "kaspi_not_paid"

export const confirmBlock = (
  method: PaymentMethod,
  status: OrderPaymentStatus
): ConfirmBlock | null => {
  if (status !== "awaiting") {
    return null
  }
  if (method === "kaspi_transfer") {
    return "transfer_not_received"
  }
  return method === "kaspi_qr" ? "kaspi_not_paid" : null
}

// Сменить способ оплаты оформленного заказа покупатель может, пока продавец
// заказ не подтвердил, денег по нему не отмечено и он не отменён: иначе
// продавец работал бы с одним способом, а покупатель платил другим.
export type PaymentChangeBlock = "confirmed" | "has_money" | "not_changeable"

export const paymentChangeBlock = (
  lifecycleStatus: string | null | undefined,
  status: OrderPaymentStatus,
  facts: OrderPaymentFacts
): PaymentChangeBlock | null => {
  if (lifecycleStatus !== "new") {
    return "confirmed"
  }
  if (roundMoney(facts.paid_amount) > 0) {
    return "has_money"
  }
  return status === "awaiting" || status === "debt_requested"
    ? null
    : "not_changeable"
}
