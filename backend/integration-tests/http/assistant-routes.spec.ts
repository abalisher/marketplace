import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import {
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
} from "@medusajs/medusa/core-flows"

jest.setTimeout(120000)

// HTTP-роут разговорного ассистента покупателя (пивот №3, срез 1):
// POST /store/assistant/chat. Гость допускается. Тест покрывает валидацию тела
// (до вызова ИИ) и путь «ИИ не сконфигурирована» (без ключа Gemini — понятная
// ошибка, не 500). Живой tool-use loop против Gemini — вне CI (нужны ключ+сеть),
// проверяется src/scripts/smoke-assistant.ts. Требует docker-postgres.
// T10.1d: тот же ход в потоковом варианте — POST /store/assistant/chat/stream
// (SSE). Здесь проверяются валидация тела и формат потока на пути «ИИ не
// сконфигурирована»: поток ОТКРЫВАЕТСЯ (200 + `event: open`) и уже внутри него
// приходит `event: error` — по этому контракту клиент не откатывается на
// обычный POST после открытия потока.
// T10.4: вложения — фото и PDF приезжают ходом ассистента в поле files тела
// /store/assistant/chat (и того же потокового роута). Здесь проверяются пределы
// приёма (тип, размер, число файлов) и то, что годное вложение ДОХОДИТ до модели;
// разбор фото живой моделью — гейты U/Ф подзадач T10.4b и T10.4c.
// T10.2: голосовой ввод — POST /store/assistant/transcribe (аудио → текст, БЕЗ хода
// ассистента). Здесь проверяются пределы записи и то, что валидная запись доходит до
// модели; живая расшифровка — src/scripts/smoke-stt.ts, качество распознавания по
// языкам — прогон T10.5.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let storeHeaders: Record<string, string>
    let variantId: string

    const call = async (promise: Promise<any>) =>
      promise.then(
        (res) => res,
        (err) => {
          if (!err.response) {
            throw err
          }
          return err.response
        }
      )

    beforeAll(async () => {
      container = getContainer()
      const link = container.resolve(ContainerRegistrationKeys.LINK)

      // Канал + publishable key (store-роуты требуют ключ; фикстура минимальна —
      // поиск товаров проверяется в live-smoke, здесь только валидация/конфиг).
      const { result: channels } = await createSalesChannelsWorkflow(
        container
      ).run({ input: { salesChannelsData: [{ name: "Assistant Channel" }] } })
      const apiKeyService = container.resolve(Modules.API_KEY)
      const [pk] = await apiKeyService.createApiKeys([
        { title: "assistant", type: "publishable", created_by: "test" },
      ])
      await link.create({
        [Modules.API_KEY]: { publishable_key_id: pk.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: channels[0].id },
      })
      storeHeaders = { "x-publishable-api-key": pk.token }

      // Фикстура для счётчиков «−/+» (T10.15): регион в тенге и опубликованный
      // товар с ценой. Корзину роут создаёт сам — как это делает add_to_cart.
      await createRegionsWorkflow(container).run({
        input: {
          regions: [
            { name: "KZ", currency_code: "kzt", countries: ["kz"] },
          ],
        },
      })
      const { result: products } = await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: "Пескобетон М300",
              status: ProductStatus.PUBLISHED,
              sales_channels: [{ id: channels[0].id }],
              options: [{ title: "Фасовка", values: ["40 кг"] }],
              variants: [
                {
                  title: "40 кг",
                  sku: "ASSIST-PSB-40",
                  manage_inventory: false,
                  options: { Фасовка: "40 кг" },
                  prices: [{ amount: 1490, currency_code: "kzt" }],
                },
              ],
            },
          ],
        },
      })
      variantId = products[0].variants[0].id
    })

    it("rejects an empty message list — 400", async () => {
      const res = await call(
        api.post("/store/assistant/chat", { messages: [] }, { headers: storeHeaders })
      )
      expect(res.status).toEqual(400)
    })

    it("rejects when the last message is not from the user — 400", async () => {
      const res = await call(
        api.post(
          "/store/assistant/chat",
          {
            messages: [
              { role: "user", content: "цемент" },
              { role: "assistant", content: "Вот варианты…" },
            ],
          },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })

    it("rejects an over-long message content — 400", async () => {
      const res = await call(
        api.post(
          "/store/assistant/chat",
          { messages: [{ role: "user", content: "a".repeat(4001) }] },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })

    it("rejects a non-string cart_id — 400 (validation before AI)", async () => {
      const res = await call(
        api.post(
          "/store/assistant/chat",
          {
            messages: [{ role: "user", content: "цемент" }],
            cart_id: 123,
          },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })

    it("rejects a non-string order_id — 400 (validation before AI)", async () => {
      const res = await call(
        api.post(
          "/store/assistant/chat",
          {
            messages: [{ role: "user", content: "где мой заказ" }],
            order_id: 456,
          },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })

    it("rejects an empty message list on the stream route — 400", async () => {
      const res = await call(
        api.post(
          "/store/assistant/chat/stream",
          { messages: [] },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })

    it("opens the SSE stream and reports a config error inside it", async () => {
      const savedGemini = process.env.GEMINI_API_KEY
      const savedGoogle = process.env.GOOGLE_API_KEY
      delete process.env.GEMINI_API_KEY
      delete process.env.GOOGLE_API_KEY
      try {
        const res = await call(
          api.post(
            "/store/assistant/chat/stream",
            { messages: [{ role: "user", content: "нужен цемент" }] },
            { headers: storeHeaders, responseType: "text" }
          )
        )
        expect(res.status).toEqual(200)
        expect(String(res.headers["content-type"])).toContain(
          "text/event-stream"
        )
        const body = String(res.data)
        // Поток открыт (клиент понял, что стриминг есть) и ошибка пришла событием.
        expect(body).toContain("event: open")
        expect(body).toContain("event: error")
        expect(body).toContain("AI is not configured")
      } finally {
        if (savedGemini !== undefined) {
          process.env.GEMINI_API_KEY = savedGemini
        }
        if (savedGoogle !== undefined) {
          process.env.GOOGLE_API_KEY = savedGoogle
        }
      }
    })

    // --- Счётчики «−/+» на карточках подбора (T10.15) ---
    // Покупатель кладёт товар в корзину сам, без хода модели. Количество
    // АБСОЛЮТНОЕ, поэтому запрос идемпотентен — это и проверяем.

    it("rejects an empty item list — 400", async () => {
      const res = await call(
        api.post(
          "/store/assistant/cart/items",
          { items: [] },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })

    it("rejects a fractional quantity — 400", async () => {
      // Кнопки шлют только целые: дробное — сломанный клиент, а не повод
      // молча округлить (деньги).
      const res = await call(
        api.post(
          "/store/assistant/cart/items",
          { items: [{ variant_id: "var_1", quantity: 0.5 }] },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })

    it("rejects a negative quantity — 400", async () => {
      const res = await call(
        api.post(
          "/store/assistant/cart/items",
          { items: [{ variant_id: "var_1", quantity: -1 }] },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })

    it("returns 404 for an unknown cart", async () => {
      const res = await call(
        api.post(
          "/store/assistant/cart/items",
          {
            cart_id: "cart_does_not_exist",
            items: [{ variant_id: "var_1", quantity: 1 }],
          },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(404)
    })

    it("zero quantity without a cart does not create one", async () => {
      const res = await call(
        api.post(
          "/store/assistant/cart/items",
          { items: [{ variant_id: "var_1", quantity: 0 }] },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(200)
      expect(res.data.cart_id).toBeNull()
      expect(res.data.cart.items).toEqual([])
    })

    it("creates the cart on the first plus and applies absolute quantities", async () => {
      // Первое «+» гостя заводит корзину (как add_to_cart) …
      const created = await call(
        api.post(
          "/store/assistant/cart/items",
          { items: [{ variant_id: variantId, quantity: 3 }] },
          { headers: storeHeaders }
        )
      )
      expect(created.status).toEqual(200)
      const cartId = created.data.cart_id
      expect(typeof cartId).toEqual("string")
      expect(created.data.cart.items).toHaveLength(1)
      expect(created.data.cart.items[0].quantity).toEqual(3)
      expect(created.data.cart.item_count).toEqual(3)

      // … повтор с тем же вариантом ВЫСТАВЛЯЕТ количество, а не прибавляет:
      // серия нажатий схлопывается дебаунсом, повтор после обрыва безопасен.
      const updated = await call(
        api.post(
          "/store/assistant/cart/items",
          { cart_id: cartId, items: [{ variant_id: variantId, quantity: 5 }] },
          { headers: storeHeaders }
        )
      )
      expect(updated.status).toEqual(200)
      expect(updated.data.cart_id).toEqual(cartId)
      expect(updated.data.cart.items).toHaveLength(1)
      expect(updated.data.cart.items[0].quantity).toEqual(5)
      expect(updated.data.cart.total).toEqual(5 * 1490)

      // Полоса корзины перечитывает состав отдельно — после хода модели у
      // клиента есть только cart_id.
      const read = await call(
        api.get(`/store/assistant/cart?cart_id=${cartId}`, {
          headers: storeHeaders,
        })
      )
      expect(read.status).toEqual(200)
      expect(read.data.cart.items[0].quantity).toEqual(5)

      // Ноль убирает позицию совсем («−» на единице).
      const cleared = await call(
        api.post(
          "/store/assistant/cart/items",
          { cart_id: cartId, items: [{ variant_id: variantId, quantity: 0 }] },
          { headers: storeHeaders }
        )
      )
      expect(cleared.status).toEqual(200)
      expect(cleared.data.cart.items).toEqual([])
      expect(cleared.data.cart.total).toEqual(0)
    })

    it("returns a clear error when AI is not configured (no Gemini key)", async () => {
      // Гарантируем путь «не сконфигурирована» детерминированно: снимаем ключи из
      // окружения процесса (приложение крутится в этом же процессе).
      const savedGemini = process.env.GEMINI_API_KEY
      const savedGoogle = process.env.GOOGLE_API_KEY
      delete process.env.GEMINI_API_KEY
      delete process.env.GOOGLE_API_KEY
      try {
        const res = await call(
          api.post(
            "/store/assistant/chat",
            { messages: [{ role: "user", content: "нужен цемент" }] },
            { headers: storeHeaders }
          )
        )
        // Понятная ошибка конфигурации, не 500.
        expect(res.status).toEqual(400)
        expect(String(res.data?.message ?? "")).toContain("AI is not configured")
      } finally {
        if (savedGemini !== undefined) {
          process.env.GEMINI_API_KEY = savedGemini
        }
        if (savedGoogle !== undefined) {
          process.env.GOOGLE_API_KEY = savedGoogle
        }
      }
    })

    // --- Голосовой ввод: POST /store/assistant/transcribe (T10.2) ---
    // Роут возвращает только расшифровку (ход ассистента делает /chat отдельным
    // обычным сообщением — решение T11.4). В CI ключа Gemini нет, поэтому здесь
    // проверяются пределы записи и то, что валидная запись ДОХОДИТ до модели
    // (ответ «AI is not configured» = контейнер принят, тело разобрано). Качество
    // распознавания по языкам — прогон T10.5, живой вызов — smoke-stt.

    // Записи: содержимое произвольное — сервер аудио не декодирует, важен
    // контейнер и то, что тело доехало целиком.
    const ruVoice = Buffer.from("ru-voice-cement-40-bags").toString("base64")
    const kkVoice = Buffer.from("kk-voice-20-qap-cement").toString("base64")

    // Путь «ИИ не сконфигурирована» детерминированно: снимаем ключи из окружения
    // процесса (приложение крутится в этом же процессе).
    const withoutAiKeys = async (fn: () => Promise<void>) => {
      const savedGemini = process.env.GEMINI_API_KEY
      const savedGoogle = process.env.GOOGLE_API_KEY
      delete process.env.GEMINI_API_KEY
      delete process.env.GOOGLE_API_KEY
      try {
        await fn()
      } finally {
        if (savedGemini !== undefined) {
          process.env.GEMINI_API_KEY = savedGemini
        }
        if (savedGoogle !== undefined) {
          process.env.GOOGLE_API_KEY = savedGoogle
        }
      }
    }

    it("accepts a russian recording as the browser records it (webm/opus)", async () => {
      await withoutAiKeys(async () => {
        const res = await call(
          api.post(
            "/store/assistant/transcribe",
            {
              mime_type: "audio/webm;codecs=opus",
              data: ruVoice,
              duration_ms: 4200,
            },
            { headers: storeHeaders }
          )
        )
        // Гость допущен, контейнер принят, тело разобрано — дальше нужен ключ.
        expect(res.status).toEqual(400)
        expect(String(res.data?.message ?? "")).toContain("AI is not configured")
      })
    })

    it("accepts a kazakh recording as the phone records it (m4a/aac)", async () => {
      await withoutAiKeys(async () => {
        const res = await call(
          api.post(
            "/store/assistant/transcribe",
            { mime_type: "audio/x-m4a", data: kkVoice, duration_ms: 7800 },
            { headers: storeHeaders }
          )
        )
        expect(res.status).toEqual(400)
        expect(String(res.data?.message ?? "")).toContain("AI is not configured")
      })
    })

    it("rejects a non-audio container — 400", async () => {
      const res = await call(
        api.post(
          "/store/assistant/transcribe",
          { mime_type: "image/png", data: ruVoice },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
      expect(String(res.data?.message ?? "")).toContain("Unsupported audio format")
    })

    it("rejects a recording longer than a minute — 400", async () => {
      const res = await call(
        api.post(
          "/store/assistant/transcribe",
          { mime_type: "audio/webm", data: ruVoice, duration_ms: 61_000 },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })

    it("rejects an empty payload and a payload over the size limit — 400", async () => {
      const empty = await call(
        api.post(
          "/store/assistant/transcribe",
          { mime_type: "audio/webm", data: "" },
          { headers: storeHeaders }
        )
      )
      expect(empty.status).toEqual(400)

      // 8 МБ записи = предел; чуть больше — отказ ещё в валидаторе тела.
      const oversized = await call(
        api.post(
          "/store/assistant/transcribe",
          {
            mime_type: "audio/webm",
            data: "A".repeat(Math.ceil((8 * 1024 * 1024) / 3) * 4 + 4),
          },
          { headers: storeHeaders }
        )
      )
      expect(oversized.status).toEqual(400)
    })

    // --- Вложения покупателя: files в теле /store/assistant/chat (T10.4) ---
    // Файл нигде не сохраняется: приезжает телом, уходит в модель, живёт до конца
    // запроса. В CI ключа Gemini нет, поэтому «AI is not configured» здесь = тело
    // разобрано, вложение принято и доехало до вызова модели.

    // Содержимое произвольное — сервер картинку не декодирует, важен тип и то,
    // что тело доехало целиком.
    const photo = Buffer.from("photo-of-a-handwritten-list").toString("base64")

    it("accepts a photo of the list sent with the message", async () => {
      await withoutAiKeys(async () => {
        const res = await call(
          api.post(
            "/store/assistant/chat",
            {
              messages: [{ role: "user", content: "вот список от прораба" }],
              files: [
                { mime_type: "image/jpeg", data: photo, name: "IMG_0431.jpg" },
              ],
            },
            { headers: storeHeaders }
          )
        )
        expect(res.status).toEqual(400)
        expect(String(res.data?.message ?? "")).toContain("AI is not configured")
      })
    })

    it("accepts a photo sent without any caption", async () => {
      await withoutAiKeys(async () => {
        const res = await call(
          api.post(
            "/store/assistant/chat",
            {
              messages: [{ role: "user", content: "" }],
              files: [{ mime_type: "image/heic", data: photo }],
            },
            { headers: storeHeaders }
          )
        )
        // Снимок без подписи — нормальное сообщение: пустой текст пропускается
        // ровно потому, что к реплике приложен файл.
        expect(res.status).toEqual(400)
        expect(String(res.data?.message ?? "")).toContain("AI is not configured")
      })
    })

    it("keeps talking after a caption-less photo — the next turn passes", async () => {
      // Снимок без подписи оставляет в истории пустую реплику покупателя. Ход
      // после него идёт УЖЕ БЕЗ файла (вложение живёт ровно один ход) — и не
      // должен отваливаться на валидации истории.
      await withoutAiKeys(async () => {
        const res = await call(
          api.post(
            "/store/assistant/chat",
            {
              messages: [
                { role: "user", content: "" },
                { role: "assistant", content: "Разобрал список: цемент — 20 мешков." },
                { role: "user", content: "добавь всё в корзину" },
              ],
            },
            { headers: storeHeaders }
          )
        )
        expect(res.status).toEqual(400)
        expect(String(res.data?.message ?? "")).toContain("AI is not configured")
      })
    })

    it("still rejects an empty assistant reply in the history — 400", async () => {
      const res = await call(
        api.post(
          "/store/assistant/chat",
          {
            messages: [
              { role: "user", content: "нужен цемент" },
              { role: "assistant", content: "" },
              { role: "user", content: "сколько стоит" },
            ],
          },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
      expect(String(res.data?.message ?? "")).not.toContain("AI is not configured")
    })

    it("still rejects an empty message with no attachment — 400", async () => {
      const res = await call(
        api.post(
          "/store/assistant/chat",
          { messages: [{ role: "user", content: "" }] },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })

    it("rejects a format the model cannot read as a picture — 400", async () => {
      const res = await call(
        api.post(
          "/store/assistant/chat",
          {
            messages: [{ role: "user", content: "вот видео" }],
            files: [{ mime_type: "video/mp4", data: photo }],
          },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
      expect(String(res.data?.message ?? "")).toContain(
        "Unsupported attachment format"
      )
    })

    it("refuses a spreadsheet separately — its parser is T11.1, not vision", async () => {
      const res = await call(
        api.post(
          "/store/assistant/chat",
          {
            messages: [{ role: "user", content: "смета в экселе" }],
            files: [
              {
                mime_type:
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                data: photo,
                name: "смета.xlsx",
              },
            ],
          },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
      expect(String(res.data?.message ?? "")).toContain(
        "Spreadsheets and text documents are not supported yet"
      )
    })

    it("rejects more attachments than one turn allows — 400", async () => {
      const res = await call(
        api.post(
          "/store/assistant/chat",
          {
            messages: [{ role: "user", content: "четыре страницы" }],
            files: Array.from({ length: 4 }, () => ({
              mime_type: "image/jpeg",
              data: photo,
            })),
          },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })

    it("rejects a single attachment over the size limit — 400", async () => {
      const res = await call(
        api.post(
          "/store/assistant/chat",
          {
            messages: [{ role: "user", content: "большой скан" }],
            files: [
              {
                mime_type: "application/pdf",
                data: "A".repeat(Math.ceil((8 * 1024 * 1024) / 3) * 4 + 4),
              },
            ],
          },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })

    it("refuses a bad attachment on the stream route BEFORE opening the stream", async () => {
      const res = await call(
        api.post(
          "/store/assistant/chat/stream",
          {
            messages: [{ role: "user", content: "вот таблица" }],
            files: [{ mime_type: "text/csv", data: photo, name: "смета.csv" }],
          },
          { headers: storeHeaders, responseType: "text" }
        )
      )
      // Честный 400, а не `event: error` внутри открытого потока: после `open`
      // клиент на обычный POST уже не откатывается (контракт T10.1d).
      expect(res.status).toEqual(400)
      expect(String(res.headers["content-type"])).not.toContain(
        "text/event-stream"
      )
    })
  },
})
