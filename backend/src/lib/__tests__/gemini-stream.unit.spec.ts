import { geminiStream } from "../gemini"

// Unit: разбор SSE-потока Gemini (T10.1d). Проверяем ровно то, что делает
// транспорт: режет поток на события, склеивает текстовые части в одну (в историю
// диалога ход должен уйти так же, как его вернул бы обычный generateContent),
// отдаёт дельты по мере поступления и вытаскивает вызовы инструментов. Сеть
// замокана: fetch подменён потоком заранее заданных кусков — в том числе
// разрезанных ПОСЕРЕДИНЕ события, чтобы проверить буферизацию.

const encoder = new TextEncoder()

const fetchReturning = (chunks: string[]) =>
  jest.fn().mockResolvedValue({
    ok: true,
    body: {
      getReader: () => {
        let i = 0
        return {
          read: async () =>
            i < chunks.length
              ? { done: false, value: encoder.encode(chunks[i++]) }
              : { done: true, value: undefined },
        }
      },
    },
  })

const dataEvent = (payload: unknown) =>
  `data: ${JSON.stringify(payload)}\n\n`

const textChunk = (text: string) =>
  dataEvent({ candidates: [{ content: { parts: [{ text }] } }] })

describe("geminiStream", () => {
  const originalFetch = global.fetch
  const originalKey = process.env.GEMINI_API_KEY

  beforeAll(() => {
    process.env.GEMINI_API_KEY = "test-key"
  })

  afterAll(() => {
    global.fetch = originalFetch
    process.env.GEMINI_API_KEY = originalKey
  })

  it("emits text deltas in order and returns them glued into one part", async () => {
    // Второе событие разрезано между кусками потока — буфер должен его собрать.
    const second = textChunk(" 25 кг")
    global.fetch = fetchReturning([
      textChunk("Нашёл цемент"),
      second.slice(0, 20),
      second.slice(20),
      textChunk(".") + textChunk(" Добавить в корзину?"),
    ]) as unknown as typeof fetch

    const deltas: string[] = []
    const candidate = await geminiStream(
      { contents: [{ role: "user", parts: [{ text: "цемент" }] }] },
      { onText: (delta) => deltas.push(delta) }
    )

    expect(deltas).toEqual([
      "Нашёл цемент",
      " 25 кг",
      ".",
      " Добавить в корзину?",
    ])
    expect(candidate.text).toEqual("Нашёл цемент 25 кг. Добавить в корзину?")
    // Склейка: одна текстовая часть, а не четыре.
    expect(candidate.parts).toEqual([
      { text: "Нашёл цемент 25 кг. Добавить в корзину?" },
    ])
    expect(candidate.functionCalls).toEqual([])
  })

  it("keeps the thought signature of a merged text part and parses tool calls", async () => {
    global.fetch = fetchReturning([
      dataEvent({
        candidates: [
          { content: { parts: [{ text: "Сейчас поищу", thoughtSignature: "sig" }] } },
        ],
      }),
      textChunk("…"),
      dataEvent({
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    name: "search_products",
                    args: { query: "цемент" },
                  },
                },
              ],
            },
          },
        ],
      }),
    ]) as unknown as typeof fetch

    const candidate = await geminiStream({
      contents: [{ role: "user", parts: [{ text: "цемент" }] }],
    })

    expect(candidate.parts).toEqual([
      { text: "Сейчас поищу…", thoughtSignature: "sig" },
      { functionCall: { name: "search_products", args: { query: "цемент" } } },
    ])
    expect(candidate.functionCalls).toEqual([
      { name: "search_products", args: { query: "цемент" } },
    ])
  })

  it("survives a broken event and the SSE keep-alive comment", async () => {
    global.fetch = fetchReturning([
      ": keep-alive\n\n",
      "data: {not json\n\n",
      textChunk("Готово."),
      "data: [DONE]\n\n",
    ]) as unknown as typeof fetch

    const candidate = await geminiStream({
      contents: [{ role: "user", parts: [{ text: "привет" }] }],
    })

    expect(candidate.text).toEqual("Готово.")
  })
})
