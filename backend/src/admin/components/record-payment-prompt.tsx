import { orderLabel } from "../lib/order-label"
import { Input, Label, Prompt, Select, Text, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { formatTengeExact } from "../lib/money"
import {
  PAYMENT_CHANNEL_LABEL,
  PAYMENT_CHANNELS,
  PaymentChannel,
} from "../lib/payments"

export type RecordPaymentKind = "receive" | "refund"

export type RecordPaymentValues = {
  amount: number
  channel: PaymentChannel
  note: string | null
  // Дата поступления `YYYY-MM-DD` (сегодня — null: время ставит сервер).
  occurred_on: string | null
}

type RecordPaymentPromptProps = {
  // null — диалог закрыт
  target: {
    kind: RecordPaymentKind
    display_id: number | null
    order_number?: string | null
    // Сколько ещё можно отметить: остаток долга/перевода или сумма к возврату.
    max_amount: number
    // Канал по умолчанию: перевод — переводом, долг — как чаще гасят.
    default_channel: PaymentChannel
  } | null
  onClose: () => void
  onSubmit: (values: RecordPaymentValues) => void
  isPending: boolean
}

const todayIso = () => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// Диалог движения денег по заказу: поступление (перевод получен, долг погашен —
// можно частью) или возврат покупателю по отменённому заказу. Сумма по
// умолчанию — весь остаток; больше остатка бэкенд не примет.
const RecordPaymentPrompt = ({
  target,
  onClose,
  onSubmit,
  isPending,
}: RecordPaymentPromptProps) => {
  const { t } = useTranslation()
  const [amount, setAmount] = useState("")
  const [channel, setChannel] = useState<PaymentChannel>("kaspi_transfer")
  const [note, setNote] = useState("")
  const [occurredOn, setOccurredOn] = useState(todayIso())

  useEffect(() => {
    if (target) {
      setAmount(String(target.max_amount))
      setChannel(target.default_channel)
      setNote("")
      setOccurredOn(todayIso())
    }
  }, [target])

  const value = Number(amount.replace(/\s+/g, "").replace(",", "."))
  const valid =
    Number.isFinite(value) && value > 0 && !!target && value <= target.max_amount

  const isRefund = target?.kind === "refund"

  return (
    <Prompt
      open={!!target}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>
            {isRefund ? t("payments.record.refundTitle") : t("payments.record.receiveTitle")}
          </Prompt.Title>
          <Prompt.Description>
            {target?.display_id != null || target?.order_number
              ? t("payments.record.orderNo", {
                  id: orderLabel(target.order_number, target.display_id),
                })
              : ""}
            {target
              ? ` · ${t(isRefund ? "payments.record.maxRefund" : "payments.record.maxReceive", {
                  amount: formatTengeExact(target.max_amount),
                })}`
              : ""}
          </Prompt.Description>
        </Prompt.Header>
        <div className="flex flex-col gap-y-4 px-6 py-4">
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="record-payment-amount">{t("payments.record.amount")}</Label>
            <Input
              id="record-payment-amount"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            {!valid && amount !== "" && (
              <Text size="xsmall" className="text-ui-fg-error">
                {t("payments.record.amountInvalid")}
              </Text>
            )}
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>{isRefund ? t("payments.record.refundChannel") : t("payments.record.channel")}</Label>
            <Select value={channel} onValueChange={(next) => setChannel(next as PaymentChannel)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {PAYMENT_CHANNELS.map((option) => (
                  <Select.Item key={option} value={option}>
                    {t(PAYMENT_CHANNEL_LABEL[option])}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="record-payment-date">{t("payments.record.date")}</Label>
            <Input
              id="record-payment-date"
              type="date"
              max={todayIso()}
              value={occurredOn}
              onChange={(event) => setOccurredOn(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="record-payment-note">{t("payments.record.note")}</Label>
            <Textarea
              id="record-payment-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("payments.record.notePlaceholder")}
            />
          </div>
        </div>
        <Prompt.Footer>
          <Prompt.Cancel>{t("common.cancel")}</Prompt.Cancel>
          <Prompt.Action
            disabled={isPending || !valid}
            onClick={() =>
              onSubmit({
                amount: value,
                channel,
                note: note.trim() || null,
                occurred_on: occurredOn && occurredOn !== todayIso() ? occurredOn : null,
              })
            }
          >
            {isRefund ? t("payments.record.refundConfirm") : t("payments.record.receiveConfirm")}
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  )
}

export default RecordPaymentPrompt
