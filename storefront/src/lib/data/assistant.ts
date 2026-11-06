"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

// Тонкий клиент разговорного ассистента покупателя (пивот №3). Вся логика
// диалога — подбор товаров, расчёт, корзина, оплата Kaspi, оформление и
// трекинг — в бэкенде (tool-use loop). Здесь типы контракта хода (их держит
// весь чат) и запись в корзину счётчиками «−/+».
//
// Сам ход диалога живёт НЕ здесь: он идёт потоком через `/api/assistant/stream`
// (assistant-stream.ts), а откат — через `/api/assistant/chat`
// (assistant-post.ts). Server action'ом ход не сделать: с вложением (T10.4)
// тело доходит до 12 МБ, а у действий Next предел 1 МБ.

export type AssistantRole = "user" | "assistant"

export type AssistantMessage = {
  role: AssistantRole
  content: string
}

// Вложение хода (T10.4): фото списка от прораба, скрин сметы, PDF. Уходит
// СОДЕРЖИМЫМ (base64), как голосовая запись: файлового хранилища у чата нет.
// Относится к последней реплике и живёт ровно один ход — в ответе вложений нет,
// обратно клиент их не шлёт.
export type AssistantChatFile = {
  mime_type: string
  data: string
  // Имя файла — только для показа в ленте; модели оно не уходит.
  name?: string
}

export type AssistantChatRequest = {
  messages: AssistantMessage[]
  cart_id?: string
  order_id?: string
  files?: AssistantChatFile[]
}

// Read-only вставки хода (контракт: StoreAssistantAttachment, oneOf по `type`).
// Данные для отрисовки, НЕ команды: кнопок в ленте нет (DECISIONS 2026-07-24).
// Карточек подбора (`product_card`) бэкенд больше не отдаёт — T10.19; если
// такая придёт, `attachment-list` пропустит её как неизвестный тип.
export type AssistantPayment = {
  type: "payment"
  // Способ оплаты: kaspi — счёт Kaspi QR (код, ссылка, поллинг статуса),
  // kaspi_transfer — перевод на номер Kaspi продавца, debt — «в долг»
  // (решает продавец). Для перевода и долга карточка статичная.
  provider: "kaspi" | "kaspi_transfer" | "debt"
  // kaspi — статус сессии ядра; перевод/долг после оформления — статус оплаты
  // заказа (awaiting | debt_requested | debt | paid | …), до — статус сессии.
  status: string
  paid: boolean
  amount: number | null
  currency: string
  qr_payload: string | null
  payment_url: string | null
  // Номер заказа (перевод, долг после оформления): его покупатель пишет в
  // комментарии к переводу. null/нет — оплата корзины, заказ не оформлен.
  order_display_id?: number | null
  order_number?: string | null
  // Куда переводить (перевод по номеру и погашение одобренного долга).
  transfer?: {
    phone: string
    recipient: string | null
    note: string | null
  } | null
  // Срок возврата долга (ISO), когда продавец его одобрил.
  due_date?: string | null
}

export type AssistantOrderStatus = {
  type: "order_status"
  display_id: number | null
  // Номер для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  order_number?: string | null
  status_text: string | null
  // Стадия заказа кодом `ORDER_STATUSES` — по ней рисуется степпер и подпись
  // стадии (T3.11; раньше сюда приходила готовая фраза о курьере).
  delivery_stage: string | null
  // Прогресс курьера текстом от бэкенда, если рейс уже создан.
  courier_note: string | null
  delivery_code: string | null
  // Слот доставки кодами: дата `YYYY-MM-DD` в сутках Астаны и окно приезда
  // (`morning` | `day` | `evening`). Подпись собирает витрина (T5.6a).
  delivery_date: string | null
  delivery_window: string | null
}

// Документы заказа со ссылками на PDF (счёт, накладная, внутренний акт).
// Появились по замечанию владельца: ассистент говорил «документы сформированы»,
// а файлов в диалоге не было.
export type AssistantOrderDocument = {
  doc_type: "invoice" | "waybill" | "internal_avr"
  title: string
  number: string
  url: string | null
}

export type AssistantOrderDocuments = {
  type: "documents"
  display_id: number | null
  // Номер для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  order_number?: string | null
  documents: AssistantOrderDocument[]
}

// Просьба войти по номеру телефона (T10.8): оформление доступно только
// авторизованному покупателю. Вставка с действием — вход живёт на отдельной
// странице, репликой в чат его не сделать.
export type AssistantAuthPrompt = {
  type: "auth_prompt"
  reason: "checkout"
}

// Форма доставки: что ассистент уже знает о получателе и каких полей не хватает
// для оформления (`missing_fields`: first_name, last_name, address_1, phone).
export type AssistantDeliveryForm = {
  type: "delivery_form"
  first_name?: string
  last_name?: string
  phone?: string
  address_1?: string
  city?: string
  missing_fields: string[]
}

// Кнопки способов оплаты продавца под ответом «как удобнее оплатить?».
// Нажатие — реплика покупателя в чат, способ выбирает ассистент.
export type AssistantPaymentMethods = {
  type: "payment_methods"
  amount: number
  currency: string
  methods: {
    method: "kaspi_qr" | "kaspi_transfer" | "debt"
    available: boolean
    reason: string | null
  }[]
  debt_term_days: number | null
  debt_max_amount: number | null
}

// Кнопки слотов доставки: ближайшие окна и «другая дата». Кодами — подпись
// собирает витрина (formatDeliverySlot). Нажатие — реплика покупателя в чат.
export type AssistantDeliverySlots = {
  type: "delivery_slots"
  slots: { date: string; window: "morning" | "day" | "evening" }[]
}

// Оплата оформленного заказа (перевод, долг): постоянная карточка, состояние
// читается живым (GET /store/orders/:id/payment).
export type AssistantOrderPayment = {
  type: "order_payment"
  order_id: string
  display_id: number | null
  // Номер для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  order_number?: string | null
}

export type AssistantAttachment =
  | AssistantPayment
  | AssistantOrderPayment
  | AssistantDeliverySlots
  | AssistantPaymentMethods
  | AssistantOrderStatus
  | AssistantOrderDocuments
  | AssistantAuthPrompt
  | AssistantDeliveryForm

export type AssistantChatResponse = {
  reply: string
  messages: AssistantMessage[]
  cart_id?: string
  order_id?: string
  attachments?: AssistantAttachment[]
}

// Состав корзины чата (T10.15). Приходит двумя путями: ответом на нажатие
// счётчика «−/+» и отдельным чтением после хода модели (корзину меняет и она).
export type AssistantCartLine = {
  variant_id: string
  title: string
  quantity: number
  unit_price: number
  total: number
}

export type AssistantCartSummary = {
  cart_id: string
  currency: string
  items: AssistantCartLine[]
  item_count: number
  total: number
}

export type AssistantCartResponse = {
  cart_id: string | null
  cart: AssistantCartSummary
}

// Выставить количества позиций корзины кнопками «−/+» (T10.15). Количество
// АБСОЛЮТНОЕ (сколько должно стать), 0 — убрать позицию: запрос идемпотентен,
// поэтому серию нажатий безопасно схлопывать дебаунсом и повторять после
// обрыва. Хода модели тут нет — это обычная запись в корзину, ассистент увидит
// её на следующем ходе.
export async function setAssistantCartQuantities(request: {
  cart_id?: string
  items: { variant_id: string; quantity: number }[]
}): Promise<AssistantCartResponse> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client.fetch<AssistantCartResponse>(
    "/store/assistant/cart/items",
    {
      method: "POST",
      body: request,
      headers,
      cache: "no-store",
    }
  )
}

// Прочитать состав корзины чата. Нужен после хода модели: корзину меняет и
// ассистент, а полоса корзины обязана показывать правду, а не последний ответ
// счётчика.
export async function getAssistantCart(
  cartId?: string
): Promise<AssistantCartResponse> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client.fetch<AssistantCartResponse>("/store/assistant/cart", {
    method: "GET",
    query: cartId ? { cart_id: cartId } : undefined,
    headers,
    cache: "no-store",
  })
}

// Мини-форма доставки в ленте чата сохраняет профиль покупателя напрямую,
// без хода модели (POST /store/assistant/customer-profile). Корзину форма не
// трогает: адрес на заказ ставит ассистент на следующем ходе.
export type AssistantCustomerProfileInput = {
  first_name?: string
  last_name?: string
  phone?: string
  address_1?: string
  // Точка, выбранная на карте 2ГИС (булавка).
  lat?: number
  lng?: number
}

export type AssistantCustomerProfileResult = {
  profile: {
    first_name: string | null
    last_name: string | null
    address: { address_1: string; city: string } | null
  }
  missing_fields: string[]
}

export async function saveAssistantCustomerProfile(
  data: AssistantCustomerProfileInput
): Promise<AssistantCustomerProfileResult> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client.fetch<AssistantCustomerProfileResult>(
    "/store/assistant/customer-profile",
    {
      method: "POST",
      headers,
      body: data,
      cache: "no-store",
    }
  )
}
