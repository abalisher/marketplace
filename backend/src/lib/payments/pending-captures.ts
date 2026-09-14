import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { capturePaymentWorkflow } from "@medusajs/medusa/core-flows"

// Платёж заказа, который авторизован, но не списан (T4.14).
export type PendingCapture = {
  payment_id: string
  order_id: string
  display_id: number | null
  amount: number
  currency_code: string | null
}

// Сырая строка graph по заказу — ровно те поля, что запрашиваем ниже.
export type RawOrderPayments = {
  id: string
  display_id?: number | null
  payment_collections?:
    | {
        payments?:
          | {
              id: string
              amount?: unknown
              currency_code?: string | null
              captured_at?: string | Date | null
              canceled_at?: string | Date | null
            }[]
          | null
      }[]
    | null
}

export const ORDER_PAYMENT_FIELDS = [
  "id",
  "display_id",
  "payment_collections.payments.id",
  "payment_collections.payments.amount",
  "payment_collections.payments.currency_code",
  "payment_collections.payments.captured_at",
  "payment_collections.payments.canceled_at",
]

// Суммы ядро отдаёт как BigNumber-объект или строку — приводим к числу.
const numeric = (value: unknown): number => {
  if (typeof value === "number") {
    return value
  }
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  if (value && typeof value === "object" && "value" in value) {
    return numeric((value as { value: unknown }).value)
  }
  return 0
}

// Чистая выборка: платёж ждёт списания, если он ещё не списан и не отменён.
// Отдельного признака авторизации у платежа нет — запись `Payment` ядро создаёт
// уже ПО ФАКТУ авторизации сессии (в модели только `captured_at`/`canceled_at`),
// поэтому её существование и означает «деньги подтверждены».
// Тестируется без БД, используется и шагом оформления, и скриптом починки уже
// размещённых заказов.
export const selectPendingCaptures = (
  orders: RawOrderPayments[]
): PendingCapture[] => {
  const pending: PendingCapture[] = []

  for (const order of orders) {
    for (const collection of order.payment_collections ?? []) {
      for (const payment of collection.payments ?? []) {
        if (payment.captured_at || payment.canceled_at) {
          continue
        }
        pending.push({
          payment_id: payment.id,
          order_id: order.id,
          display_id: order.display_id ?? null,
          amount: numeric(payment.amount),
          currency_code: payment.currency_code ?? null,
        })
      }
    }
  }

  return pending
}

// Платежи заказа (или всех заказов, если id не задан), ждущие списания.
// Без id это выборка по всей таблице заказов — она нужна только скрипту-отчёту
// на стенде; в оформлении id всегда задан.
export const findPendingCaptures = async (
  container: MedusaContainer,
  orderId?: string
): Promise<PendingCapture[]> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "order",
    fields: ORDER_PAYMENT_FIELDS,
    ...(orderId ? { filters: { id: orderId } } : {}),
  })

  return selectPendingCaptures(data as RawOrderPayments[])
}

export type CaptureOutcome = {
  capture: PendingCapture
  error: string | null
}

// Списание ядровым workflow (он же стоит за admin-кнопкой «Получить платеж»):
// кроме самого capture он пишет транзакцию заказа — без неё ядро продолжает
// показывать «остаток к оплате» — и эмитит payment.captured.
// Ошибку НЕ бросаем наружу: заказ уже размещён и деньги в Kaspi уже списаны
// (QR-оплата = списание), откатывать оформление из-за неудачного подтверждения
// нельзя. Несписанные платежи находит отчёт `check-order-captures`.
export const capturePendingPayments = async (
  container: MedusaContainer,
  captures: PendingCapture[]
): Promise<CaptureOutcome[]> => {
  const outcomes: CaptureOutcome[] = []

  for (const capture of captures) {
    try {
      await capturePaymentWorkflow(container).run({
        input: { payment_id: capture.payment_id },
      })
      outcomes.push({ capture, error: null })
    } catch (e) {
      outcomes.push({ capture, error: (e as Error).message })
    }
  }

  return outcomes
}
