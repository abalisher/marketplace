import { Label, Prompt, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"

type RejectProductCardPromptProps = {
  // null — диалог закрыт
  product: { id: string; title: string } | null
  onClose: () => void
  onSubmit: (id: string, reason: string) => void
  isPending: boolean
}

// Диалог отклонения карточки товара: комментарий обязателен (требование ТЗ),
// кнопка недоступна, пока причина пустая. Общий для очереди и widget'а.
const RejectProductCardPrompt = ({
  product,
  onClose,
  onSubmit,
  isPending,
}: RejectProductCardPromptProps) => {
  const [reason, setReason] = useState("")

  useEffect(() => {
    setReason("")
  }, [product?.id])

  return (
    <Prompt
      open={!!product}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      variant="danger"
    >
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Reject product card</Prompt.Title>
          <Prompt.Description>
            A rejection reason is required — the seller will see it on the
            product card.
          </Prompt.Description>
        </Prompt.Header>
        <div className="flex flex-col gap-y-2 px-6 py-4">
          <Label htmlFor="reject-card-reason">Reason</Label>
          <Textarea
            id="reject-card-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Certificates are missing or expired"
          />
        </div>
        <Prompt.Footer>
          <Prompt.Cancel>Cancel</Prompt.Cancel>
          <Prompt.Action
            disabled={!reason.trim() || isPending}
            onClick={() => product && onSubmit(product.id, reason.trim())}
          >
            Reject
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  )
}

export default RejectProductCardPrompt
