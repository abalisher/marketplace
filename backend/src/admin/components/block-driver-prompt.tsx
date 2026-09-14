import { Label, Prompt, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type BlockDriverPromptProps = {
  // null — диалог закрыт
  driver: { id: string; full_name: string | null; phone: string } | null
  onClose: () => void
  onSubmit: (id: string, reason: string) => void
  isPending: boolean
}

// Диалог «закрыть доступ»: отказ по заявке и блокировка — одно решение,
// различает их причина, поэтому она обязательна. Причину водитель видит у себя
// в приложении — иначе он получит «доступа нет» без объяснения и придёт
// выяснять голосом. Общий для очереди и карточки.
const BlockDriverPrompt = ({
  driver,
  onClose,
  onSubmit,
  isPending,
}: BlockDriverPromptProps) => {
  const { t } = useTranslation()
  const [reason, setReason] = useState("")

  useEffect(() => {
    setReason("")
  }, [driver?.id])

  return (
    <Prompt
      open={!!driver}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      variant="danger"
    >
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>{t("drivers.block.title")}</Prompt.Title>
          <Prompt.Description>
            {t("drivers.block.description")}
          </Prompt.Description>
        </Prompt.Header>
        <div className="flex flex-col gap-y-2 px-6 py-4">
          <Label htmlFor="block-driver-reason">{t("common.reason")}</Label>
          <Textarea
            id="block-driver-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("drivers.block.placeholder")}
          />
        </div>
        <Prompt.Footer>
          <Prompt.Cancel>{t("common.cancel")}</Prompt.Cancel>
          <Prompt.Action
            disabled={!reason.trim() || isPending}
            onClick={() => driver && onSubmit(driver.id, reason.trim())}
          >
            {t("drivers.action.block")}
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  )
}

export default BlockDriverPrompt
