import { MedusaContainer } from "@medusajs/framework/types"

// Unit: оркестратор при исчерпании лимита tool-use хопов делает ФИНАЛЬНЫЙ проход
// без инструментов и всё равно отдаёт текст (а не аварийный фолбэк). Регрессия на
// баг 2026-07-24 (валидный диалог → «Не удалось подобрать ответ»). Gemini замокан,
// контейнер не используется (вызовы идут на неизвестный инструмент → functionResponse.error).

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
      throw new Error("container must not be used with an unknown tool")
    },
  }
) as unknown as MedusaContainer

describe("assistant orchestrator — tool-hop exhaustion", () => {
  beforeEach(() => mockGen.mockReset())

  it("returns text from a final tool-less pass when hops are exhausted", async () => {
    // С инструментами модель ВСЕГДА зовёт инструмент (зацикливание); без
    // инструментов (финальный проход) — отдаёт текст.
    mockGen.mockImplementation(async (body: { tools?: unknown[] }) => {
      if (!body.tools) {
        return {
          parts: [{ text: "Готовый текстовый ответ." }],
          text: "Готовый текстовый ответ.",
          functionCalls: [],
        }
      }
      return {
        parts: [{ functionCall: { name: "noop", args: {} } }],
        text: "",
        functionCalls: [{ name: "noop", args: {} }],
      }
    })

    const result = await runAssistantTurn(trapContainer, [
      { role: "user", content: "нарастить стену гипсокартоном 5 см" },
    ])

    expect(result.reply).toEqual("Готовый текстовый ответ.")
    // Последний вызов — без инструментов (форсируем текст).
    const lastCall = mockGen.mock.calls[mockGen.mock.calls.length - 1][0]
    expect(lastCall.tools).toBeUndefined()
    // Ответ дописан в историю ролью assistant.
    expect(result.messages[result.messages.length - 1]).toEqual({
      role: "assistant",
      content: "Готовый текстовый ответ.",
    })
  })

  it("returns text directly when the model answers without tool calls", async () => {
    mockGen.mockResolvedValue({
      parts: [{ text: "Прямой ответ." }],
      text: "Прямой ответ.",
      functionCalls: [],
    })

    const result = await runAssistantTurn(trapContainer, [
      { role: "user", content: "привет" },
    ])

    expect(result.reply).toEqual("Прямой ответ.")
    expect(mockGen).toHaveBeenCalledTimes(1)
  })
})
