import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { outstandingAmount } from "../../../lib/payments/order-payment-state"
import { factsOf, OrderPaymentRow, resolveOrderPaymentService } from "./order-payment-row"
import { receiptAmountToRecord } from "./submit-payment-receipt"

export type PrepareReceiptReviewStepInput = {
  receipt_id: string
  decision: "accept" | "reject"
  // Сумма к засчитыванию (продавец поправил); нет — из чека, не больше долга.
  amount?: number | null
}

type ReceiptRow = {
  id: string
  status: string
  amount: unknown
  receipt_number: string | null
  order_payment: OrderPaymentRow
}

// Решение продавца по чеку — подготовка: чек ждёт решения, у заказа есть долг;
// сумма для журнала. Только чтение: деньги пишет следующий шаг workflow, чек
// помечает последний.
export const prepareReceiptReviewStep = createStep(
  "prepare-receipt-review",
  async (input: PrepareReceiptReviewStepInput, { container }) => {
    const service = resolveOrderPaymentService(container)
    const [found] = await service.listPaymentReceipts(
      { id: input.receipt_id },
      { relations: ["order_payment"], take: 1 }
    )
    const receipt = found as unknown as ReceiptRow | undefined
    if (!receipt) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Чек не найден")
    }
    if (receipt.status !== "pending" && receipt.status !== "flagged") {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "По этому чеку решение уже принято")
    }
    const outstanding = outstandingAmount(factsOf(receipt.order_payment))
    const amount =
      input.decision === "accept"
        ? input.amount && input.amount > 0
          ? input.amount
          : receiptAmountToRecord(receipt.amount, outstanding)
        : 0
    return new StepResponse({
      order_id: receipt.order_payment.order_id,
      // Как пришли деньги: оплата по QR магазина — Kaspi QR, иначе перевод.
      channel: (receipt.order_payment.method === "kaspi_qr" ? "kaspi_qr" : "kaspi_transfer") as
        | "kaspi_qr"
        | "kaspi_transfer",
      accept: input.decision === "accept",
      amount,
      note: receipt.receipt_number ? `Чек Kaspi №${receipt.receipt_number}` : "Чек Kaspi покупателя",
    })
  }
)

export type FinishReceiptReviewStepInput = {
  receipt_id: string
  accept: boolean
  entry_id: string | null
  actor_id: string | null
  note: string | null
}

// Пометить чек решением продавца и пересчитать признак «чек ждёт» у заказа.
export const finishReceiptReviewStep = createStep(
  "finish-receipt-review",
  async (input: FinishReceiptReviewStepInput, { container }) => {
    const service = resolveOrderPaymentService(container)
    const [receipt] = await service.listPaymentReceipts(
      { id: input.receipt_id },
      { relations: ["order_payment"], take: 1 }
    )
    const paymentId = (receipt as unknown as { order_payment: { id: string } }).order_payment.id
    await service.updatePaymentReceipts({
      id: input.receipt_id,
      status: input.accept ? "accepted" : "rejected",
      entry_id: input.entry_id,
      reviewed_by: input.actor_id,
      reviewed_at: new Date(),
      review_note: input.note?.trim() || null,
    })
    const waiting = await service.listPaymentReceipts(
      { order_payment_id: paymentId, status: ["pending", "flagged"] } as never,
      { take: 1 }
    )
    await service.updateOrderPayments({ id: paymentId, receipt_pending: waiting.length > 0 })
    return new StepResponse({ status: input.accept ? "accepted" : "rejected" })
  }
)
