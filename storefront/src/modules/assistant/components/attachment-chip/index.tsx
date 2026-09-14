"use client"

import { ChatAttachment } from "@lib/assistant/file-attachment"
import { useMessages } from "@lib/i18n/i18n-context"
import AttachmentThumb from "@modules/assistant/components/attachment-thumb"
import X from "@modules/common/icons/x"

// Выбранное вложение в композере (T10.4b): превью, имя файла и крестик. Стоит
// НАД полем ввода, внутри той же пилюли, — покупатель должен видеть, что именно
// уйдёт вместе с репликой, и иметь возможность передумать до отправки.
const AttachmentChip = ({
  attachment,
  onRemove,
}: {
  attachment: ChatAttachment
  onRemove: () => void
}) => {
  const m = useMessages()

  return (
    <span
      className="flex max-w-[220px] items-center gap-2 rounded-chip border border-line bg-surface-dim py-1 pl-1 pr-1"
      data-testid="attachment-chip"
    >
      <AttachmentThumb
        attachment={attachment}
        className="h-8 w-8"
        iconSize="16"
      />
      <span
        className="truncate text-body-medium text-ink"
        title={attachment.name}
      >
        {attachment.name}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${m.assistant.files.remove}: ${attachment.name}`}
        title={m.assistant.files.remove}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-circle text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
        data-testid="attachment-remove-button"
      >
        <X size="14" />
      </button>
    </span>
  )
}

export default AttachmentChip
