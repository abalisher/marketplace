// Разбор ответа ассистента на блоки для ленты чата. Модель размечает ответы
// подмножеством markdown: списки дефисом/звёздочкой/цифрой и инлайн-`**жирный**`.
// До T3.11 пузырь печатал текст как есть, и перечисления выглядели голыми
// дефисами в столбик (прогон 2026-08-13). Полноценный markdown НЕ поддерживаем:
// заголовки, таблицы и ссылки в ответах не встречаются, а лишняя библиотека в
// тонком клиенте не нужна — инлайн-жирный по-прежнему рисует сам пузырь.
export type AssistantBlock =
  | { kind: "text"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }

// Маркер списка: «- », «* », «• ». Пробел после маркера обязателен, поэтому
// строка «**Цемент** — 40 мешков» списком не считается.
const BULLET_LINE = /^ {0,3}[-*•][ \t]+(.*)$/
// Нумерованный пункт: «1. », «2) ».
const ORDERED_LINE = /^ {0,3}\d{1,2}[.)][ \t]+(.*)$/

const trimBlankEdges = (text: string) => text.replace(/^\n+|\n+$/g, "")

export const parseAssistantBlocks = (content: string): AssistantBlock[] => {
  const blocks: AssistantBlock[] = []
  let textLines: string[] = []
  let listOrdered = false
  let listItems: string[] = []

  const flushText = () => {
    const text = trimBlankEdges(textLines.join("\n"))
    textLines = []
    if (text.length) {
      blocks.push({ kind: "text", text })
    }
  }

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ kind: "list", ordered: listOrdered, items: listItems })
      listItems = []
    }
  }

  for (const line of content.split(/\r?\n/)) {
    const bullet = BULLET_LINE.exec(line)
    const ordered = bullet ? null : ORDERED_LINE.exec(line)

    if (bullet || ordered) {
      flushText()
      const isOrdered = !!ordered
      if (listItems.length && listOrdered !== isOrdered) {
        flushList()
      }
      listOrdered = isOrdered
      listItems.push((bullet ?? ordered)![1].trim())
      continue
    }

    // Пустая строка закрывает список, но пустым текстовым блоком не становится.
    if (!line.trim() && listItems.length) {
      flushList()
      continue
    }

    flushList()
    textLines.push(line)
  }

  flushText()
  flushList()

  return blocks
}
