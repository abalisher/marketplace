import { MedusaContainer } from "@medusajs/framework/types"
import { AssistantTurnFile } from "./file-input"
import { GeminiFunctionCall, GeminiFunctionDeclaration } from "../gemini"

// Типы разговорного ассистента покупателя (пивот №3). Внешний ИИ-адаптер поверх
// существующих модулей (не Medusa-модуль — своего домена/БД нет; идиома
// invoice-ai). Провайдер — Gemini function-calling (решение владельца 2026-07-23).

// Сообщение диалога на границе store API. Роль клиента — user|assistant; на
// границе с Gemini маппится в user|model (см. orchestrator).
export type AssistantRole = "user" | "assistant"

export type AssistantMessage = {
  role: AssistantRole
  content: string
}

// UI-вложения чата (пивот-редизайн 2026-07-24, DECISIONS). Read-only карточки,
// которые инструменты кладут рядом с текстовым ответом, чтобы клиент нарисовал их
// под репликой ассистента (текстовый минимал + вставки, БЕЗ кнопок). Данные для
// отрисовки, не команды: действия покупатель по-прежнему выражает текстом.
// Карточки подбора (`product_card`) бэкенд больше не отдаёт (T10.19, DECISIONS
// 2026-09-14); схема ещё лежит в контракте до парного таска buyer.

export type PaymentAttachment = {
  type: "payment"
  // Способ оплаты: kaspi — счёт Kaspi QR (код и ссылка), kaspi_transfer —
  // перевод на номер Kaspi продавца, debt — «в долг» (решает продавец).
  provider: "kaspi" | "kaspi_transfer" | "debt"
  status: string
  paid: boolean
  // Сумма к оплате в тенге (итог корзины на момент выставления счёта) — макет
  // 1c показывает её в платёжном блоке. null — прочитать не удалось.
  amount: number | null
  currency: string
  qr_payload: string | null
  payment_url: string | null
  // Номер заказа — у карточки оплаты уже оформленного заказа (перевод, долг):
  // его покупатель пишет в комментарии к переводу. null — оплата корзины.
  order_display_id?: number | null
  // Номер заказа для людей (ORG-26-0007) — его и пишут в комментарии.
  order_number?: string | null
  // Куда переводить (перевод по номеру и погашение долга).
  transfer?: { phone: string; recipient: string | null; note: string | null } | null
  // Срок долга, когда продавец его одобрил.
  due_date?: string | null
}

// Кнопки способов оплаты (под ответом «как вам удобнее оплатить?»): только те,
// что принимает продавец корзины. Нажатие — обычная реплика покупателя в чат
// («Способ оплаты: перевод на Kaspi»), дальше ассистент выбирает способ сам.
// Недоступный по сумме способ приходит с available=false и причиной.
export type PaymentMethodsAttachment = {
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

// Кнопки слотов доставки: ближайшие окна и «другая дата» (выбор дня и окна из
// тех же вариантов). Нажатие — реплика покупателя «Доставка: <дата>, <окно>»,
// слот сохраняет ассистент. Кодами: подпись на своём языке собирает клиент.
export type DeliverySlotsAttachment = {
  type: "delivery_slots"
  slots: { date: string; window: "morning" | "day" | "evening" }[]
}

// Оплата оформленного заказа (перевод, долг): карточка ПОСТОЯННАЯ — остаётся в
// истории диалога под ответом, а состояние клиент каждый раз читает живым
// (GET /store/orders/:id/payment): куда переводить, чек, смена способа, статус.
// Снимок в истории устарел бы — «ждём перевод» висел бы и после оплаты.
export type OrderPaymentAttachment = {
  type: "order_payment"
  order_id: string
  display_id: number | null
  // Номер заказа для людей (ORG-26-0007); null — заказ до 2026-11-02.
  order_number?: string | null
}

export type OrderStatusAttachment = {
  type: "order_status"
  display_id: number | null
  order_number?: string | null
  status_text: string | null
  // Стадия заказа КОДОМ `ORDER_STATUSES` (`new` … `delivered`) — по ней клиент
  // рисует степпер и подписывает бейдж на своём языке. До T3.11 сюда попадала
  // русская фраза о курьере, и степпер не рисовался вовсе, пока курьера не
  // назначили (находка гейта U T3.9).
  delivery_stage: string | null
  // Прогресс курьера человеческим текстом, если рейс уже создан («Курьер прибыл
  // по адресу доставки»). null — курьера ещё нет.
  courier_note: string | null
  delivery_code: string | null
  // Слот доставки заказа (T5.6a): дата в астанинских сутках `YYYY-MM-DD` и код
  // окна (`morning` | `day` | `evening`). Кодами, а не готовой фразой: подпись
  // «6 сент., 13:00–17:00» клиент собирает на своём языке — так же, как
  // подписывает стадию по `delivery_stage`. null — заказ оформлен до появления
  // слотов.
  delivery_date: string | null
  delivery_window: string | null
}

// Документы заказа со ссылками на PDF (T2.10: «нажал „Нужны документы“, но не
// получил накладную» — ассистент говорил «сформированы», а файлов в диалоге не
// было). Вставка read-only: покупатель открывает PDF по ссылке.
export type OrderDocumentsAttachment = {
  type: "documents"
  display_id: number | null
  order_number?: string | null
  documents: {
    // invoice | waybill | internal_avr — тип документа платформы.
    doc_type: string
    // Человекочитаемое название для ленты («Счёт на оплату»).
    title: string
    number: string
    url: string | null
  }[]
}

// Просьба войти по номеру телефона (T10.8). Оформление заказа доступно только
// авторизованному покупателю: гость собирает корзину, а на шаге оформления
// получает в ленте кнопку входа (исключение из правила «в ленте нет кнопок» —
// вход живёт на отдельном экране, репликой в чат его не сделать; второе
// исключение — форма доставки ниже).
// Вставку кладут guard'ы оформления (set_delivery / checkout_payment / place_order)
// и профиль покупателя, когда `customerId` в контексте нет.
export type AuthPromptAttachment = {
  type: "auth_prompt"
  // Зачем нужен вход — клиент подписывает карточку. Пока единственная причина —
  // оформление заказа; поле оставлено полем, чтобы не ломать контракт, когда
  // появится вторая (например, бонусы).
  reason: "checkout"
}

// Мини-форма доставки: что ассистент уже знает о получателе и каких полей не
// хватает для оформления (`missing_fields`). Покупатель отвечает текстом или
// заполняет форму — она сохраняет профиль через POST
// /store/assistant/customer-profile. Кладут профиль покупателя, сохранение
// профиля и set_delivery, пока данных не хватает; успешный set_delivery её
// убирает (buyer-identity.dropDeliveryForm).
export type DeliveryFormAttachment = {
  type: "delivery_form"
  first_name?: string
  last_name?: string
  phone?: string
  address_1?: string
  city?: string
  missing_fields: string[]
}

export type AssistantAttachment =
  | PaymentAttachment
  | PaymentMethodsAttachment
  | DeliverySlotsAttachment
  | OrderPaymentAttachment
  | OrderStatusAttachment
  | OrderDocumentsAttachment
  | AuthPromptAttachment
  | DeliveryFormAttachment

// Продавец витрины, с которой идёт диалог: компания площадки (мультипродавец)
// или сама площадка (null в контексте). Модели — только то, что можно назвать
// покупателю.
export type AssistantSeller = {
  name: string
  bin: string | null
}

// Контекст хода ассистента — то, что stateless-диалог тянет между ходами ПОМИМО
// истории сообщений. Клиент держит `cart_id` так же, как держит `messages`:
// сервер не хранит сессию чата, id корзины — «капабилити-токен» на стороне клиента
// (решение 2026-07-23, DECISIONS). МУТАБЕЛЬНЫЙ: инструмент, создающий корзину,
// проставляет `cartId`, и оркестратор возвращает актуальное значение наружу.
// `customerId` — id залогиненного покупателя (если запрос авторизован), иначе гость.
// `lastOrderId` — id последнего оформленного заказа, тоже «капабилити-токен» на
// стороне клиента (как cartId): place_order проставляет его, оркестратор возвращает
// наружу, клиент держит и шлёт обратно; track_order отслеживает ИМЕННО его, а не
// произвольный номер заказа — display_id последователен и угадываем, внутренний id
// случаен, поэтому владение им = право смотреть статус (гостевой флоу, DECISIONS 2026-07-23).
// Вошедшему покупателю оркестратор засчитывает только его заказ, а без токена
// берёт его последний заказ на витрине (lib/assistant/last-order.ts).
export type AssistantContext = {
  cartId?: string
  customerId?: string
  lastOrderId?: string
  // Канал продаж витрины — из publishable key запроса (ядро проверило ключ).
  // В нём создаётся корзина: канал решает, чей это заказ, с каких складов
  // резерв и какая доставка. Корзину другого канала ход не продолжает.
  salesChannelId?: string
  seller?: AssistantSeller | null
  // UI-вложения, накопленные инструментами за ход. Оркестратор инициализирует
  // пустым массивом, инструменты дописывают (как cartId — мутабельно), оркестратор
  // возвращает наружу. Не участвует в диалоге с моделью — только для отрисовки.
  attachments?: AssistantAttachment[]
  // Вложения ТЕКУЩЕГО хода (T10.4): фото списка, фото объекта, PDF. Живут
  // ровно один ход — в отличие от cartId, между ходами не тянутся и в истории
  // диалога не остаются (там остаётся текст ответа). Проверены и приведены
  // роутом (`prepareAssistantFiles`), оркестратор кладёт их частями к
  // ПОСЛЕДНЕЙ реплике покупателя — той, с которой их прислали.
  files?: AssistantTurnFile[]
  // Варианты, по которым В ЭТОМ ходе сработал guard сильного округления
  // add_to_cart (T2.3a). Пока variant_id здесь — повторное добавление в том же
  // ходе ЗАПРЕЩЕНО детерминированно (LLM игнорирует текстовый запрет в ошибке):
  // подтверждение покупателя возможно только в следующем ходе. Оркестратор
  // инициализирует пустым множеством на каждый ход.
  roundingGuardVariants?: Set<string>
}

// Инструмент ассистента: декларация для function-calling + исполнитель. Исполнитель
// получает контейнер Medusa (резолвит query/сервисы), распарсенные аргументы и
// контекст хода (корзина/покупатель), возвращает объект-результат (уйдёт модели как
// functionResponse). Инструмент может ПРОЧИТАТЬ и ИЗМЕНИТЬ контекст (например
// проставить cartId после создания корзины). Ошибку внутри исполнитель НЕ глушит —
// оркестратор оборачивает её в functionResponse.error, чтобы модель переспросила,
// а не падал весь запрос.
export type AssistantTool = {
  declaration: GeminiFunctionDeclaration
  execute: (
    container: MedusaContainer,
    args: Record<string, unknown>,
    context: AssistantContext
  ) => Promise<Record<string, unknown>>
}

// Крючки потокового хода (T10.1d). Оркестратор зовёт их, пока идёт ход, а роут
// превращает вызовы в SSE-события для клиента:
// - [onTextDelta] — очередной фрагмент текста ответа (клиент дописывает его к
//   тому, что уже напечатал);
// - [onTextReset] — сбросить НАПЕЧАТАННОЕ и начать ответ заново: так уходит
//   текст-преамбула, которую модель написала перед вызовом инструмента (в
//   итоговый ответ она не попадает);
// - [onState] — токены сессии ИЗМЕНИЛИСЬ посреди хода (инструмент создал
//   корзину или оформил заказ). Досылаются сразу, а не только в итоге хода:
//   иначе «Стоп» посреди хода терял бы созданную корзину — итог до клиента уже
//   не доедет, соединение оборвано;
// - `signal` — покупатель нажал «Стоп» (клиент оборвал соединение): ход
//   прекращается, уже исполненные инструменты не откатываются.
export type AssistantStreamHooks = {
  onTextDelta: (delta: string) => void
  onTextReset: () => void
  onState: (tokens: { cartId?: string; orderId?: string }) => void
  signal?: AbortSignal
}

// Итог одного хода: ответ ассистента (текст), дополненная история (тонкий клиент
// её хранит), актуальный id корзины и id последнего заказа (оба клиент шлёт обратно
// следующим ходом, как messages) и список фактически исполненных вызовов инструментов
// (прозрачность/тесты; в store-ответе toolCalls не светим).
export type AssistantTurnResult = {
  reply: string
  messages: AssistantMessage[]
  cartId?: string
  orderId?: string
  // Read-only UI-вложения, собранные инструментами за ход (оплата, статус заказа,
  // документы, просьба войти); клиент рисует их под ответом. Пустой массив — вложений нет.
  attachments: AssistantAttachment[]
  toolCalls: GeminiFunctionCall[]
  // Ход оборван покупателем («Стоп», T10.1d): `reply` — то, что успело
  // напечататься (может быть пустым, тогда ответа в `messages` нет).
  aborted?: boolean
}
