import { ChatAttachment } from "@lib/assistant/file-attachment"
import MessageAttachments from "@modules/assistant/components/message-attachments"
import MessageContent from "@modules/assistant/components/message-content"

// Реплика ПОКУПАТЕЛЯ: компактный пузырь справа на подложке акцента (эталон
// Gemini, бриф T10.1a раздел 3.4). Ответ ассистента рисует assistant-answer —
// он без пузыря и во всю ширину столбца.
//
// Текста может не быть вовсе: снимок без подписи — нормальное сообщение
// (T10.4), и пузырь тогда состоит из одного превью.
const ChatBubble = ({
  text,
  attachments,
}: {
  text: string
  attachments?: ChatAttachment[]
}) => (
  <div className="flex w-full justify-end" data-testid="chat-bubble-user">
    <div className="max-w-[85%] rounded-bubble rounded-br-base bg-accent-container px-4 py-3">
      {attachments && attachments.length > 0 && (
        <MessageAttachments attachments={attachments} />
      )}
      {text && (
        <div className={attachments?.length ? "mt-2" : undefined}>
          <MessageContent text={text} />
        </div>
      )}
    </div>
  </div>
)

export default ChatBubble
