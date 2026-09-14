// Сборка сводки дня для дашборда продавца. Отдельный файл от роута: роут —
// тонкий, вся выборка и счёт здесь. Данные читаются из ядра (заказы, товары,
// остатки) и из модулей procurement и reviews; кросс-модульных импортов между
// кастомными модулями нет — только query.graph и сервисы модулей (правила
// CLAUDE.md).

import {
  IOrderModuleService,
  RemoteQueryFunction,
} from "@medusajs/framework/types"
import { OrderStatusValue } from "../../../modules/order-lifecycle/models/statuses"
import ProcurementModuleService from "../../../modules/procurement/service"
import ReviewsModuleService from "../../../modules/reviews/service"
import {
  ACTIVE_DISPUTE_STATUSES,
  ageHours,
  disputeSlaHours,
} from "../disputes/rows"
import { loadOrderTotals } from "../order-lifecycles/rows"
import { orderQueueTiming, orderSlaHours } from "../order-lifecycles/sla"
import OrderLifecycleModuleService from "../../../modules/order-lifecycle/service"
import { loadPriceStockSlice } from "../price-stock/load"
import { priceStockRowTitle } from "../price-stock/rows"
import {
  MONEY_SCAN_CAP,
  OPEN_ORDER_STATUSES,
  QUEUE_PREVIEW_LIMIT,
  RECEIPTS_PREVIEW_LIMIT,
  STOCK_PREVIEW_LIMIT,
} from "./constants"
import { DashboardMoney, loadDashboardMoney } from "./money"
import { OrderStageReport, loadOrderStageReport } from "./stages"

type Query = Omit<RemoteQueryFunction, symbol>

export type DashboardOrderRow = {
  order_id: string
  display_id: number | null
  customer: string | null
  status: OrderStatusValue
  item_count: number
  total: number | null
  currency_code: string | null
  created_at: string
  // Сколько заказ стоит в текущем статусе и вышел ли за срок стадии (T4.12):
  // без этого в панели не было видно, что заказ висит шестой день.
  status_hours: number
  overdue: boolean
}

export type DashboardStockRow = {
  id: string
  title: string | null
  sku: string | null
  available: number
}

export type DashboardReceiptRow = {
  id: string
  reference: string | null
  supplier: string | null
  status: string
  source: string
  total_cost: number
  created_at: string
}

export type DashboardSummary = {
  orders: {
    open_count: number
    counts: Record<string, number>
    // Заказы, вышедшие за срок своей стадии, и время самого залежавшегося.
    overdue_count: number
    oldest_waiting_hours: number | null
    queue: DashboardOrderRow[]
  }
  // Деньги дня (money.ts) и отчёт по стадиям со средним временем (stages.ts):
  // без них дашборд не отвечал ни на один вопрос управляющего.
  money: DashboardMoney
  stages: OrderStageReport
  disputes: {
    open_count: number
    overdue_count: number
    oldest_waiting_hours: number | null
  }
  moderation: {
    pending_count: number
    oldest_waiting_hours: number | null
  }
  stock: {
    low_count: number
    zero_count: number
    threshold: number
    items: DashboardStockRow[]
  }
  receipts: {
    open_count: number
    draft_count: number
    ai_count: number
    items: DashboardReceiptRow[]
  }
}

// --- Заказы -----------------------------------------------------------------

// Счётчики по статусам — отдельным запросом на статус с take:1: нужен точный
// count из metadata, а не пересчёт усечённой выборки.
async function countByStatus(
  query: Query,
  status: OrderStatusValue
): Promise<number> {
  const { metadata } = await query.graph({
    entity: "order_lifecycle",
    fields: ["id"],
    filters: { status },
    pagination: { skip: 0, take: 1 },
  })
  return metadata?.count ?? 0
}

// Очередь дашборда — самые старые ожидающие заказы: их и надо разобрать первыми.
// Итоги берём сервисом модуля order, а не полем graph: ядро считает их при
// выборке, и через graph `total` приходит неверным (см. loadOrderTotals).
async function loadQueue(
  query: Query,
  orderService: IOrderModuleService
): Promise<DashboardOrderRow[]> {
  const { data } = await query.graph({
    entity: "order_lifecycle",
    fields: ["id", "status", "created_at", "updated_at", "order.id"],
    filters: { status: OPEN_ORDER_STATUSES },
    pagination: {
      skip: 0,
      take: QUEUE_PREVIEW_LIMIT,
      order: { created_at: "ASC" },
    },
  })

  const lifecycles = data as {
    status: OrderStatusValue
    created_at: string
    updated_at?: string | null
    order?: { id: string } | null
  }[]

  const orderIds = lifecycles
    .map((lifecycle) => lifecycle.order?.id)
    .filter((id): id is string => !!id)
  if (!orderIds.length) {
    return []
  }

  const totals = await loadOrderTotals(orderService, orderIds)
  const sla = orderSlaHours()
  const now = Date.now()

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "items.id",
      "customer.first_name",
      "customer.last_name",
      "customer.company_name",
    ],
    filters: { id: orderIds },
  })

  const byId = new Map(
    (
      orders as {
        id: string
        display_id?: number | null
        email?: string | null
        currency_code?: string | null
        items?: { id: string }[] | null
        customer?: {
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
        } | null
      }[]
    ).map((order) => [order.id, order])
  )

  return lifecycles
    .filter((lifecycle) => lifecycle.order?.id)
    .map((lifecycle) => {
      const order = byId.get(lifecycle.order!.id)
      const timing = orderQueueTiming(lifecycle, sla, now)
      return {
        order_id: lifecycle.order!.id,
        display_id: order?.display_id ?? null,
        customer: customerName(order),
        status: lifecycle.status,
        item_count: order?.items?.length ?? 0,
        total: totals.get(lifecycle.order!.id) ?? null,
        currency_code: order?.currency_code ?? null,
        created_at: lifecycle.created_at,
        status_hours: timing.status_hours,
        overdue: timing.overdue,
      }
    })
}

// Просрочка по всей очереди, а не только по пяти строкам предпросмотра: плитка
// «Заказы» должна краснеть от того, что где-то на третьей странице заказ стоит
// шестой день. Читаем открытые статусы до потолка выборки — счёт дешёвый
// (три поля на строку), а число заказов у одного магазина невелико.
//
// ЗАЧЕМ вообще. Уведомлений продавцу система не рассылает (канала нет: решение
// владельца 2026-08-18 — «канал один, чат» — про покупателя), поэтому единственный
// сигнал «на тебя висит просрочка» — сама панель. Дашборд обязан показывать её
// числом, иначе карточка ждёт 508 часов и об этом никто не узнаёт.
async function loadOverdue(
  query: Query
): Promise<{ overdue_count: number; oldest_waiting_hours: number | null }> {
  const { data } = await query.graph({
    entity: "order_lifecycle",
    fields: ["id", "status", "created_at", "updated_at"],
    filters: { status: OPEN_ORDER_STATUSES },
    pagination: { skip: 0, take: MONEY_SCAN_CAP },
  })

  const sla = orderSlaHours()
  const now = Date.now()
  const timings = (
    data as {
      status: OrderStatusValue
      created_at?: string | null
      updated_at?: string | null
    }[]
  ).map((lifecycle) => orderQueueTiming(lifecycle, sla, now))

  return {
    overdue_count: timings.filter((timing) => timing.overdue).length,
    oldest_waiting_hours: timings.length
      ? Math.max(...timings.map((timing) => timing.status_hours))
      : null,
  }
}

// Человекочитаемое имя плательщика: компания → ФИО → почта (ноль технических id).
function customerName(order?: {
  email?: string | null
  customer?: {
    first_name?: string | null
    last_name?: string | null
    company_name?: string | null
  } | null
}): string | null {
  if (!order) {
    return null
  }
  const company = order.customer?.company_name?.trim()
  if (company) {
    return company
  }
  const person = [order.customer?.first_name, order.customer?.last_name]
    .filter((part) => !!part?.trim())
    .join(" ")
    .trim()
  return person || order.email || null
}

// --- Претензии ---------------------------------------------------------------

// Плитка претензий (T4.11, МЕШАЕТ 8 Асель: «утром я не вижу свою очередь —
// сколько открыто, что висит третий день»): сколько активных, сколько
// просрочено по сроку ответа и сколько висит самая старая.
async function loadDisputes(
  reviewsService: ReviewsModuleService
): Promise<DashboardSummary["disputes"]> {
  const active = (await reviewsService.listDisputes(
    { status: ACTIVE_DISPUTE_STATUSES },
    { select: ["id", "created_at"], order: { created_at: "ASC" } }
  )) as { created_at?: Date | string | null }[]

  const now = Date.now()
  const slaHours = disputeSlaHours()
  const ages = active.map((dispute) => ageHours(dispute.created_at, now))

  return {
    open_count: active.length,
    overdue_count: ages.filter((age) => age >= slaHours).length,
    oldest_waiting_hours: ages.length ? Math.max(...ages) : null,
  }
}

// --- Модерация карточек -----------------------------------------------------

async function loadModeration(
  query: Query
): Promise<DashboardSummary["moderation"]> {
  const { data, metadata } = await query.graph({
    entity: "product",
    fields: ["id", "updated_at"],
    filters: { status: "proposed" },
    pagination: { skip: 0, take: 1, order: { updated_at: "ASC" } },
  })

  const oldest = (data as { updated_at?: string | null }[])[0]?.updated_at
  const hours = oldest
    ? Math.max(
        0,
        Math.floor((Date.now() - new Date(oldest).getTime()) / 3_600_000)
      )
    : null

  return { pending_count: metadata?.count ?? 0, oldest_waiting_hours: hours }
}

// --- Остатки ----------------------------------------------------------------

// Плитка «Низкие остатки» считает ТОТ ЖЕ срез, что экран «Цены и остатки»:
// покупаемые позиции (товар → вариант → остаток), а не складские позиции ядра.
//
// ЗАЧЕМ. Дашборд считал сущности inventory_item, и в счёт попадала складская
// позиция, заведённая приходом БЕЗ варианта товара: плитка показывала «1 — ноль
// на складе», а на экране остатков чипы «нет в наличии 0» и самой позиции не
// было. Кладовщик шёл по плитке искать ноль и не находил (Ф-прогон Данияра
// 2026-09-02, «мешает» №4). Теперь плитка и экран считают по одному срезу — их
// числа расходиться не могут, а безкарточные складские позиции остаются в
// ядровом «Складе» у владельца (их место — приёмка, а не витрина).
async function loadStock(query: Query): Promise<DashboardSummary["stock"]> {
  const { rows, counts, threshold } = await loadPriceStockSlice(query, {
    stock: "low",
  })

  const low = [...rows].sort((a, b) => a.available - b.available)

  return {
    low_count: counts.low,
    zero_count: counts.zero,
    threshold,
    items: low.slice(0, STOCK_PREVIEW_LIMIT).map((row) => ({
      // id строки — вариант: по нему плитка и экран говорят об одной позиции.
      id: row.variant_id,
      title: priceStockRowTitle(row),
      sku: row.sku,
      available: row.available,
    })),
  }
}

// --- Приходы ----------------------------------------------------------------

async function loadReceipts(
  service: ProcurementModuleService
): Promise<DashboardSummary["receipts"]> {
  const drafts = await service.listReceipts(
    { status: "draft" },
    { order: { created_at: "DESC" } }
  )
  const suppliers = await service.listSuppliers({})
  const supplierNames = new Map(
    suppliers.map((supplier) => [supplier.id, supplier.name])
  )

  return {
    open_count: drafts.length,
    draft_count: drafts.filter((receipt) => receipt.source === "manual").length,
    ai_count: drafts.filter((receipt) => receipt.source !== "manual").length,
    items: drafts.slice(0, RECEIPTS_PREVIEW_LIMIT).map((receipt) => ({
      id: receipt.id,
      reference: receipt.reference ?? null,
      supplier: receipt.supplier_id
        ? (supplierNames.get(receipt.supplier_id) ?? null)
        : null,
      status: receipt.status,
      source: receipt.source,
      total_cost: Number(receipt.total_cost ?? 0),
      created_at: String(receipt.created_at),
    })),
  }
}

// --- Сводка -----------------------------------------------------------------

export async function buildDashboardSummary(
  query: Query,
  procurement: ProcurementModuleService,
  orderService: IOrderModuleService,
  reviewsService: ReviewsModuleService,
  lifecycleService: OrderLifecycleModuleService
): Promise<DashboardSummary> {
  const [
    statusCounts,
    queue,
    overdue,
    moderation,
    stock,
    receipts,
    disputes,
    money,
    stages,
  ] = await Promise.all([
    Promise.all(
      OPEN_ORDER_STATUSES.map(async (status) => ({
        status,
        count: await countByStatus(query, status),
      }))
    ),
    loadQueue(query, orderService),
    loadOverdue(query),
    loadModeration(query),
    loadStock(query),
    loadReceipts(procurement),
    loadDisputes(reviewsService),
    loadDashboardMoney(query, orderService),
    loadOrderStageReport(query, lifecycleService),
  ])

  const counts: Record<string, number> = {}
  let openCount = 0
  for (const { status, count } of statusCounts) {
    counts[status] = count
    openCount += count
  }

  return {
    orders: { open_count: openCount, counts, ...overdue, queue },
    money,
    stages,
    disputes,
    moderation,
    stock,
    receipts,
  }
}
