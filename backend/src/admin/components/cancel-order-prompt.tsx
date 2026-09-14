import { Label, Prompt, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type CancelOrderPromptProps = {
  // null — диалог закрыт
  order: { id: string; display_id?: number } | null
  onClose: () => void
  onSubmit: (id: string, reason: string | null) => void
  isPending: boolean
}

// Диалог отмены заказа: причина НЕОБЯЗАТЕЛЬНА (в отличие от отклонения карточки/
// компании), логируется в note и лог переходов. danger-вариант — отмена
// необратима (терминальный статус canceled).
const CancelOrderPrompt = ({
  order,
  onClose,
  onSubmit,
  isPending,
}: CancelOrderPromptProps) => {
  const { t } = useTranslation()
  const [reason, setReason] = useState("")

  useEffect(() => {
    setReason("")
  }, [order?.id])

  return (
    <Prompt
      open={!!order}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      variant="danger"
    >
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>{t("order.transition.cancel")}</Prompt.Title>
          <Prompt.Description>
            {order
              ? order.display_id
                ? t("order.cancel.titleNamed", { id: order.display_id })
                : t("order.cancel.titleGeneric")
              : ""}
          </Prompt.Description>
        </Prompt.Header>
        <div className="flex flex-col gap-y-2 px-6 py-4">
          <Label htmlFor="cancel-order-reason">
            {t("order.cancel.reasonLabel")}
          </Label>
          <Textarea
            id="cancel-order-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("order.cancel.reasonPlaceholder")}
          />
        </div>
        <Prompt.Footer>
          <Prompt.Cancel>{t("order.cancel.keep")}</Prompt.Cancel>
          <Prompt.Action
            disabled={isPending}
            onClick={() =>
              order && onSubmit(order.id, reason.trim() || null)
            }
          >
            {t("order.cancel.confirm")}
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  )
}

export default CancelOrderPrompt
