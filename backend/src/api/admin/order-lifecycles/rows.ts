// Данные строки экрана «Заказы» панели продавца (макет 1b) и счётчики заказов
// по статусам для чипов-фильтров. Отдельный файл от роута: роут остаётся тонким,
// вся выборка и счёт — здесь.
//
// Клиент админки тонкий: имя покупателя (компания → ФИО → телефон → почта), признак
// юрлица, число позиций, сумму с валютой, состояние оплаты и адрес доставки
// считаем на бэкенде, а браузер только рисует. Кросс-модульных импортов между
// кастомными модулями нет — читаем через query.graph (ядровый заказ + link-цепочка
// customer → employee → company) и сервис ядрового модуля order (итоги).

import {
  IOrderModuleService,
  RemoteQueryFunction,
} from "@medusajs/framework/types"
import {
  ORDER_STATUSES,
  OrderStatusValue,
} from "../../../modules/order-lifecycle/models/statuses"

type Query = Omit<RemoteQueryFunction, symbol>

// Поля заказа для строки очереди. Итога (`total`) здесь НЕТ намеренно: см.
// loadOrderTotals — query.graph отдаёт по нему неверное значение.
const ORDER_ROW_FIELDS = [
  "id",
  "display_id",
  "email",
  "created_at",
  "currency_code",
  "items.id",
  "payment_collections.status",
  "payment_collections.amount",
  "payment_collections.authorized_amount",
  "payment_collections.captured_amount",
  "customer.first_name",
  "customer.last_name",
  "customer.phone",
  "customer.employee.company.id",
  "customer.employee.company.name",
  "shipping_address.address_1",
  "shipping_address.city",
]

// Состояние оплаты для панели: продавцу важно одно — деньги есть или ждём.
// Нормализуем сами (правило — на бэкенде), клиент только подписывает.
export type OrderPaymentState = "paid" | "awaiting" | "canceled"

// Заказ в строке очереди: ровно то, что рисует таблица 1b. Технических id, кроме
// собственно id заказа и компании (нужны для переходов), здесь нет.
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

// Сырая форма ответа query.graph по заказу (link-поля типизируются генерацией
// .medusa/types — описываем явно, чтобы tsc не зависел от неё).
type RawOrder = {
  id: string
  display_id?: number | null
  email?: string | null
  created_at?: string | Date | null
  currency_code?: string | null
  items?: { id: string }[] | null
  payment_collections?:
    | {
        status?: string | null
        amount?: unknown
        authorized_amount?: unknown
        captured_amount?: unknown
      }[]
    | null
  customer?: {
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    employee?: {
      company?: { id?: string | null; name?: string | null } | null
    } | null
  } | null
  shipping_address?: {
    address_1?: string | null
    city?: string | null
  } | null
}

// Денежные поля ядра приходят либо числом, либо объектом BigNumber (зависит от
// пути выборки) — приводим к числу в одном месте, чтобы на экран не уехало NaN.
export function numericAmount(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value === "object") {
    const numeric = (value as { numeric?: unknown }).numeric
    if (typeof numeric === "number" && Number.isFinite(numeric)) {
      return numeric
    }
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

// Дата в ответе — всегда ISO: драйвер отдаёт Date, а `String(date)` дал бы
// локальную строку сервера, которую клиент разобрать не может.
function isoDate(value: string | Date | null | undefined): string | null {
  if (!value) {
    return null
  }
  return value instanceof Date ? value.toISOString() : value
}

// Человекочитаемое имя плательщика: компания → ФИО → ТЕЛЕФОН → почта (ноль
// технических id на экране). Та же идиома, что в сводке дашборда и в карточке
// заказа. Телефон раньше почты: на MVP покупатель входит по телефону, а почту
// ему заводит система, и очередь показывала «77775550314@phone.invalid» —
// адрес, которого у человека нет (T4.13).
function customerName(order: RawOrder, company: string | null): string | null {
  if (company) {
    return company
  }
  const person = [order.customer?.first_name, order.customer?.last_name]
    .filter((part) => !!part?.trim())
    .join(" ")
    .trim()
  return person || order.customer?.phone?.trim() || order.email || null
}

// Адрес доставки одной строкой: улица + город. Слота доставки в домене пока нет
// (см. docs/modules/logistics.md), поэтому колонка «Доставка» показывает адрес.
function deliveryAddress(order: RawOrder): string | null {
  const parts = [order.shipping_address?.address_1, order.shipping_address?.city]
    .map((part) => part?.trim())
    .filter((part): part is string => !!part)
  return parts.length ? parts.join(", ") : null
}

// Оплата по платёжной сессии заказа: авторизованные и захваченные деньги —
// «оплачен» (Kaspi авторизует сумму счёта), отменённая/провалившаяся сессия —
// «отменена», всё остальное — «ждём оплату». Заказ без платёжной сессии
// (бонусами/нулевой) состояния не имеет.
// С T4.14 оформление списывает платёж сразу, поэтому у новых заказов сходятся
// ОБА поля; авторизованные без списания остаются валидным «оплачен» — так
// читаются заказы, размещённые до правки, и платежи, у которых capture не
// прошёл (их находит скрипт `check-order-captures`).
export function paymentState(order: RawOrder): OrderPaymentState | null {
  const collections = order.payment_collections ?? []
  if (!collections.length) {
    return null
  }

  let awaiting = false
  let canceled = false
  for (const collection of collections) {
    const status = collection.status ?? null
    const captured = numericAmount(collection.captured_amount) ?? 0
    const authorized = numericAmount(collection.authorized_amount) ?? 0

    if (captured > 0 || authorized > 0) {
      return "paid"
    }
    if (status === "completed" || status === "captured") {
      return "paid"
    }
    if (status === "canceled" || status === "failed") {
      canceled = true
      continue
    }
    awaiting = true
  }

  if (awaiting) {
    return "awaiting"
  }
  return canceled ? "canceled" : null
}

export function toRowOrder(
  order: RawOrder,
  total: number | null = null
): AdminOrderLifecycleRowOrder {
  const company = order.customer?.employee?.company ?? null
  const companyName = company?.name?.trim() || null

  return {
    id: order.id,
    display_id: order.display_id ?? null,
    email: order.email ?? null,
    created_at: isoDate(order.created_at),
    customer_name: customerName(order, companyName),
    company_id: company?.id ?? null,
    is_company: !!companyName,
    item_count: order.items?.length ?? 0,
    total,
    currency_code: order.currency_code ?? null,
    payment_state: paymentState(order),
    address: deliveryAddress(order),
  }
}

// Итоги заказов — ТОЛЬКО через сервис ядрового модуля order.
//
// Почему не query.graph: итоги заказа ядро считает при выборке, а не хранит
// колонкой, и через graph поле `total` приходит неверным (проверено на стенде
// 2026-08-04: у заказа №24 при итоге 242 000 ₸ graph отдавал 2 000 ₸ —
// стоимость доставки). Сервис модуля возвращает те же числа, что ядровый
// GET /admin/orders.
export async function loadOrderTotals(
  orderService: IOrderModuleService,
  orderIds: string[]
): Promise<Map<string, number | null>> {
  if (!orderIds.length) {
    return new Map()
  }

  const orders = await orderService.listOrders(
    { id: orderIds },
    { select: ["id", "total"] }
  )

  return new Map(
    orders.map((order) => [order.id, numericAmount(order.total)] as const)
  )
}

// Обогащение страницы очереди: по списку id заказов возвращает карту строк.
// Заказов без ссылки на order (битый link) в карте нет — строка покажет прочерки.
export async function loadRowOrders(
  query: Query,
  orderService: IOrderModuleService,
  orderIds: string[]
): Promise<Map<string, AdminOrderLifecycleRowOrder>> {
  if (!orderIds.length) {
    return new Map()
  }

  const [{ data }, totals] = await Promise.all([
    query.graph({
      entity: "order",
      fields: ORDER_ROW_FIELDS,
      filters: { id: orderIds },
      pagination: { skip: 0, take: orderIds.length },
    }),
    loadOrderTotals(orderService, orderIds),
  ])

  return new Map(
    (data as RawOrder[]).map((order) => [
      order.id,
      toRowOrder(order, totals.get(order.id) ?? null),
    ])
  )
}

// Счётчики для чипов-фильтров: сколько заказов в каждом статусе при текущих
// прочих фильтрах (поиск, способ получения) — и всего. Считаем по одному запросу
// на статус с take:1: нужен точный count из metadata, а не пересчёт усечённой
// страницы (идиома сводки дашборда). Группировку статусов в чипы («Сборка» =
// assembling + partially_assembled) решает экран, счёт — здесь.
export type AdminOrderLifecycleCounts = {
  total: number
  by_status: Record<OrderStatusValue, number>
  // Сколько заказов вышли за срок своей стадии (T4.12): шапка экрана говорит
  // об этом числом, как очередь претензий — о просроченных обращениях.
  overdue: number
}

// Нулевые счётчики без обращения к БД: поиск не нашёл ни одного заказа, считать
// нечего (пустой список id в фильтре query.graph был бы «фильтром без условия»).
export function emptyCounts(): AdminOrderLifecycleCounts {
  const by_status = {} as Record<OrderStatusValue, number>
  for (const status of ORDER_STATUSES) {
    by_status[status] = 0
  }
  return { total: 0, by_status, overdue: 0 }
}

// Просрочку здесь НЕ считаем: её нельзя получить условием запроса (срок зависит
// от статуса), она считается отдельной выборкой — countOverdueOrders в sla.ts,
// и роут доклеивает её к счётчикам.
export async function countByStatus(
  query: Query,
  baseFilters: Record<string, unknown>
): Promise<Omit<AdminOrderLifecycleCounts, "overdue">> {
  const count = async (filters: Record<string, unknown>) => {
    const { metadata } = await query.graph({
      entity: "order_lifecycle",
      fields: ["id"],
      filters,
      pagination: { skip: 0, take: 1 },
    })
    return metadata?.count ?? 0
  }

  const [total, ...perStatus] = await Promise.all([
    count(baseFilters),
    ...ORDER_STATUSES.map((status) => count({ ...baseFilters, status })),
  ])

  const by_status = {} as Record<OrderStatusValue, number>
  ORDER_STATUSES.forEach((status, index) => {
    by_status[status] = perStatus[index]
  })

  return { total, by_status }
}
