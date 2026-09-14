import { MedusaContainer } from "@medusajs/framework/types"

// Unit: потоковый ход оркестратора (T10.1d). Проверяем контракт с клиентом:
// текст уходит дельтами, преамбула перед вызовом инструмента СБРАСЫВАЕТСЯ
// (в ответ она не попадает), «Стоп» отдаёт ровно то, что покупатель успел
// увидеть, а исполненные инструменты не откатываются. Gemini замокан.

jest.mock("../../gemini", () => {
  const actual = jest.requireActual("../../gemini")
  return { ...actual, geminiGenerate: jest.fn(), geminiStream: jest.fn() }
})

// Инструмент, создающий корзину: нужен, чтобы проверить досылку токенов
// событием `state` (реального контейнера в unit-тесте нет).
jest.mock("../tools/registry", () => {
  const actual = jest.requireActual("../tools/registry")
  return {
    ...actual,
    findAssistantTool: (name: string) =>
      name === "add_to_cart"
        ? {
            declaration: { name, description: "", parameters: {} },
            execute: async (
              _container: unknown,
              _args: unknown,
              context: { cartId?: string }
            ) => {
              context.cartId = "cart_new"
              return { ok: true }
            },
          }
        : actual.findAssistantTool(name),
  }
})

import { geminiGenerate, geminiStream } from "../../gemini"
import { runAssistantTurn } from "../orchestrator"

const mockGen = geminiGenerate as unknown as jest.Mock
const mockStream = geminiStream as unknown as jest.Mock

const trapContainer = new Proxy(
  {},
  {
    get() {
      throw new Error("container must not be used with an unknown tool")
    },
  }
) as unknown as MedusaContainer

// Поток, который «печатает» переданные фрагменты и заканчивается частями хода.
const streamed = (
  chunks: string[],
  extra: { functionCalls?: { name: string; args: Record<string, unknown> }[] } = {}
) =>
  async (
    _body: unknown,
    options: { onText?: (delta: string) => void }
  ) => {
    for (const chunk of chunks) {
      options.onText?.(chunk)
    }
    const text = chunks.join("")
    const functionCalls = extra.functionCalls ?? []
    return {
      parts: [
        ...(text ? [{ text }] : []),
        ...functionCalls.map((functionCall) => ({ functionCall })),
      ],
      text,
      functionCalls,
    }
  }

describe("assistant orchestrator — streaming turn", () => {
  beforeEach(() => {
    mockGen.mockReset()
    mockStream.mockReset()
  })

  it("streams the answer in deltas and returns it as the reply", async () => {
    mockStream.mockImplementation(streamed(["Нашёл цемент", " М400."]))

    const deltas: string[] = []
    let resets = 0
    const result = await runAssistantTurn(
      trapContainer,
      [{ role: "user", content: "нужен цемент" }],
      {},
      {
        onTextDelta: (delta) => deltas.push(delta),
        onTextReset: () => resets++,
        onState: () => undefined,
      }
    )

    expect(deltas).toEqual(["Нашёл цемент", " М400."])
    expect(resets).toEqual(0)
    expect(result.reply).toEqual("Нашёл цемент М400.")
    expect(result.aborted).toBeUndefined()
    // Обычный (непотоковый) вызов при стриминге не используется.
    expect(mockGen).not.toHaveBeenCalled()
  })

  it("resets printed text when the model wrote a preamble before a tool call", async () => {
    mockStream
      .mockImplementationOnce(
        streamed(["Сейчас поищу…"], {
          functionCalls: [{ name: "noop", args: {} }],
        })
      )
      .mockImplementationOnce(streamed(["Готово: цемент М400."]))

    const deltas: string[] = []
    const order: string[] = []
    const result = await runAssistantTurn(
      trapContainer,
      [{ role: "user", content: "нужен цемент" }],
      {},
      {
        onTextDelta: (delta) => {
          deltas.push(delta)
          order.push("delta")
        },
        onTextReset: () => order.push("reset"),
        onState: () => undefined,
      }
    )

    // Преамбула напечаталась, затем сброс, затем настоящий ответ.
    expect(order).toEqual(["delta", "reset", "delta"])
    expect(deltas).toEqual(["Сейчас поищу…", "Готово: цемент М400."])
    // В ответ уходит только текст ПОСЛЕ инструментов.
    expect(result.reply).toEqual("Готово: цемент М400.")
  })

  it("stops on abort and keeps exactly what the buyer already saw", async () => {
    const abort = new AbortController()
    mockStream.mockImplementation(
      async (
        _body: unknown,
        options: { onText?: (delta: string) => void }
      ) => {
        options.onText?.("Подбираю материалы")
        // Покупатель нажал «Стоп»: клиент оборвал соединение, fetch упал.
        abort.abort()
        throw new Error("The operation was aborted")
      }
    )

    const deltas: string[] = []
    const result = await runAssistantTurn(
      trapContainer,
      [{ role: "user", content: "смета на фундамент" }],
      {},
      {
        onTextDelta: (delta) => deltas.push(delta),
        onTextReset: () => undefined,
        onState: () => undefined,
        signal: abort.signal,
      }
    )

    expect(result.aborted).toEqual(true)
    expect(result.reply).toEqual("Подбираю материалы")
    expect(result.messages).toEqual([
      { role: "user", content: "смета на фундамент" },
      { role: "assistant", content: "Подбираю материалы" },
    ])
    // Аварийные фолбэки к оборванному ходу не применяются.
    expect(deltas).toEqual(["Подбираю материалы"])
  })

  it("returns history unchanged when the turn is aborted before any text", async () => {
    const abort = new AbortController()
    abort.abort()
    mockStream.mockImplementation(streamed(["не должно вызваться"]))

    const result = await runAssistantTurn(
      trapContainer,
      [{ role: "user", content: "привет" }],
      {},
      {
        onTextDelta: () => undefined,
        onTextReset: () => undefined,
        onState: () => undefined,
        signal: abort.signal,
      }
    )

    expect(result.aborted).toEqual(true)
    expect(result.reply).toEqual("")
    expect(result.messages).toEqual([{ role: "user", content: "привет" }])
    expect(mockStream).not.toHaveBeenCalled()
  })

  it("publishes session tokens as soon as a tool creates the cart", async () => {
    mockStream
      .mockImplementationOnce(
        streamed([], {
          functionCalls: [
            { name: "add_to_cart", args: { variant_id: "v1", quantity: 10 } },
          ],
        })
      )
      .mockImplementationOnce(streamed(["Добавил 10 мешков."]))

    const states: { cartId?: string; orderId?: string }[] = []
    const result = await runAssistantTurn(
      trapContainer,
      [{ role: "user", content: "10 мешков цемента в корзину" }],
      {},
      {
        onTextDelta: () => undefined,
        onTextReset: () => undefined,
        onState: (tokens) => states.push(tokens),
      }
    )

    // Токен корзины ушёл клиенту СРАЗУ после инструмента — до того, как ход
    // закончился (иначе «Стоп» посреди хода потерял бы корзину).
    expect(states).toEqual([{ cartId: "cart_new", orderId: undefined }])
    expect(result.cartId).toEqual("cart_new")
  })

  it("streams the fallback text when the model produced no answer", async () => {
    mockStream.mockImplementation(streamed([]))

    const deltas: string[] = []
    let resets = 0
    const result = await runAssistantTurn(
      trapContainer,
      [{ role: "user", content: "?" }],
      {},
      {
        onTextDelta: (delta) => deltas.push(delta),
        onTextReset: () => resets++,
        onState: () => undefined,
      }
    )

    expect(result.reply).toEqual(
      "Не удалось подобрать ответ. Уточните, какой материал вы ищете."
    )
    // Фолбэк покупатель ещё не видел — досылаем его дельтой после сброса.
    expect(resets).toEqual(1)
    expect(deltas).toEqual([result.reply])
  })
})
