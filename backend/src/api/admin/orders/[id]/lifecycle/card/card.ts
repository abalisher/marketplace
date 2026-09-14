// Карточка заказа для drawer'а очереди (макет 1c, T4.2c): всё, что рисует
// карточка, бэкенд отдаёт ОДНИМ ответом — статус и таймлайн переходов,
// покупатель (для юрлица — лимит отсрочки), позиции с итогами, доставка,
// документы. Отдельный файл от роута: роут остаётся тонким, вся выборка здесь
// (идиома order-lifecycles/rows.ts).
//
// Почему один ответ, а не четыре запроса из браузера: клиент админки тонкий —
// человекочитаемое имя плательщика, состояние оплаты, сходящиеся итоги и выбор
// fulfillment'а под отгрузку/вручение считает бэкенд. Плюс drawer открывается
// одним запросом, а не гонкой из четырёх.

import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { DOCUMENTS_MODULE } from "../../../../../../modules/documents"
import DocumentsModuleService from "../../../../../../modules/documents/service"
import { REVIEWS_MODULE } from "../../../../../../modules/reviews"
import ReviewsModuleService from "../../../../../../modules/reviews/service"
import { SCORING_MODULE } from "../../../../../../modules/scoring"
import ScoringModuleService from "../../../../../../modules/scoring/service"
import { serializeDocumentForAdmin } from "../../../../../utils/serialize-document"
import {
  numericAmount,
  paymentState,
  type OrderPaymentState,
} from "../../../../order-lifecycles/rows"
import { loadLifecycleDetail, type LifecycleEvent } from "../lifecycle-detail"
import { isSystemPhoneEmail } from "../../../../../../lib/assistant/tools/buyer-identity"

// Позиция заказа в карточке: подпись варианта отдельно (в таблице она идёт
// второй строкой), количество и деньги — числами.
export type OrderCardItem = {
  id: string
  title: string
  variant_title: string | null
  quantity: number
  unit_price: number | null
  total: number | null
}

// Итоги карточки. Деньги должны СХОДИТЬСЯ на экране: «Товары» + «Доставка»
// − «Скидка» = «Итого» (грабля T3.11: ядровый `subtotal` включает доставку,
// поэтому строкой «Товары» берём item_total, а не subtotal).
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

// Лимит отсрочки юрлица (модуль scoring): эффективный лимит и свободная часть.
// null — заказ физлица либо скоринг по компании ещё не считался.
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
  // Слот доставки (T5.6): дата в астанинских сутках и окно приезда. Подпись
  // собирает панель на своём языке — сюда уходят коды.
  slot_date: string | null
  slot_window: string | null
}

// Цели переходов, которым нужны технические id (сборка/отгрузка/вручение):
// какие позиции собирать и какой fulfillment отгружать/вручать — выбирает
// бэкенд. На экране этих id нет, drawer только передаёт их обратно в переход.
// Активная претензия по заказу (модуль reviews): претензию продавец обязан
// видеть, ОТКРЫВ заказ, а не в конце другого раздела — Асель (Ф-прогон
// 2026-08-18): «нигде вверху не написано, что по этому заказу есть претензия».
// Закрытые претензии здесь не показываем: по ним делать нечего, вся история —
// на экране «Претензии».
export type OrderCardDispute = {
  id: string
  category: string
  status: string
  description: string
  created_at: string | null
}

export type OrderCardTransitionTargets = {
  items: { id: string; quantity: number }[]
  ship_fulfillment_id: string | null
  deliver_fulfillment_id: string | null
}

export type AdminOrderCard = {
  order_id: string
  display_id: number | null
  created_at: string | null
  status: string | null
  previous_status: string | null
  note: string | null
  delivery_method: string | null
  history: LifecycleEvent[]
  customer: OrderCardCustomer
  credit: OrderCardCredit | null
  items: OrderCardItem[]
  totals: OrderCardTotals
  payment_state: OrderPaymentState | null
  delivery: OrderCardDelivery
  documents: ReturnType<typeof serializeDocumentForAdmin>[]
  active_dispute: OrderCardDispute | null
  transition_targets: OrderCardTransitionTargets
}

// --- Сырые формы выборок (link-поля типизируются генерацией .medusa/types —
// описываем явно, чтобы tsc не зависел от неё) ---

export type RawCardCompany = {
  id?: string | null
  name?: string | null
  bin?: string | null
}

export type RawCardOrder = {
  id: string
  display_id?: number | null
  email?: string | null
  created_at?: string | Date | null
  company?: RawCardCompany | null
  customer?: {
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    employee?: { company?: RawCardCompany | null } | null
  } | null
  payment_collections?:
    | {
        status?: string | null
        amount?: unknown
        authorized_amount?: unknown
        captured_amount?: unknown
      }[]
    | null
  fulfillments?: RawCardFulfillment[] | null
}

export type RawCardFulfillment = {
  id: string
  shipped_at?: string | Date | null
  delivered_at?: string | Date | null
  canceled_at?: string | Date | null
}

// Поля заказа для карточки. Итогов и позиций здесь НЕТ намеренно: деньги и
// количества ядро отдаёт надёжно только сервисом модуля order (см. rows.ts
// loadOrderTotals и get-order-items).
const CARD_ORDER_FIELDS = [
  "id",
  "display_id",
  "email",
  "created_at",
  "company.id",
  "company.name",
  "company.bin",
  "customer.first_name",
  "customer.last_name",
  "customer.phone",
  "customer.employee.company.id",
  "customer.employee.company.name",
  "customer.employee.company.bin",
  "payment_collections.status",
  "payment_collections.amount",
  "payment_collections.authorized_amount",
  "payment_collections.captured_amount",
  "fulfillments.id",
  "fulfillments.shipped_at",
  "fulfillments.delivered_at",
  "fulfillments.canceled_at",
]

function isoDate(value: string | Date | null | undefined): string | null {
  if (!value) {
    return null
  }
  return value instanceof Date ? value.toISOString() : value
}

// Компания заказа: сначала прямой link заказа (его ставит placeOrder — именно
// это юрлицо в документах), затем компания сотрудника. Разница бывает у
// заказов, оформленных до вступления покупателя в компанию: лимит отсрочки в
// карточке должен относиться к компании ЗАКАЗА, а не к текущей компании
// покупателя.
export function cardCompany(order: RawCardOrder): RawCardCompany | null {
  const direct = order.company ?? null
  if (direct?.id) {
    return direct
  }
  const employed = order.customer?.employee?.company ?? null
  return employed?.id ? employed : null
}

// Плательщик человекочитаемо: компания → ФИО → ТЕЛЕФОН → почта (та же идиома,
// что в строке очереди — ноль технических id на экране). Телефон стоит раньше
// почты, потому что на MVP покупатель входит по телефону, а почту ему заводит
// система: без имени карточка показывала «77775550314@phone.invalid» — адрес,
// которого у человека нет (T4.13, находка Ф-прогона Асель).
export function cardCustomer(order: RawCardOrder): OrderCardCustomer {
  const company = cardCompany(order)
  const companyName = company?.name?.trim() || null
  const person = [order.customer?.first_name, order.customer?.last_name]
    .filter((part) => !!part?.trim())
    .join(" ")
    .trim()
  const phone = order.customer?.phone?.trim() || null

  return {
    name: companyName || person || phone || order.email || null,
    // Системную почту телефонного покупателя не отдаём вовсе: строка «Почта:
    // 77756555906@phone.invalid» читается сотрудником как контакт, которого не
    // существует (найдено на совместном прогоне 2026-09-06).
    email: isSystemPhoneEmail(order.email) ? null : (order.email ?? null),
    phone,
    is_company: !!companyName,
    company_id: company?.id ?? null,
    company_name: companyName,
    company_bin: company?.bin?.trim() || null,
  }
}

// Fulfillment под переходы: для отгрузки — ещё не отгруженный, для вручения —
// отгруженный, но не доставленный (оба без отмены). Правило переехало из
// виджета страницы заказа: там его считал браузер по данным ядровой страницы,
// drawer'у ядровой страницы не видно.
export function cardTransitionTargets(
  items: OrderCardItem[],
  fulfillments: RawCardFulfillment[]
): OrderCardTransitionTargets {
  const live = fulfillments.filter((f) => !f.canceled_at)

  return {
    items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
    ship_fulfillment_id:
      live.find((f) => !f.shipped_at)?.id ?? live[0]?.id ?? null,
    deliver_fulfillment_id:
      live.find((f) => f.shipped_at && !f.delivered_at)?.id ??
      live.find((f) => !f.delivered_at)?.id ??
      null,
  }
}

type ServiceOrderItem = {
  id: string
  title?: string | null
  product_title?: string | null
  variant_title?: string | null
  quantity: unknown
  unit_price: unknown
  total?: unknown
}

export function cardItems(items: ServiceOrderItem[]): OrderCardItem[] {
  return items.map((item) => {
    const quantity = numericAmount(item.quantity) ?? 0
    const unitPrice = numericAmount(item.unit_price)
    const total = numericAmount(item.total)
    return {
      id: item.id,
      title: item.title ?? item.product_title ?? "—",
      variant_title: item.variant_title ?? null,
      quantity,
      unit_price: unitPrice,
      total: total ?? (unitPrice != null ? unitPrice * quantity : null),
    }
  })
}

type ServiceTotalsRow = {
  total?: unknown
  item_total?: unknown
  shipping_total?: unknown
  discount_total?: unknown
  currency_code?: unknown
}

type ServiceShippingMethod = { total?: unknown; amount?: unknown }

// Итоги — из выборки сервиса модуля order. Поля, которых выборка не дала,
// добираем из позиций и способов доставки: карточка без сходящихся денег
// продавцу бесполезна (третий случай того же класса после T4.2a, T4.9 и T3.11 —
// на итоги ядра нельзя смотреть по имени поля).
export function cardTotals(
  row: ServiceTotalsRow | null | undefined,
  items: OrderCardItem[],
  shippingMethods: ServiceShippingMethod[],
  currencyCode: string | null
): OrderCardTotals {
  const sumItems = items.reduce((sum, item) => sum + (item.total ?? 0), 0)
  const sumShipping = shippingMethods.reduce(
    (sum, method) =>
      sum + (numericAmount(method.total) ?? numericAmount(method.amount) ?? 0),
    0
  )

  const itemTotal = numericAmount(row?.item_total)
  const shippingTotal = numericAmount(row?.shipping_total)

  return {
    item_total: itemTotal ?? (items.length ? sumItems : null),
    shipping_total: shippingTotal ?? (shippingMethods.length ? sumShipping : null),
    discount_total: numericAmount(row?.discount_total),
    total: numericAmount(row?.total),
    currency_code:
      currencyCode ??
      (typeof row?.currency_code === "string" ? row.currency_code : null),
  }
}

type ServiceAddress = {
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  city?: string | null
  postal_code?: string | null
  phone?: string | null
} | null

export function cardDelivery(
  address: ServiceAddress,
  shippingMethods: { name?: string | null }[],
  customerPhone: string | null,
  // Слот заказа (T5.6) приходит из нашего lifecycle, а не из ядрового адреса:
  // «когда везти» — наш домен, ядро о слотах не знает.
  slot: { date: string | null; window: string | null } = {
    date: null,
    window: null,
  }
): OrderCardDelivery {
  const recipient = [address?.first_name, address?.last_name]
    .filter((part) => !!part?.trim())
    .join(" ")
    .trim()

  return {
    recipient: recipient || null,
    address: address?.address_1?.trim() || null,
    city: address?.city?.trim() || null,
    postal_code: address?.postal_code?.trim() || null,
    // Телефон адреса точнее профильного: его покупатель называет под доставку.
    phone: address?.phone?.trim() || customerPhone || null,
    shipping_method: shippingMethods[0]?.name?.trim() || null,
    slot_date: slot.date,
    slot_window: slot.window,
  }
}

// Полная сборка карточки. Читает: наш lifecycle (статус + лог), ядровый заказ
// (query.graph — плательщик, оплата, fulfillment'ы; сервис order — позиции,
// адрес, способ доставки, итоги), документы заказа и лимит отсрочки компании.
export async function buildOrderCard(
  scope: MedusaContainer,
  orderId: string
): Promise<AdminOrderCard> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const orderService = scope.resolve(Modules.ORDER)

  // Заказа нет → 404 бросает загрузчик статуса (он же читает order).
  const [lifecycle, { data: rawOrders }, detail, totalsRows] = await Promise.all(
    [
      loadLifecycleDetail(scope, orderId),
      query.graph({
        entity: "order",
        fields: CARD_ORDER_FIELDS,
        filters: { id: orderId },
      }),
      orderService.retrieveOrder(orderId, {
        relations: ["items", "shipping_methods", "shipping_address"],
      }),
      orderService.listOrders(
        { id: orderId },
        {
          select: [
            "id",
            "total",
            "item_total",
            "shipping_total",
            "discount_total",
            "currency_code",
          ],
        }
      ),
    ]
  )

  const raw = (rawOrders as RawCardOrder[])[0] ?? { id: orderId }
  const customer = cardCustomer(raw)
  const items = cardItems((detail.items ?? []) as ServiceOrderItem[])
  const shippingMethods = (detail.shipping_methods ?? []) as (
    | ServiceShippingMethod & { name?: string | null }
  )[]

  const reviewsService = scope.resolve<ReviewsModuleService>(REVIEWS_MODULE)
  const [activeDispute] = (await reviewsService.listDisputes(
    { order_id: orderId, status: ["open", "in_review"] },
    { take: 1, order: { created_at: "DESC" } }
  )) as unknown as {
    id: string
    category: string
    status: string
    description: string
    created_at?: Date | string | null
  }[]

  const documentsService =
    scope.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  // В карточке — только актуальные версии документов: продавцу нужно «что есть
  // по заказу», вся история версий остаётся на странице заказа (widget).
  const documents = await documentsService.listDocuments(
    { order_id: orderId, is_latest: true },
    { order: { created_at: "DESC" } }
  )

  let credit: OrderCardCredit | null = null
  if (customer.company_id) {
    const scoring = scope.resolve<ScoringModuleService>(SCORING_MODULE)
    const card = await scoring.getScoreCard(customer.company_id)
    if (card) {
      const limit =
        card.manual_limit != null
          ? Number(card.manual_limit)
          : Number(card.credit_limit)
      credit = {
        limit,
        available: await scoring.availableCredit(customer.company_id),
        reserved: Number(card.reserved),
      }
    }
  }

  return {
    order_id: orderId,
    display_id: detail.display_id ?? raw.display_id ?? null,
    created_at: isoDate(detail.created_at ?? raw.created_at),
    status: lifecycle.status,
    previous_status: lifecycle.previous_status,
    note: lifecycle.note,
    delivery_method: lifecycle.delivery_method,
    history: lifecycle.history,
    customer,
    credit,
    items,
    totals: cardTotals(
      totalsRows[0],
      items,
      shippingMethods,
      detail.currency_code ?? null
    ),
    payment_state: paymentState(raw),
    delivery: cardDelivery(
      (detail.shipping_address ?? null) as ServiceAddress,
      shippingMethods,
      customer.phone,
      { date: lifecycle.delivery_date, window: lifecycle.delivery_window }
    ),
    documents: documents.map(serializeDocumentForAdmin),
    active_dispute: activeDispute
      ? {
          id: activeDispute.id,
          category: activeDispute.category,
          status: activeDispute.status,
          description: activeDispute.description,
          created_at: isoDate(activeDispute.created_at),
        }
      : null,
    transition_targets: cardTransitionTargets(items, raw.fulfillments ?? []),
  }
}
