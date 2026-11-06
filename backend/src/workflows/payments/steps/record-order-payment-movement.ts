import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import type {
  PaymentActorType,
  PaymentChannel,
  PaymentEntryKind,
} from "../../../modules/order-payment/models/values"
import {
  orderPaymentStatus,
  receiveError,
  refundError,
  roundMoney,
} from "../../../lib/payments/order-payment-state"
import {
  factsOf,
  requireOrderPayment,
  resolveOrderPaymentService,
} from "./order-payment-row"

export type RecordOrderPaymentMovementStepInput = {
  order_id: string
  kind: PaymentEntryKind
  channel: PaymentChannel
  amount: number
  note?: string | null
  actor_type: PaymentActorType
  actor_id?: string | null
  occurred_at?: Date | null
}

const ERROR_MESSAGE: Record<string, string> = {
  not_positive: "Сумма должна быть больше нуля",
  not_receivable: "Заказ уже оплачен или отменён — отмечать поступление нечего",
  over_outstanding: "Сумма больше, чем покупатель ещё должен по заказу",
  not_refundable: "По заказу нечего возвращать: он не отменён или деньги уже возвращены",
  over_refund_due: "Сумма больше, чем нужно вернуть покупателю",
}

// Движение денег по заказу: поступление (перевод получен, долг погашен) или
// возврат покупателю. Пишет запись журнала и пересчитывает суммы и состояние
// оплаты. Компенсация снимает запись и возвращает прежние суммы.
export const recordOrderPaymentMovementStep = createStep(
  "record-order-payment-movement",
  async (input: RecordOrderPaymentMovementStepInput, { container }) => {
    const service = resolveOrderPaymentService(container)
    const row = await requireOrderPayment(service, input.order_id)
    const facts = factsOf(row)
    const amount = roundMoney(input.amount)

    const error =
      input.kind === "payment"
        ? receiveError(row.status, facts, amount)
        : refundError(facts, amount)
    if (error) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, ERROR_MESSAGE[error])
    }

    const next = {
      ...facts,
      paid_amount:
        input.kind === "payment" ? roundMoney(facts.paid_amount + amount) : facts.paid_amount,
      refunded_amount:
        input.kind === "refund"
          ? roundMoney(facts.refunded_amount + amount)
          : facts.refunded_amount,
    }

    const entry = await service.createPaymentEntries({
      order_payment_id: row.id,
      kind: input.kind,
      channel: input.channel,
      amount,
      sales_channel_id: row.sales_channel_id,
      actor_type: input.actor_type,
      actor_id: input.actor_id ?? null,
      note: input.note?.trim() || null,
      occurred_at: input.occurred_at ?? new Date(),
    })
    await service.updateOrderPayments({
      id: row.id,
      paid_amount: next.paid_amount,
      refunded_amount: next.refunded_amount,
      status: orderPaymentStatus(next),
    })

    return new StepResponse(
      {
        order_payment_id: row.id,
        entry_id: entry.id,
        status: orderPaymentStatus(next),
        paid_amount: next.paid_amount,
        refunded_amount: next.refunded_amount,
      },
      {
        entry_id: entry.id,
        id: row.id,
        paid_amount: facts.paid_amount,
        refunded_amount: facts.refunded_amount,
        status: row.status,
      }
    )
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const service = resolveOrderPaymentService(container)
    await service.deletePaymentEntries(previous.entry_id)
    await service.updateOrderPayments({
      id: previous.id,
      paid_amount: previous.paid_amount,
      refunded_amount: previous.refunded_amount,
      status: previous.status,
    })
  }
)
