import { Input, Label, Prompt } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type DeliverOrderPromptProps = {
  // null — диалог закрыт
  order: { id: string; display_id?: number } | null
  onClose: () => void
  onSubmit: (id: string, code: string) => void
  isPending: boolean
}

// Диалог вручения заказа с доставкой: код получения ОБЯЗАТЕЛЕН — его называет
// покупатель при вручении (бэкенд выдал код при отгрузке, покупатель видит его
// в ЛК). Без верного кода переход в delivered отклоняется сервером.
const DeliverOrderPrompt = ({
  order,
  onClose,
  onSubmit,
  isPending,
}: DeliverOrderPromptProps) => {
  const { t } = useTranslation()
  const [code, setCode] = useState("")

  useEffect(() => {
    setCode("")
  }, [order?.id])

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
          <Prompt.Title>{t("order.transition.markDelivered")}</Prompt.Title>
          <Prompt.Description>
            {order
              ? order.display_id
                ? t("order.deliver.descNamed", { id: order.display_id })
                : t("order.deliver.descGeneric")
              : ""}
          </Prompt.Description>
        </Prompt.Header>
        <div className="flex flex-col gap-y-2 px-6 py-4">
          <Label htmlFor="deliver-order-code">
            {t("order.deliver.codeLabel")}
          </Label>
          <Input
            id="deliver-order-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={t("order.deliver.codePlaceholder")}
            autoComplete="off"
          />
        </div>
        <Prompt.Footer>
          <Prompt.Cancel>{t("common.cancel")}</Prompt.Cancel>
          <Prompt.Action
            disabled={isPending || !code.trim()}
            onClick={() => order && onSubmit(order.id, code.trim())}
          >
            {t("order.transition.markDelivered")}
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  )
}

export default DeliverOrderPrompt
