"use client"

import {
  ChatAttachment,
  attachmentPreviewUrl,
} from "@lib/assistant/file-attachment"
import Document from "@modules/common/icons/document"
import { clx } from "@medusajs/ui"
import { useState } from "react"

// Превью одного вложения (T10.4b): кадр — картинкой, всё остальное — листом.
// Отдельный компонент, потому что рисовать превью надо в двух местах: в
// композере до отправки и в ленте после неё.
//
// Картинку показываем ОПТИМИСТИЧНО и падаем на лист по `onError`: heic со
// снимка iPhone бэкенд принимает, а браузер (кроме Safari) не рисует — и это не
// повод прятать вложение из ленты.
const AttachmentThumb = ({
  attachment,
  className,
  iconSize = "20",
}: {
  attachment: ChatAttachment
  className?: string
  iconSize?: string
}) => {
  const [isBroken, setIsBroken] = useState(false)
  const box = clx(
    "flex shrink-0 items-center justify-center overflow-hidden rounded-base bg-surface-dim text-ink-secondary",
    className
  )

  if (!attachment.isImage || isBroken) {
    return (
      <span className={box} aria-hidden data-testid="attachment-thumb-file">
        <Document size={iconSize} />
      </span>
    )
  }

  return (
    <span className={box} data-testid="attachment-thumb-image">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={attachmentPreviewUrl(attachment)}
        alt={attachment.name}
        onError={() => setIsBroken(true)}
        className="h-full w-full object-cover"
      />
    </span>
  )
}

export default AttachmentThumb
