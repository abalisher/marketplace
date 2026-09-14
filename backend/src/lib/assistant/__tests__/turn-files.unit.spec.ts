import { MedusaContainer } from "@medusajs/framework/types"

// Unit: вложение хода (T10.4) доезжает до модели ровно там, где ему место —
// частями к ПОСЛЕДНЕЙ реплике покупателя, перед её текстом, — и не остаётся ни
// в истории диалога, ни в предыдущих репликах. Gemini замокан: проверяем тело
// запроса, а не ответ модели.

jest.mock("../../gemini", () => {
  const actual = jest.requireActual("../../gemini")
  return { ...actual, geminiGenerate: jest.fn() }
})

import { geminiGenerate } from "../../gemini"
import { runAssistantTurn } from "../orchestrator"

const mockGen = geminiGenerate as unknown as jest.Mock

const trapContainer = new Proxy(
  {},
  {
    get() {
      throw new Error("container must not be used in this test")
    },
  }
) as unknown as MedusaContainer

const answer = (text: string) => ({ parts: [{ text }], text, functionCalls: [] })

describe("assistant turn — вложения покупателя", () => {
  beforeEach(() => {
    mockGen.mockReset()
    mockGen.mockResolvedValue(answer("Разобрал список: цемент М400 — 20 мешков."))
  })

  it("puts the attachment on the last user message, before its text", async () => {
    await runAssistantTurn(
      trapContainer,
      [
        { role: "user", content: "привет" },
        { role: "assistant", content: "Здравствуйте!" },
        { role: "user", content: "вот список от прораба" },
      ],
      {
        files: [{ mimeType: "image/jpeg", data: "AAAA" }],
      }
    )

    const body = mockGen.mock.calls[0][0]
    expect(body.contents[0].parts).toEqual([{ text: "привет" }])
    expect(body.contents[1].parts).toEqual([{ text: "Здравствуйте!" }])
    // Сначала снимок, потом подпись к нему (рекомендация Gemini).
    expect(body.contents[2].parts).toEqual([
      { inlineData: { mimeType: "image/jpeg", data: "AAAA" } },
      { text: "вот список от прораба" },
    ])
  })

  it("accepts a photo sent without any caption", async () => {
    const result = await runAssistantTurn(
      trapContainer,
      [{ role: "user", content: "" }],
      { files: [{ mimeType: "application/pdf", data: "BBBB" }] }
    )

    const body = mockGen.mock.calls[0][0]
    expect(body.contents[0].parts).toEqual([
      { inlineData: { mimeType: "application/pdf", data: "BBBB" } },
    ])
    // Пустая реплика покупателя историю не ломает: ответ дописан как обычно.
    expect(result.messages[result.messages.length - 1].role).toEqual("assistant")
  })

  it("keeps the history text-only — the file lives exactly one turn", async () => {
    const result = await runAssistantTurn(
      trapContainer,
      [{ role: "user", content: "вот фото" }],
      { files: [{ mimeType: "image/png", data: "CCCC" }] }
    )

    expect(result.messages).toEqual([
      { role: "user", content: "вот фото" },
      { role: "assistant", content: "Разобрал список: цемент М400 — 20 мешков." },
    ])
    expect(JSON.stringify(result.messages)).not.toContain("CCCC")
  })

  it("sends several attachments in the order the buyer picked them", async () => {
    await runAssistantTurn(trapContainer, [{ role: "user", content: "два листа" }], {
      files: [
        { mimeType: "image/jpeg", data: "PAGE1" },
        { mimeType: "image/jpeg", data: "PAGE2" },
      ],
    })

    const parts = mockGen.mock.calls[0][0].contents[0].parts
    expect(parts).toEqual([
      { inlineData: { mimeType: "image/jpeg", data: "PAGE1" } },
      { inlineData: { mimeType: "image/jpeg", data: "PAGE2" } },
      { text: "два листа" },
    ])
  })

  it("keeps a caption-less turn askable on the NEXT turn", async () => {
    // Снимок без подписи оставляет в истории пустую реплику. Следующий ход
    // уходит уже без файла — и пустые `parts` сломали бы запрос к модели.
    await runAssistantTurn(
      trapContainer,
      [
        { role: "user", content: "" },
        { role: "assistant", content: "Разобрал список: цемент М400 — 20 мешков." },
        { role: "user", content: "добавь всё в корзину" },
      ],
      {}
    )

    const parts = mockGen.mock.calls[0][0].contents[0].parts
    expect(parts).toHaveLength(1)
    // На месте реплики — след вложения, а не пустота: модель должна понимать,
    // что фото было, но пересказать его заново ей уже не по чему.
    expect(parts[0].text).toContain("вложение")
    expect(parts[0].inlineData).toBeUndefined()
  })

  it("changes nothing for a turn without attachments", async () => {
    await runAssistantTurn(trapContainer, [{ role: "user", content: "нужен цемент" }])
    expect(mockGen.mock.calls[0][0].contents).toEqual([
      { role: "user", parts: [{ text: "нужен цемент" }] },
    ])
  })
})
