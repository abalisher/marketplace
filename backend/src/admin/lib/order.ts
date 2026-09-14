// DTO admin-API жизненного цикла заказа (GET /admin/order-lifecycles — очередь,
// GET /admin/orders/:id/lifecycle — статус + лог, POST /admin/orders/:id/lifecycle/*
// — переходы) и метаданные статусов для экранов. Значения статусов
// продублированы из модели намеренно: код модуля нельзя импортировать в
// браузерный бандл админки.

export type OrderLifecycleStatus =
  | "new"
  | "confirmed"
  | "assembling"
  | "partially_assembled"
  | "assembled"
  | "in_delivery"
  | "delivered"
  | "closed"
  | "canceled"
  | "returned"

export type OrderLifecycleActorType =
  | "buyer"
  | "seller"
  // Водитель-gig: вручение отмечает он из своего приложения (T5.2b).
  | "driver"
  | "admin"
  | "system"

// Способ получения заказа. После пивота 2026-07-22 единственный способ —
// доставка (приёмка по коду получения). Тип оставлен как точка расширения.
export type OrderDeliveryMethod = "delivery"

// label — i18n-ключ (order.method.*), рендерится через t() в потребителях.
export const ORDER_DELIVERY_METHOD_META: Record<
  OrderDeliveryMethod,
  { label: string }
> = {
  delivery: { label: "order.method.delivery" },
}

// Род записи лога заказа (T5.6b): переход статуса или перенос слота доставки.
// Перенос статус не меняет, поэтому в строке лога у него другая подпись — без
// рода записи она читалась бы как «Собран → Собран».
export type OrderEventKind = "status" | "slot"

// Запись лога заказа (бессрочно): переход статуса или перенос доставки.
export type OrderLifecycleEvent = {
  id: string
  kind: OrderEventKind
  from_status: OrderLifecycleStatus | null
  to_status: OrderLifecycleStatus
  actor_type: OrderLifecycleActorType
  actor_id: string | null
  // Имя человека, сделавшего переход (T4.12). null — переход системы или
  // удалённая учётка: тогда подписью остаётся одна роль.
  actor_name: string | null
  reason: string | null
  // Слот до и после переноса (kind = slot; у переходов статуса — null).
  // Кодами — подпись собирает панель (lib/delivery-slot.ts).
  from_slot_date: string | null
  from_slot_window: string | null
  to_slot_date: string | null
  to_slot_window: string | null
  created_at: string
}

// Состояние оплаты строки заказа — нормализует бэкенд (rows.ts): продавцу
// важно одно — деньги есть или ждём.
export type OrderPaymentState = "paid" | "awaiting" | "canceled"

// Заказ в строке экрана «Заказы» (макет 1b): всё, что рисует таблица, бэкенд
// отдаёт готовым (T4.2a) — покупатель человекочитаемо, признак юрлица, число
// позиций, итог с валютой, оплата, адрес доставки. Экран ничего не считает.
export type AdminOrderLifecycleRowOrder = {
  id: string
  display_id: number | null
  email: string | null
  created_at: string | null
  customer_name: string | null
  company_id: string | null
  is_company: boolean
  item_count: number
  total: number | null
  currency_code: string | null
  payment_state: OrderPaymentState | null
  address: string | null
}

// Ответственный за заказ (T4.12): на стадиях сборки — сборщики, взявшие
// задания, иначе — сотрудник, последним переведший статус. Роль подписывает
// имя одним словом, чтобы «Данияр» в колонке не читался как оператор.
export type OrderAssigneeRole = "picker" | "operator"

export type OrderAssignee = {
  name: string
  role: OrderAssigneeRole
}

// Элемент очереди: order_lifecycle + собранная бэкендом строка заказа + время
// и ответственный. Возраст заказа, часы в статусе, срок стадии и просрочку
// считает бэкенд (api/admin/order-lifecycles/sla.ts) — экран только рисует.
export type AdminOrderLifecycleListItem = {
  id: string
  status: OrderLifecycleStatus
  previous_status: OrderLifecycleStatus | null
  note: string | null
  delivery_method: OrderDeliveryMethod
  // Слот доставки (T5.6): дата в астанинских сутках и окно приезда. null —
  // заказ оформлен до появления слотов.
  delivery_date: string | null
  delivery_window: string | null
  created_at: string
  updated_at: string
  age_hours: number
  status_hours: number
  sla_hours: number | null
  overdue: boolean
  assignee: OrderAssignee | null
  order: AdminOrderLifecycleRowOrder | null
}

// Счётчики заказов по статусам при текущих прочих фильтрах (поиск) — для
// чипов-фильтров. Считает бэкенд одним ответом со страницей.
export type AdminOrderLifecycleCounts = {
  total: number
  by_status: Record<OrderLifecycleStatus, number>
  // Сколько заказов вышли за срок своей стадии (T4.12).
  overdue: number
}

export type AdminOrderLifecyclesResponse = {
  order_lifecycles: AdminOrderLifecycleListItem[]
  counts: AdminOrderLifecycleCounts
  count: number
  offset: number
  limit: number
}

// Статус + история конкретного заказа (виджет на ядровой странице заказа).
// status = null, если у заказа ещё нет lifecycle (заказ создан не нашим placeOrder).
// Кода получения здесь нет намеренно — он секрет покупателя.
export type AdminOrderLifecycleResponse = {
  order_id: string
  status: OrderLifecycleStatus | null
  previous_status: OrderLifecycleStatus | null
  note: string | null
  delivery_method: OrderDeliveryMethod | null
  // Слот доставки (T5.6): по нему пункт меню называется «Перенести доставку»
  // или «Назначить окно» — у заказов до T5.6 окна нет.
  delivery_date: string | null
  delivery_window: string | null
  history: OrderLifecycleEvent[]
}

// --- Карточка заказа для drawer'а очереди (макет 1c, T4.2c) ---
//
// Всё, что рисует карточка, приходит ОДНИМ ответом
// GET /admin/orders/:id/lifecycle/card: экран ничего не считает и не ходит за
// данными в четыре места. Технических id в карточке два — id заказа и цели
// переходов (`transition_targets`); на экран они не выводятся.

export type OrderCardItem = {
  id: string
  title: string
  variant_title: string | null
  quantity: number
  unit_price: number | null
  total: number | null
}

// Итоги. Деньги на экране должны сходиться: «Товары» + «Доставка» − «Скидка» =
// «Итого» (грабля T3.11 — ядровый `subtotal` включает доставку).
export type OrderCardTotals = {
  item_total: number | null
  shipping_total: number | null
  discount_total: number | null
  total: number | null
  currency_code: string | null
}

export type OrderCardCustomer = {
  name: string | null
  email: string | null
  phone: string | null
  is_company: boolean
  company_id: string | null
  company_name: string | null
  company_bin: string | null
}

// Лимит отсрочки юрлица. null — заказ физлица либо скоринг по компании ещё не
// считался.
export type OrderCardCredit = {
  limit: number
  available: number
  reserved: number
}

export type OrderCardDelivery = {
  recipient: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  phone: string | null
  shipping_method: string | null
  slot_date: string | null
  slot_window: string | null
}

// Цели переходов: какие позиции собирать и какой fulfillment отгружать/вручать —
// выбирает бэкенд (в виджете на странице заказа это считал браузер по данным
// ядровой страницы, drawer'у их не видно).
export type OrderCardTransitionTargets = {
  items: { id: string; quantity: number }[]
  ship_fulfillment_id: string | null
  deliver_fulfillment_id: string | null
}

export type AdminOrderCard = {
  order_id: string
  display_id: number | null
  created_at: string | null
  status: OrderLifecycleStatus | null
  previous_status: OrderLifecycleStatus | null
  note: string | null
  delivery_method: OrderDeliveryMethod | null
  history: OrderLifecycleEvent[]
  customer: OrderCardCustomer
  credit: OrderCardCredit | null
  items: OrderCardItem[]
  totals: OrderCardTotals
  payment_state: OrderPaymentState | null
  delivery: OrderCardDelivery
  // Только актуальные версии (вся история версий — на странице заказа).
  documents: AdminOrderCardDocument[]
  // Активная претензия по заказу (T4.11): продавец обязан видеть её, ОТКРЫВ
  // заказ, а не в конце другого раздела. null — претензий нет.
  active_dispute: OrderCardActiveDispute | null
  transition_targets: OrderCardTransitionTargets
}

// Активная претензия в карточке заказа: категория, статус и суть — по ним
// оператор решает, открывать ли рабочее место претензии.
export type OrderCardActiveDispute = {
  id: string
  category: string
  status: string
  description: string
  created_at: string | null
}

// Документ заказа в карточке (подмножество AdminOrderDocument из lib/documents —
// карточке нужны номер, тип, ссылка и отметка отправки).
export type AdminOrderCardDocument = {
  id: string
  type: string
  number: string
  version: number
  is_latest: boolean
  file_url: string | null
  sent_to_buyer_at: string | null
  created_at: string | null
}

export type AdminOrderCardResponse = {
  order_card: AdminOrderCard
}

// --- Перенос доставки (T5.6b) ---
//
// GET /admin/orders/:id/lifecycle/reschedule отдаёт окна, которые заказу ещё
// можно поставить: доступность (запас на сборку, горизонт недели) считает
// домен слота на бэкенде — панель их только подписывает. can_reschedule = false
// у заказа, который уже уехал (отгружен, вручён, отменён): двигать нечего.

export type AdminOrderSlotOption = {
  date: string
  window: string
}

// Можно ли предлагать перенос по текущему статусу — зеркало
// SLOT_RESCHEDULE_STATUSES бэкенда (та же причина дублирования, что у статусов
// выше: серверный код в бандл админки не тянется). Нужна, чтобы кнопка
// «Перенести» не появлялась у отгруженного заказа; окончательное «можно» всё
// равно говорит бэкенд (can_reschedule).
export const canRescheduleDelivery = (
  method: string | null | undefined,
  status: string | null | undefined
): boolean =>
  method === "delivery" &&
  !!status &&
  ["new", "confirmed", "assembling", "partially_assembled", "assembled"].includes(
    status
  )

export type AdminOrderRescheduleOptionsResponse = {
  order_id: string
  status: OrderLifecycleStatus | null
  can_reschedule: boolean
  current: { date: string | null; window: string | null }
  slots: AdminOrderSlotOption[]
}

// --- Таймлайн статусов карточки ---
//
// Прямой путь заказа: по нему рисуется таймлайн (макет 1c). Частичная сборка на
// таймлайне не отдельная стадия, а состояние стадии «Собран» — иначе у половины
// заказов путь выглядел бы разным. Отмена и возврат — терминальные и в прямой
// путь не входят: их таймлайн показывает последней стадией.
export const ORDER_CARD_PATH: OrderLifecycleStatus[] = [
  "new",
  "confirmed",
  "assembling",
  "assembled",
  "in_delivery",
  "delivered",
  "closed",
]

// Куда на прямом пути попадает статус (partially_assembled — на стадию
// «Собран»); терминальные вне пути → -1.
const pathIndex = (status: OrderLifecycleStatus | null): number => {
  if (!status) {
    return -1
  }
  const normalized: OrderLifecycleStatus =
    status === "partially_assembled" ? "assembled" : status
  return ORDER_CARD_PATH.indexOf(normalized)
}

export type OrderCardStage = {
  status: OrderLifecycleStatus
  // done — стадия пройдена, current — заказ на ней сейчас, иначе впереди.
  state: "done" | "current" | "upcoming"
  // Когда стадия наступила (из лога переходов) — null у стадии «Новый»
  // (создание заказа переходом не логируется) и у будущих стадий.
  at: string | null
}

// Стадии для таймлайна: прямой путь + отметки времени из лога переходов.
// Терминальные статусы (отменён/возврат) добавляются последней стадией — путь
// на них обрывается, дальше двигаться нельзя.
export const orderCardStages = (
  status: OrderLifecycleStatus | null,
  history: OrderLifecycleEvent[]
): OrderCardStage[] => {
  const reachedAt = new Map<OrderLifecycleStatus, string>()
  for (const event of history) {
    // Перенос доставки — не стадия пути: у такой записи в обоих статусах стоит
    // текущий, и на таймлайне она отметила бы стадию временем переноса.
    if (event.kind === "slot") {
      continue
    }
    const key: OrderLifecycleStatus =
      event.to_status === "partially_assembled" ? "assembled" : event.to_status
    if (!reachedAt.has(key)) {
      reachedAt.set(key, event.created_at)
    }
  }

  const current = pathIndex(status)
  const terminal =
    status === "canceled" || status === "returned" ? status : null
  // У отменённого/возвращённого заказа пройденной считаем часть пути до
  // последнего залогированного шага прямого пути.
  const lastOnPath = terminal
    ? Math.max(
        ...[...reachedAt.keys()].map((reached) => pathIndex(reached)),
        0
      )
    : current

  const stages: OrderCardStage[] = ORDER_CARD_PATH.map((stage, index) => ({
    status: stage,
    state:
      index < lastOnPath || (terminal && index <= lastOnPath)
        ? "done"
        : index === current
          ? "current"
          : "upcoming",
    at: reachedAt.get(stage) ?? null,
  }))

  if (terminal) {
    stages.push({
      status: terminal,
      state: "current",
      at: reachedAt.get(terminal) ?? null,
    })
  }

  return stages
}

// Подписи и цвета статусов. label — i18n-ключ (order.status.*), рендерится через
// t() в потребителях. color — палитра StatusBadge (виджет/бейдж), dotClass —
// точка в списках (идиома StatusCell стандартных таблиц ядра).
export const ORDER_LIFECYCLE_STATUS_META: Record<
  OrderLifecycleStatus,
  {
    label: string
    color: "grey" | "blue" | "orange" | "purple" | "green" | "red"
    dotClass: string
  }
> = {
  new: {
    label: "order.status.new",
    color: "grey",
    dotClass: "bg-ui-tag-neutral-icon",
  },
  confirmed: {
    label: "order.status.confirmed",
    color: "blue",
    dotClass: "bg-ui-tag-blue-icon",
  },
  assembling: {
    label: "order.status.assembling",
    color: "orange",
    dotClass: "bg-ui-tag-orange-icon",
  },
  partially_assembled: {
    label: "order.status.partially_assembled",
    color: "orange",
    dotClass: "bg-ui-tag-orange-icon",
  },
  assembled: {
    label: "order.status.assembled",
    color: "blue",
    dotClass: "bg-ui-tag-blue-icon",
  },
  in_delivery: {
    label: "order.status.in_delivery",
    color: "purple",
    dotClass: "bg-ui-tag-purple-icon",
  },
  delivered: {
    label: "order.status.delivered",
    color: "green",
    dotClass: "bg-ui-tag-green-icon",
  },
  closed: {
    label: "order.status.closed",
    color: "green",
    dotClass: "bg-ui-tag-green-icon",
  },
  canceled: {
    label: "order.status.canceled",
    color: "red",
    dotClass: "bg-ui-tag-red-icon",
  },
  returned: {
    label: "order.status.returned",
    color: "red",
    dotClass: "bg-ui-tag-red-icon",
  },
}

// Статусы для чипа-фильтра очереди (порядок — как в стейт-машине ТЗ).
export const ORDER_LIFECYCLE_STATUSES = Object.keys(
  ORDER_LIFECYCLE_STATUS_META
) as OrderLifecycleStatus[]

// Подписи состояния оплаты. label — i18n-ключ, className — цвет текста в
// колонке «Оплата» (классы sm-pay-* из styles/orders.css).
export const ORDER_PAYMENT_STATE_META: Record<
  OrderPaymentState,
  { label: string; className: string }
> = {
  paid: { label: "orderQueue.payment.paid", className: "sm-pay-paid" },
  awaiting: {
    label: "orderQueue.payment.awaiting",
    className: "sm-pay-awaiting",
  },
  canceled: {
    label: "orderQueue.payment.canceled",
    className: "sm-pay-canceled",
  },
}

const UNKNOWN_PAYMENT_META = {
  label: "common.unknownValue",
  className: "sm-pay-none",
} as const

// Как orderStatusMeta: значение приходит из API строкой, неизвестное или
// отсутствующее показываем прочерком, а не роняем экран.
export const orderPaymentStateMeta = (state: string | null | undefined) =>
  (state ? ORDER_PAYMENT_STATE_META[state as OrderPaymentState] : null) ??
  UNKNOWN_PAYMENT_META

// Чипы-фильтры экрана «Заказы» (макет 1b). label — i18n-ключ; statuses —
// значения фильтра `status` (null — чип «Все», без фильтра). Группируем ТОЛЬКО
// сборку: чип «Сборка» покрывает assembling + partially_assembled (решение
// T4.2a); остальные статусы — по чипу на каждый, без выдуманной семантики.
export type OrderQueueChip = {
  key: string
  label: string
  statuses: OrderLifecycleStatus[] | null
}

export const ORDER_QUEUE_CHIPS: OrderQueueChip[] = [
  { key: "all", label: "orderQueue.chip.all", statuses: null },
  { key: "new", label: "order.status.new", statuses: ["new"] },
  { key: "confirmed", label: "order.status.confirmed", statuses: ["confirmed"] },
  {
    key: "assembly",
    label: "orderQueue.chip.assembly",
    statuses: ["assembling", "partially_assembled"],
  },
  { key: "assembled", label: "order.status.assembled", statuses: ["assembled"] },
  {
    key: "in_delivery",
    label: "order.status.in_delivery",
    statuses: ["in_delivery"],
  },
  { key: "delivered", label: "order.status.delivered", statuses: ["delivered"] },
  { key: "closed", label: "order.status.closed", statuses: ["closed"] },
  { key: "canceled", label: "order.status.canceled", statuses: ["canceled"] },
  { key: "returned", label: "order.status.returned", statuses: ["returned"] },
]

// Число на чипе: сумма счётчиков его статусов («Все» — общий счёт). Статусы,
// которых бэкенд не прислал, считаем нулём — экран не падает на расхождении
// версий.
export const orderQueueChipCount = (
  counts: AdminOrderLifecycleCounts,
  chip: OrderQueueChip
): number => {
  if (!chip.statuses) {
    return counts.total
  }
  return chip.statuses.reduce(
    (sum, status) => sum + (counts.by_status[status] ?? 0),
    0
  )
}

// --- Безопасное чтение словарей ---
//
// Статус и способ получения приходят из БД строками, а не из TS-типа: в базе
// живут значения, снятые с активного пути пивотом 2026-07-22 (delivery_method
// «pickup» у старых заказов, «counter» у заказов POS), и появятся новые статусы
// будущих версий. Прямая индексация словаря давала undefined и роняла экран
// (очередь заказов падала целиком, виджет на странице заказа — вместе с ней),
// поэтому читаем ТОЛЬКО через эти функции: неизвестное значение показываем
// прочерком, а не техническим кодом.

const UNKNOWN_STATUS_META = {
  label: "common.unknownValue",
  color: "grey",
  dotClass: "bg-ui-tag-neutral-icon",
} as const

const UNKNOWN_METHOD_META = { label: "common.unknownValue" } as const

export const orderStatusMeta = (status: string | null | undefined) =>
  (status ? ORDER_LIFECYCLE_STATUS_META[status as OrderLifecycleStatus] : null) ??
  UNKNOWN_STATUS_META

export const orderDeliveryMethodMeta = (method: string | null | undefined) =>
  (method ? ORDER_DELIVERY_METHOD_META[method as OrderDeliveryMethod] : null) ??
  UNKNOWN_METHOD_META

// Дескриптор перехода, доступного из текущего статуса. path — сегмент
// POST /admin/orders/:id/lifecycle/<path>; label/success — i18n-ключи
// (order.transition.* / order.transitionToast.*), рендерятся через t() в
// потребителях; needsItems/needsFulfillment — признак, что телу нужны
// позиции/fulfillment заказа (берём со страницы ядра); prompt — переход через
// диалог (отмена с необязательной причиной); needsCode — вручение по коду
// получения (диалог с обязательным кодом).
export type OrderTransition = {
  path:
    | "confirm"
    | "start-assembly"
    // `complete-assembly` в панели БОЛЬШЕ НЕ ПРЕДЛАГАЕТСЯ (решение владельца
    // 2026-09-06): сборку закрывают сборщики со своих экранов, и последнее
    // закрытое задание само двигает заказ в «Собран» (T10.11/T10.12). Кнопка
    // продавца обходила задания стороной — заказ уезжал в «Собран», а задания
    // навсегда оставались `pending`, и сборщик видел работу по отгруженному
    // заказу. Роут и workflow живы, из панели их никто не зовёт.
    | "ship"
    | "deliver"
    | "close"
    | "cancel"
  label: string
  success: string
  danger?: boolean
  needsItems?: boolean
  needsFulfillment?: boolean
  prompt?: boolean
  needsCode?: boolean
}

const CANCEL_TRANSITION: OrderTransition = {
  path: "cancel",
  label: "order.transition.cancel",
  success: "order.transitionToast.canceled",
  danger: true,
  prompt: true,
}

const CONFIRM_TRANSITION: OrderTransition = {
  path: "confirm",
  label: "order.transition.confirm",
  success: "order.transitionToast.confirmed",
}

const START_ASSEMBLY_TRANSITION: OrderTransition = {
  path: "start-assembly",
  label: "order.transition.startAssembly",
  success: "order.transitionToast.assemblyStarted",
}

const SHIP_TRANSITION: OrderTransition = {
  path: "ship",
  label: "order.transition.ship",
  success: "order.transitionToast.shipped",
  needsItems: true,
  needsFulfillment: true,
}

const CLOSE_TRANSITION: OrderTransition = {
  path: "close",
  label: "order.transition.close",
  success: "order.transitionToast.closed",
}

// Разрешённые из текущего статуса действия — на каждый способ получения
// (подмножество стейт-машины сервиса, пригодное для ручного управления из
// админки). Возврат (returned) — отдельный сценарий returnFlow, здесь не
// выставляется. Из partially_assembled предлагаем отгрузку готовой части.
// Переходы, доступные из пары (способ получения, статус). Снятые с пути
// значения (pickup/counter) переходов не имеют — такой заказ показываем, но
// двигать его из панели нельзя.
export const orderTransitions = (
  method: string | null | undefined,
  status: string | null | undefined
): OrderTransition[] =>
  (method && status
    ? ORDER_TRANSITIONS[method as OrderDeliveryMethod]?.[
        status as OrderLifecycleStatus
      ]
    : null) ?? []

export const ORDER_TRANSITIONS: Record<
  OrderDeliveryMethod,
  Record<OrderLifecycleStatus, OrderTransition[]>
> = {
  delivery: {
    new: [CONFIRM_TRANSITION, CANCEL_TRANSITION],
    confirmed: [START_ASSEMBLY_TRANSITION, CANCEL_TRANSITION],
    // Из «В сборке» продавцу доступна только отмена: закрыть сборку может
    // лишь сборщик, отметив позиции (см. комментарий у типа выше).
    assembling: [CANCEL_TRANSITION],
    partially_assembled: [SHIP_TRANSITION, CANCEL_TRANSITION],
    assembled: [SHIP_TRANSITION, CANCEL_TRANSITION],
    in_delivery: [
      {
        path: "deliver",
        label: "order.transition.markDelivered",
        success: "order.transitionToast.delivered",
        needsFulfillment: true,
        // Приёмка по коду получения: код называет покупатель при вручении.
        needsCode: true,
      },
    ],
    delivered: [CLOSE_TRANSITION],
    closed: [],
    canceled: [],
    returned: [],
  },
}
