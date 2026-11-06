import { ArrowUpRightOnBox } from "@medusajs/icons"
import { Button, Input, Label, Prompt, StatusBadge, Text, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useOrderPayment } from "../hooks/use-order-payment"
import { formatDateTime } from "../lib/date"
import { formatTengeExact } from "../lib/money"
import { AdminPaymentReceipt, RECEIPT_STATUS_META } from "../lib/payments"

type Props = {
  orderId: string
  receipt: AdminPaymentReceipt
  // Сколько покупатель ещё должен: больше засчитать нельзя.
  outstanding: number
  readOnly?: boolean
}

// Чек Kaspi покупателя в карточке заказа: файл, что прочитано, замечания
// проверки (нарушения — красным) и решение продавца. Засчитать — поступление в
// журнал на сумму из чека (можно поправить); отклонить — с причиной, её увидит
// покупатель. Решение — после сверки с приложением Kaspi: проверка ловит
// несоответствия, но аккуратно нарисованный чек от настоящего не отличит.
const PaymentReceiptCard = ({ orderId, receipt, outstanding, readOnly }: Props) => {
  const { t } = useTranslation()
  const { acceptReceiptMutation, rejectReceiptMutation } = useOrderPayment()
  const [prompt, setPrompt] = useState<"accept" | "reject" | null>(null)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const meta = RECEIPT_STATUS_META[receipt.status]
  const waiting = receipt.status === "pending" || receipt.status === "flagged"

  useEffect(() => {
    if (prompt) {
      setAmount(String(Math.min(receipt.amount ?? outstanding, outstanding)))
      setNote("")
    }
  }, [prompt, receipt.amount, outstanding])

  const value = Number(amount.replace(/\s+/g, "").replace(",", "."))
  const amountValid = Number.isFinite(value) && value > 0 && value <= outstanding

  const field = (label: string, text: string | null) =>
    text ? (
      <div className="flex flex-col">
        <Text size="xsmall" className="text-ui-fg-subtle">
          {label}
        </Text>
        <Text size="small">{text}</Text>
      </div>
    ) : null

  return (
    <div
      className={
        receipt.status === "flagged"
          ? "border-ui-tag-red-border flex flex-col gap-y-2 rounded-lg border p-3"
          : "flex flex-col gap-y-2 rounded-lg border border-ui-border-base p-3"
      }
      data-sm-receipt={receipt.status}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusBadge color={meta.color}>{t(meta.label)}</StatusBadge>
          <Text size="xsmall" className="text-ui-fg-subtle">
            {formatDateTime(receipt.created_at)}
          </Text>
        </div>
        {receipt.file_url && (
          <a
            href={receipt.file_url}
            target="_blank"
            rel="noreferrer"
            className="text-ui-fg-interactive txt-compact-small flex items-center gap-1"
          >
            <ArrowUpRightOnBox />
            {t("payments.receipts.openFile")}
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {field(t("payments.receipts.amount"), receipt.amount != null ? formatTengeExact(receipt.amount) : null)}
        {field(t("payments.receipts.paidAt"), receipt.paid_at ? formatDateTime(receipt.paid_at) : null)}
        {field(t("payments.receipts.number"), receipt.receipt_number)}
        {field(
          t("payments.receipts.recipient"),
          [
            receipt.recipient_name,
            receipt.recipient_phone,
            receipt.recipient_bin ? `${t("payments.receipts.bin")} ${receipt.recipient_bin}` : null,
          ]
            .filter(Boolean)
            .join(" · ") || null
        )}
        {field(t("payments.receipts.sender"), receipt.sender_name)}
        {field(t("payments.receipts.comment"), receipt.comment)}
      </div>

      {receipt.checks.length ? (
        <ul className="flex flex-col gap-y-1">
          {receipt.checks.map((check, index) => (
            <li key={index}>
              <Text
                size="xsmall"
                className={check.level === "fail" ? "text-ui-fg-error" : "text-ui-fg-subtle"}
              >
                {check.level === "fail" ? "✗ " : "⚠ "}
                {check.text}
              </Text>
            </li>
          ))}
        </ul>
      ) : (
        <Text size="xsmall" className="text-ui-fg-subtle">
          ✓ {t("payments.receipts.checksOk")}
        </Text>
      )}

      {receipt.review_note && (
        <Text size="xsmall" className="text-ui-fg-subtle">
          {t("payments.receipts.reviewNote", { note: receipt.review_note })}
        </Text>
      )}

      {waiting && !readOnly && (
        <div className="flex flex-col gap-y-1">
          <Text size="xsmall" className="text-ui-fg-subtle">
            {t("payments.receipts.verifyHint")}
          </Text>
          <div className="flex flex-wrap gap-2">
            <Button
              size="small"
              variant={receipt.status === "flagged" ? "secondary" : "primary"}
              disabled={outstanding <= 0}
              onClick={() => setPrompt("accept")}
            >
              {t("payments.receipts.accept")}
            </Button>
            <Button size="small" variant="secondary" onClick={() => setPrompt("reject")}>
              {t("payments.receipts.reject")}
            </Button>
          </div>
        </div>
      )}

      <Prompt open={!!prompt} onOpenChange={(open) => !open && setPrompt(null)}>
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>
              {prompt === "reject" ? t("payments.receipts.rejectTitle") : t("payments.receipts.acceptTitle")}
            </Prompt.Title>
            <Prompt.Description>
              {prompt === "reject"
                ? t("payments.receipts.rejectDescription")
                : t("payments.receipts.acceptDescription", { amount: formatTengeExact(outstanding) })}
            </Prompt.Description>
          </Prompt.Header>
          <div className="flex flex-col gap-y-3 px-6 py-4">
            {prompt === "accept" && receipt.status === "flagged" && (
              <Text size="small" className="text-ui-fg-error">
                {t("payments.receipts.flaggedWarning")}
              </Text>
            )}
            {prompt === "accept" && (
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="receipt-amount">{t("payments.record.amount")}</Label>
                <Input
                  id="receipt-amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="receipt-note">
                {prompt === "reject" ? t("payments.receipts.rejectReason") : t("payments.record.note")}
              </Label>
              <Textarea
                id="receipt-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={prompt === "reject" ? t("payments.receipts.rejectPlaceholder") : ""}
              />
            </div>
          </div>
          <Prompt.Footer>
            <Prompt.Cancel>{t("common.cancel")}</Prompt.Cancel>
            <Prompt.Action
              disabled={
                acceptReceiptMutation.isPending ||
                rejectReceiptMutation.isPending ||
                (prompt === "accept" ? !amountValid : !note.trim())
              }
              onClick={() => {
                if (prompt === "accept") {
                  acceptReceiptMutation.mutate(
                    { orderId, receiptId: receipt.id, amount: value, note: note.trim() || null },
                    { onSuccess: () => setPrompt(null) }
                  )
                } else if (prompt === "reject") {
                  rejectReceiptMutation.mutate(
                    { orderId, receiptId: receipt.id, note: note.trim() },
                    { onSuccess: () => setPrompt(null) }
                  )
                }
              }}
            >
              {prompt === "reject" ? t("payments.receipts.reject") : t("payments.receipts.accept")}
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </div>
  )
}

export default PaymentReceiptCard
