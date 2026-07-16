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

export type OrderLifecycleActorType = "buyer" | "seller" | "admin" | "system"

// Способ получения заказа: определяет путь по стейт-машине и механизм приёмки
// (delivery — код получения, pickup — выдача у окна по накладной, counter —
// продажа у окна, создаётся сразу выданным).
export type OrderDeliveryMethod = "delivery" | "pickup" | "counter"

export const ORDER_DELIVERY_METHOD_META: Record<
  OrderDeliveryMethod,
  { label: string }
> = {
  delivery: { label: "Delivery" },
  pickup: { label: "Pickup" },
  counter: { label: "Counter" },
}

// Запись лога переходов (бессрочно).
export type OrderLifecycleEvent = {
  id: string
  from_status: OrderLifecycleStatus | null
  to_status: OrderLifecycleStatus
  actor_type: OrderLifecycleActorType
  actor_id: string | null
  reason: string | null
  created_at: string
}

// Элемент очереди: order_lifecycle + link-поля заказа (номер/почта/дата).
export type AdminOrderLifecycleListItem = {
  id: string
  status: OrderLifecycleStatus
  previous_status: OrderLifecycleStatus | null
  note: string | null
  delivery_method: OrderDeliveryMethod
  created_at: string
  updated_at: string
  order: {
    id: string
    display_id: number
    email: string | null
    created_at: string
  } | null
}

export type AdminOrderLifecyclesResponse = {
  order_lifecycles: AdminOrderLifecycleListItem[]
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
  history: OrderLifecycleEvent[]
}

// Подписи и цвета статусов. Тексты — на английском, как и весь дашборд (ядро
// не шипит русскую локаль; локализация — отдельная задача). color — палитра
// StatusBadge (виджет/бейдж), dotClass — точка в списках (идиома StatusCell
// стандартных таблиц ядра).
export const ORDER_LIFECYCLE_STATUS_META: Record<
  OrderLifecycleStatus,
  {
    label: string
    color: "grey" | "blue" | "orange" | "purple" | "green" | "red"
    dotClass: string
  }
> = {
  new: { label: "New", color: "grey", dotClass: "bg-ui-tag-neutral-icon" },
  confirmed: {
    label: "Confirmed",
    color: "blue",
    dotClass: "bg-ui-tag-blue-icon",
  },
  assembling: {
    label: "Assembling",
    color: "orange",
    dotClass: "bg-ui-tag-orange-icon",
  },
  partially_assembled: {
    label: "Partially assembled",
    color: "orange",
    dotClass: "bg-ui-tag-orange-icon",
  },
  assembled: {
    label: "Assembled",
    color: "blue",
    dotClass: "bg-ui-tag-blue-icon",
  },
  in_delivery: {
    label: "In delivery",
    color: "purple",
    dotClass: "bg-ui-tag-purple-icon",
  },
  delivered: {
    label: "Delivered",
    color: "green",
    dotClass: "bg-ui-tag-green-icon",
  },
  closed: { label: "Closed", color: "green", dotClass: "bg-ui-tag-green-icon" },
  canceled: { label: "Canceled", color: "red", dotClass: "bg-ui-tag-red-icon" },
  returned: { label: "Returned", color: "red", dotClass: "bg-ui-tag-red-icon" },
}

// Статусы для чипа-фильтра очереди (порядок — как в стейт-машине ТЗ).
export const ORDER_LIFECYCLE_STATUSES = Object.keys(
  ORDER_LIFECYCLE_STATUS_META
) as OrderLifecycleStatus[]

// Дескриптор перехода, доступного из текущего статуса. path — сегмент
// POST /admin/orders/:id/lifecycle/<path>; needsItems/needsFulfillment —
// признак, что телу нужны позиции/fulfillment заказа (берём со страницы ядра);
// prompt — переход через диалог (отмена с необязательной причиной);
// needsCode — вручение по коду получения (диалог с обязательным кодом).
export type OrderTransition = {
  path:
    | "confirm"
    | "start-assembly"
    | "complete-assembly"
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
  label: "Cancel order",
  success: "Order canceled",
  danger: true,
  prompt: true,
}

const CONFIRM_TRANSITION: OrderTransition = {
  path: "confirm",
  label: "Confirm",
  success: "Order confirmed",
}

const START_ASSEMBLY_TRANSITION: OrderTransition = {
  path: "start-assembly",
  label: "Start assembly",
  success: "Assembly started",
}

const COMPLETE_ASSEMBLY_TRANSITION: OrderTransition = {
  path: "complete-assembly",
  label: "Complete assembly",
  success: "Assembly completed",
  needsItems: true,
}

const SHIP_TRANSITION: OrderTransition = {
  path: "ship",
  label: "Ship",
  success: "Order shipped",
  needsItems: true,
  needsFulfillment: true,
}

const CLOSE_TRANSITION: OrderTransition = {
  path: "close",
  label: "Close order",
  success: "Order closed",
}

// Разрешённые из текущего статуса действия — на каждый способ получения
// (подмножество стейт-машины сервиса, пригодное для ручного управления из
// админки). Возврат (returned) — отдельный сценарий returnFlow, здесь не
// выставляется. Из partially_assembled при доставке предлагаем отгрузку готовой
// части; при самовывозе — только досборку (частичной выдачи нет).
export const ORDER_TRANSITIONS: Record<
  OrderDeliveryMethod,
  Record<OrderLifecycleStatus, OrderTransition[]>
> = {
  delivery: {
    new: [CONFIRM_TRANSITION, CANCEL_TRANSITION],
    confirmed: [START_ASSEMBLY_TRANSITION, CANCEL_TRANSITION],
    assembling: [COMPLETE_ASSEMBLY_TRANSITION, CANCEL_TRANSITION],
    partially_assembled: [SHIP_TRANSITION, CANCEL_TRANSITION],
    assembled: [SHIP_TRANSITION, CANCEL_TRANSITION],
    in_delivery: [
      {
        path: "deliver",
        label: "Mark delivered",
        success: "Order delivered",
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
  pickup: {
    new: [CONFIRM_TRANSITION, CANCEL_TRANSITION],
    confirmed: [START_ASSEMBLY_TRANSITION, CANCEL_TRANSITION],
    assembling: [COMPLETE_ASSEMBLY_TRANSITION, CANCEL_TRANSITION],
    partially_assembled: [CANCEL_TRANSITION],
    // Выдача у окна: приёмка по накладной, код не нужен.
    assembled: [
      {
        path: "deliver",
        label: "Hand over",
        success: "Order handed over",
        needsFulfillment: true,
      },
      CANCEL_TRANSITION,
    ],
    in_delivery: [],
    delivered: [CLOSE_TRANSITION],
    closed: [],
    canceled: [],
    returned: [],
  },
  counter: {
    // Продажа у окна создаётся сразу выданной — new здесь практически
    // недостижим (только откат сбоя), доступна лишь отмена.
    new: [CANCEL_TRANSITION],
    confirmed: [],
    assembling: [],
    partially_assembled: [],
    assembled: [],
    in_delivery: [],
    delivered: [CLOSE_TRANSITION],
    closed: [],
    canceled: [],
    returned: [],
  },
}
