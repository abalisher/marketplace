import { Label, Prompt, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"

type RejectCompanyPromptProps = {
  // null — диалог закрыт
  company: { id: string; name: string } | null
  onClose: () => void
  onSubmit: (id: string, reason: string) => void
  isPending: boolean
}

// Диалог отклонения компании: комментарий обязателен (требование ТЗ),
// кнопка недоступна, пока причина пустая. Общий для списка и карточки.
const RejectCompanyPrompt = ({
  company,
  onClose,
  onSubmit,
  isPending,
}: RejectCompanyPromptProps) => {
  const [reason, setReason] = useState("")

  useEffect(() => {
    setReason("")
  }, [company?.id])

  return (
    <Prompt
      open={!!company}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      variant="danger"
    >
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Reject company</Prompt.Title>
          <Prompt.Description>
            A rejection reason is required — the buyer will see it in their
            profile.
          </Prompt.Description>
        </Prompt.Header>
        <div className="flex flex-col gap-y-2 px-6 py-4">
          <Label htmlFor="reject-reason">Reason</Label>
          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Incorporation documents are missing"
          />
        </div>
        <Prompt.Footer>
          <Prompt.Cancel>Cancel</Prompt.Cancel>
          <Prompt.Action
            disabled={!reason.trim() || isPending}
            onClick={() => company && onSubmit(company.id, reason.trim())}
          >
            Reject
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  )
}

export default RejectCompanyPrompt
