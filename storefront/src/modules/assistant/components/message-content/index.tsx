import { parseAssistantBlocks } from "@lib/util/assistant-markdown"
import { Fragment } from "react"

// Инлайн-`**жирный**` в тексте хода (модель размечает им названия и количества).
// Пустая или непарная разметка выводится литералом — так же, как в
// AppChatBubble мобилки: лучше показать звёздочки, чем съесть текст.
const spansWithBold = (text: string) => {
  // [\s\S] вместо флага `s` — target tsconfig ниже es2018.
  const parts = text.split(/\*\*([\s\S]+?)\*\*/g)

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-semibold">
        {part}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  )
}

// Текст одного хода: абзацы и markdown-списки (T3.11). Общий рендер для реплики
// покупателя (пузырь) и ответа ассистента (без пузыря) — эталон Gemini,
// бриф T10.1a раздел 3.4. Полного markdown-рендера нет и не нужно.
const MessageContent = ({ text }: { text: string }) => {
  const blocks = parseAssistantBlocks(text)

  return (
    <div className="flex flex-col gap-2 text-assistant-body text-ink">
      {blocks.map((block, index) =>
        block.kind === "list" ? (
          block.ordered ? (
            <ol
              key={index}
              className="list-decimal space-y-1 pl-5"
              data-testid="chat-bubble-list"
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{spansWithBold(item)}</li>
              ))}
            </ol>
          ) : (
            <ul
              key={index}
              className="list-disc space-y-1 pl-5"
              data-testid="chat-bubble-list"
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{spansWithBold(item)}</li>
              ))}
            </ul>
          )
        ) : (
          <p key={index} className="whitespace-pre-wrap">
            {spansWithBold(block.text)}
          </p>
        )
      )}
    </div>
  )
}

export default MessageContent
