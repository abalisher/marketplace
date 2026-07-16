import { Input, Label, Prompt } from "@medusajs/ui"
import { useEffect, useState } from "react"

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
          <Prompt.Title>Mark delivered</Prompt.Title>
          <Prompt.Description>
            {order
              ? `Enter the delivery code the buyer provides to confirm ${
                  order.display_id
                    ? `order #${order.display_id}`
                    : "this order"
                } was handed over.`
              : ""}
          </Prompt.Description>
        </Prompt.Header>
        <div className="flex flex-col gap-y-2 px-6 py-4">
          <Label htmlFor="deliver-order-code">Delivery code</Label>
          <Input
            id="deliver-order-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="e.g. 123456"
            autoComplete="off"
          />
        </div>
        <Prompt.Footer>
          <Prompt.Cancel>Cancel</Prompt.Cancel>
          <Prompt.Action
            disabled={isPending || !code.trim()}
            onClick={() => order && onSubmit(order.id, code.trim())}
          >
            Mark delivered
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  )
}

export default DeliverOrderPrompt
