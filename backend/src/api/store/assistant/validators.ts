import { z } from "@medusajs/framework/zod"
import {
  MAX_FILE_BASE64_CHARS,
  MAX_FILES_PER_TURN,
} from "../../../lib/assistant/file-input"
import {
  MAX_VOICE_BASE64_CHARS,
  MAX_VOICE_DURATION_MS,
} from "../../../lib/assistant/speech"

// Тело POST /store/assistant/chat — история диалога с ассистентом покупателя.
// Stateless: клиент присылает всю переписку целиком. Последнее сообщение обязано
// быть от покупателя (user) — это то, на что ассистент отвечает.
// `cart_id` — id корзины, которую клиент держит между ходами (её создал инструмент
// add_to_cart на предыдущем ходе и вернул в ответе). Необязателен: до первого
// добавления товара корзины ещё нет.
// `files` — вложения ЭТОГО хода (T10.4): фото списка от прораба, фото объекта,
// PDF. Содержимым (base64), как голосовая запись, — своего файлового хранилища
// у чата нет и не заводим: вложение уходит в модель и живёт до конца запроса.
// Относятся они к ПОСЛЕДНЕЙ реплике и между ходами не тянутся (в ответе их нет,
// клиент их обратно не шлёт) — иначе каждый следующий ход тащил бы мегабайты
// картинки заново. Поэтому же текст последней реплики может быть ПУСТЫМ: снимок
// без подписи — нормальное сообщение, а придумывать подпись за покупателя нечестно.
export const StoreAssistantChat = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().max(4000),
        })
      )
      .min(1)
      .max(50),
    cart_id: z.string().trim().min(1).optional(),
    // id последнего оформленного заказа — клиент держит его как cart_id (его вернул
    // place_order) и шлёт обратно, чтобы ассистент отслеживал статус (track_order).
    order_id: z.string().trim().min(1).optional(),
    files: z
      .array(
        z.object({
          mime_type: z.string().trim().min(1).max(128),
          data: z.string().min(1).max(MAX_FILE_BASE64_CHARS),
          // Имя файла — только для показа в ленте («смета.pdf»); модели не уходит.
          name: z.string().trim().min(1).max(200).optional(),
        })
      )
      .min(1)
      .max(MAX_FILES_PER_TURN)
      .optional(),
  })
  .refine((body) => body.messages[body.messages.length - 1]?.role === "user", {
    message: "The last message must be from the user",
  })
  .refine(
    (body) =>
      body.messages
        .slice(0, -1)
        // Пустой может быть только ПРОШЛАЯ реплика покупателя: это снимок без
        // подписи с прошлого хода (файл к ней уже не прикладывается — вложение
        // живёт ровно один ход). Ответ ассистента пустым не бывает никогда.
        .every((m) => m.role === "user" || m.content.length > 0),
    { message: "Message content must not be empty" }
  )
  .refine(
    (body) =>
      (body.messages[body.messages.length - 1]?.content.length ?? 0) > 0 ||
      (body.files?.length ?? 0) > 0,
    { message: "The last message must have text or an attachment" }
  )
export type StoreAssistantChatType = z.infer<typeof StoreAssistantChat>

// Тело POST /store/assistant/cart/items — счётчики «−/+» на карточках подбора
// (T10.15). Количество АБСОЛЮТНОЕ (сколько должно стать), а не приращение:
// нажатия схлопываются дебаунсом и повторяются после обрыва, поэтому запрос
// обязан быть идемпотентным. `quantity: 0` = убрать позицию совсем.
// `cart_id` необязателен: первое «+» гостя корзину создаёт (как add_to_cart).
export const StoreAssistantCartItems = z.object({
  cart_id: z.string().trim().min(1).optional(),
  items: z
    .array(
      z.object({
        variant_id: z.string().trim().min(1),
        quantity: z.number().int().min(0).max(100000),
      })
    )
    .min(1)
    .max(50),
})
export type StoreAssistantCartItemsType = z.infer<
  typeof StoreAssistantCartItems
>

// Тело POST /store/assistant/transcribe — голосовое сообщение покупателя (T10.2).
// `mime_type` принимаем как его отдал рекордер, с параметрами («audio/webm;
// codecs=opus»): перечень поддерживаемых контейнеров живёт в одном месте —
// lib/assistant/speech.ts, там же и нормализация. Размер тела ограничен пределом
// записи (8 МБ в base64-символах), длительность присылает клиент — внутри
// контейнера opus/aac её без декодера не прочитать.
export const StoreAssistantTranscribe = z.object({
  mime_type: z.string().trim().min(1).max(128),
  data: z.string().min(1).max(MAX_VOICE_BASE64_CHARS),
  duration_ms: z
    .number()
    .int()
    .positive()
    .max(MAX_VOICE_DURATION_MS)
    .optional(),
})
export type StoreAssistantTranscribeType = z.infer<
  typeof StoreAssistantTranscribe
>
