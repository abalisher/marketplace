import { toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { AdminOrderPayment, errorText, PaymentChannel } from "../lib/payments"
import { sdk } from "../lib/sdk"

type RecordVars = {
  orderId: string
  kind: "receive" | "refund"
  amount: number
  channel: PaymentChannel
  note: string | null
  occurred_on: string | null
}

// Движение денег по заказу (POST /admin/orders/:id/payment/receive|refund).
// Инвалидирует карточку и очередь заказов (состояние оплаты в строке), оплату
// на странице заказа, отчёт и дашборд.
export const useOrderPayment = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const recordMutation = useMutation({
    mutationFn: ({ orderId, kind, occurred_on, ...body }: RecordVars) =>
      sdk.client.fetch<{ payment: AdminOrderPayment | null }>(
        `/admin/orders/${orderId}/payment/${kind}`,
        {
          method: "POST",
          body: {
            ...body,
            // Дата без времени — полдень дня магазина: в отчёте за день она
            // попадёт в свой день при любом поясе браузера.
            ...(occurred_on ? { occurred_at: `${occurred_on}T12:00:00+05:00` } : {}),
          },
        }
      ),
    onSuccess: (_data, { kind }) => {
      toast.success(
        t(kind === "refund" ? "payments.record.refundSaved" : "payments.record.receiveSaved")
      )
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["order-lifecycle"] }),
        queryClient.invalidateQueries({ queryKey: ["order-payment"] }),
        queryClient.invalidateQueries({ queryKey: ["payment-report"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ])
    },
    onError: (error: Error) => toast.error(errorText(error, t("payments.error"))),
  })

  // Решение по чеку покупателя: засчитать (поступление в журнал) или отклонить.
  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["order-lifecycle"] }),
      queryClient.invalidateQueries({ queryKey: ["order-payment"] }),
      queryClient.invalidateQueries({ queryKey: ["payment-report"] }),
      queryClient.invalidateQueries({ queryKey: ["orders"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ])

  const acceptReceiptMutation = useMutation({
    mutationFn: ({
      orderId,
      receiptId,
      amount,
      note,
    }: {
      orderId: string
      receiptId: string
      amount: number
      note: string | null
    }) =>
      sdk.client.fetch(`/admin/orders/${orderId}/payment/receipts/${receiptId}/accept`, {
        method: "POST",
        body: { amount, note },
      }),
    onSuccess: () => {
      toast.success(t("payments.receipts.accepted"))
      return invalidate()
    },
    onError: (error: Error) => toast.error(errorText(error, t("payments.error"))),
  })

  const rejectReceiptMutation = useMutation({
    mutationFn: ({ orderId, receiptId, note }: { orderId: string; receiptId: string; note: string }) =>
      sdk.client.fetch(`/admin/orders/${orderId}/payment/receipts/${receiptId}/reject`, {
        method: "POST",
        body: { note },
      }),
    onSuccess: () => {
      toast.success(t("payments.receipts.rejected"))
      return invalidate()
    },
    onError: (error: Error) => toast.error(errorText(error, t("payments.error"))),
  })

  return { recordMutation, acceptReceiptMutation, rejectReceiptMutation }
}
