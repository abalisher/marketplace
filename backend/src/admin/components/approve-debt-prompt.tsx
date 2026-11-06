import { orderLabel } from "../lib/order-label"
import { Input, Label, Prompt, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { formatTengeExact } from "../lib/money"

type ApproveDebtPromptProps = {
  // null — диалог закрыт
  order: {
    id: string
    display_id: number | null
    order_number?: string | null
    amount: number
    term_days: number
  } | null
  onClose: () => void
  onSubmit: (id: string, dueDate: string) => void
  isPending: boolean
}

const isoDay = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Подтверждение заказа «в долг» = одобрение долга: продавец назначает срок
// возврата (по умолчанию — срок из его настроек). Отказать в долге — отменить
// заказ с причиной.
const ApproveDebtPrompt = ({
  order,
  onClose,
  onSubmit,
  isPending,
}: ApproveDebtPromptProps) => {
  const { t } = useTranslation()
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    if (order) {
      setDueDate(isoDay(new Date(Date.now() + order.term_days * 24 * 3_600_000)))
    }
  }, [order])

  const today = isoDay(new Date())
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(dueDate) && dueDate >= today

  return (
    <Prompt
      open={!!order}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>{t("payments.approve.title")}</Prompt.Title>
          <Prompt.Description>
            {order
              ? t("payments.approve.description", {
                  id: orderLabel(order.order_number, order.display_id),
                  amount: formatTengeExact(order.amount),
                })
              : ""}
          </Prompt.Description>
        </Prompt.Header>
        <div className="flex flex-col gap-y-2 px-6 py-4">
          <Label htmlFor="approve-debt-due">{t("payments.approve.dueDate")}</Label>
          <Input
            id="approve-debt-due"
            type="date"
            min={today}
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          <Text size="xsmall" className="text-ui-fg-subtle">
            {t("payments.approve.hint")}
          </Text>
        </div>
        <Prompt.Footer>
          <Prompt.Cancel>{t("common.cancel")}</Prompt.Cancel>
          <Prompt.Action
            disabled={isPending || !valid}
            onClick={() => order && onSubmit(order.id, dueDate)}
          >
            {t("payments.approve.confirm")}
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  )
}

export default ApproveDebtPrompt
