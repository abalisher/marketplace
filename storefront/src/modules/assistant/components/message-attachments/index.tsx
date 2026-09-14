"use client"

import { ChatAttachment } from "@lib/assistant/file-attachment"
import AttachmentThumb from "@modules/assistant/components/attachment-thumb"

// Вложения ОТПРАВЛЕННОЙ реплики покупателя (T10.4b): показываются в его пузыре
// над текстом — как в эталоне. Кадр видно целиком превью, файл — листом с
// именем: покупатель должен узнать в ленте, какой именно снимок он приложил.
//
// Живут в памяти вкладки: в историю диалога (localStorage) вложения не пишем —
// три снимка по 8 МБ выбили бы квоту хранилища, а бэкенду они и так уходят
// ровно один раз (файл видит только тот ход, с которым его прислали).
const MessageAttachments = ({
  attachments,
}: {
  attachments: ChatAttachment[]
}) => (
  <div className="flex flex-wrap gap-2" data-testid="message-attachments">
    {attachments.map((attachment) =>
      attachment.isImage ? (
        <AttachmentThumb
          key={attachment.id}
          attachment={attachment}
          className="h-24 w-24"
          iconSize="24"
        />
      ) : (
        <span
          key={attachment.id}
          className="flex max-w-[220px] items-center gap-2 rounded-base bg-surface px-2 py-2"
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
        </span>
      )
    )}
  </div>
)

export default MessageAttachments
