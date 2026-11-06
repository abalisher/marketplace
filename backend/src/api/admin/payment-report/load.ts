import { parseOrderNumberQuery } from "../../../lib/orders/order-number"
import { IUserModuleService, MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { ORDER_PAYMENT_MODULE } from "../../../modules/order-payment"
import OrderPaymentModuleService from "../../../modules/order-payment/service"
import type { OrderPaymentStatus } from "../../../modules/order-payment/models/values"
import { numericAmount } from "../../../lib/payments/amount"
import {
  isDebtOverdue,
  outstandingAmount,
  roundMoney,
} from "../../../lib/payments/order-payment-state"
import { factsOf, OrderPaymentRow } from "../../../workflows/payments/steps/order-payment-row"
import { listPaymentSellers } from "../payment-settings/helpers"
import { loadUserNames } from "../user-names"

// Отчёт по оплатам: журнал движений денег и долги покупателей. Продавец
// компании видит только свой канал (фильтр ставит роут), площадка — всех или
// одного продавца.

type OrderPaymentInfo = OrderPaymentRow & {
  order_display_id: number | null
  order_number?: string | null
  customer_id: string | null
  customer_name: string | null
  customer_phone: string | null
  currency_code: string
  created_at: Date | string
}

type EntryWithPayment = {
  id: string
  kind: "payment" | "refund"
  channel: string
  amount: unknown
  sales_channel_id: string | null
  actor_type: string
  actor_id: string | null
  note: string | null
  occurred_at: Date | string
  order_payment: OrderPaymentInfo
}

const iso = (value: Date | string | null | undefined) =>
  value ? new Date(value).toISOString() : null

const matchesQuery = (payment: OrderPaymentInfo, q?: string) => {
  if (!q) {
    return true
  }
  const needle = q.toLowerCase().replace(/^№\s*/, "")
  const digits = needle.replace(/\D+/g, "")
  // Номер заказа: «ORG-26-0007» целиком или его хвост «7»; у старых — display_id.
  const asNumber = parseOrderNumberQuery(q)
  const number = payment.order_number ?? ""
  const numberMatches =
    !!asNumber &&
    ("number" in asNumber
      ? number === asNumber.number
      : number.endsWith(`-${String(asNumber.digits).padStart(4, "0")}`) ||
        payment.order_display_id === asNumber.digits)
  return (
    (payment.customer_name ?? "").toLowerCase().includes(needle) ||
    (!!digits && (payment.customer_phone ?? "").replace(/\D+/g, "").includes(digits)) ||
    numberMatches
  )
}

const sellerNames = async (container: MedusaContainer) =>
  new Map(
    (await listPaymentSellers(container)).map((seller) => [
      seller.sales_channel_id,
      seller.name,
    ])
  )

export type PaymentEntriesFilter = {
  sales_channel_id?: string
  from?: Date
  to?: Date
  kind?: "payment" | "refund"
  channel?: string
  q?: string
}

export const loadPaymentEntries = async (
  container: MedusaContainer,
  filter: PaymentEntriesFilter
) => {
  const service = container.resolve<OrderPaymentModuleService>(ORDER_PAYMENT_MODULE)
  const occurred: Record<string, Date> = {}
  if (filter.from) {
    occurred.$gte = filter.from
  }
  if (filter.to) {
    occurred.$lt = filter.to
  }
  const rows = (await service.listPaymentEntries(
    {
      ...(filter.sales_channel_id ? { sales_channel_id: filter.sales_channel_id } : {}),
      ...(Object.keys(occurred).length ? { occurred_at: occurred } : {}),
      ...(filter.kind ? { kind: filter.kind } : {}),
      ...(filter.channel ? { channel: filter.channel } : {}),
    } as never,
    {
      take: null,
      relations: ["order_payment"],
      order: { occurred_at: "DESC" },
    }
  )) as unknown as EntryWithPayment[]

  const entries = rows.filter((entry) => matchesQuery(entry.order_payment, filter.q))
  const [names, sellers] = await Promise.all([
    loadUserNames(
      container.resolve<IUserModuleService>(Modules.USER),
      [...new Set(entries.map((e) => e.actor_id).filter((id): id is string => !!id))]
    ),
    sellerNames(container),
  ])

  const byChannel: Record<string, number> = {}
  let received = 0
  let refunded = 0
  for (const entry of entries) {
    const amount = numericAmount(entry.amount) ?? 0
    if (entry.kind === "payment") {
      received += amount
      byChannel[entry.channel] = roundMoney((byChannel[entry.channel] ?? 0) + amount)
    } else {
      refunded += amount
      byChannel[entry.channel] = roundMoney((byChannel[entry.channel] ?? 0) - amount)
    }
  }

  return {
    rows: entries.map((entry) => ({
      id: entry.id,
      occurred_at: iso(entry.occurred_at),
      kind: entry.kind,
      channel: entry.channel,
      amount: numericAmount(entry.amount) ?? 0,
      note: entry.note,
      actor_type: entry.actor_type,
      actor_name: entry.actor_id ? names.get(entry.actor_id) ?? null : null,
      order_id: entry.order_payment.order_id,
      order_display_id: entry.order_payment.order_display_id,
      order_number: entry.order_payment.order_number ?? null,
      method: entry.order_payment.method,
      customer_name: entry.order_payment.customer_name,
      customer_phone: entry.order_payment.customer_phone,
      seller_name: entry.sales_channel_id ? sellers.get(entry.sales_channel_id) ?? null : null,
    })),
    totals: {
      received: roundMoney(received),
      refunded: roundMoney(refunded),
      net: roundMoney(received - refunded),
      by_channel: byChannel,
      count: entries.length,
    },
  }
}

export type DebtsFilter = {
  sales_channel_id?: string
  state: "open" | "requested" | "closed" | "all"
  q?: string
}

const DEBT_STATUSES: Record<DebtsFilter["state"], OrderPaymentStatus[]> = {
  open: ["debt"],
  requested: ["debt_requested"],
  closed: ["paid"],
  all: ["debt_requested", "debt", "paid", "canceled", "refund_due", "refunded"],
}

const DAY_MS = 24 * 3_600_000

export const loadDebts = async (
  container: MedusaContainer,
  filter: DebtsFilter,
  now: Date = new Date()
) => {
  const service = container.resolve<OrderPaymentModuleService>(ORDER_PAYMENT_MODULE)
  const scope = filter.sales_channel_id ? { sales_channel_id: filter.sales_channel_id } : {}

  // Список — по выбранному состоянию; итоги — всегда по всем долгам продавца,
  // чтобы шапка отчёта не менялась от вкладки.
  const all = (await service.listOrderPayments(
    { method: "debt", ...scope } as never,
    { take: null, order: { created_at: "DESC" } }
  )) as unknown as OrderPaymentInfo[]
  const sellers = await sellerNames(container)

  let outstanding = 0
  let overdue = 0
  let requestedAmount = 0
  let requestedCount = 0
  let openCount = 0
  const buyers = new Set<string>()
  for (const payment of all) {
    const facts = factsOf(payment)
    if (payment.status === "debt") {
      const left = outstandingAmount(facts)
      outstanding += left
      openCount += 1
      buyers.add(payment.customer_id ?? payment.customer_phone ?? payment.id)
      if (isDebtOverdue(payment.status, payment.due_date, now)) {
        overdue += left
      }
    } else if (payment.status === "debt_requested") {
      requestedAmount += facts.amount
      requestedCount += 1
    }
  }

  const statuses = DEBT_STATUSES[filter.state]
  const rows = all
    .filter((payment) => statuses.includes(payment.status))
    .filter((payment) => matchesQuery(payment, filter.q))
    .map((payment) => {
      const facts = factsOf(payment)
      const isOverdue = isDebtOverdue(payment.status, payment.due_date, now)
      return {
        order_id: payment.order_id,
        order_display_id: payment.order_display_id,
        order_number: payment.order_number ?? null,
        customer_name: payment.customer_name,
        customer_phone: payment.customer_phone,
        status: payment.status,
        amount: facts.amount,
        paid_amount: facts.paid_amount,
        outstanding: outstandingAmount(facts),
        created_at: iso(payment.created_at),
        approved_at: iso(payment.approved_at),
        due_date: iso(payment.due_date),
        overdue: isOverdue,
        overdue_days: isOverdue
          ? Math.floor((now.getTime() - new Date(payment.due_date!).getTime()) / DAY_MS)
          : 0,
        seller_name: payment.sales_channel_id ? sellers.get(payment.sales_channel_id) ?? null : null,
      }
    })
    // Просроченные — первыми, дальше по сроку.
    .sort((a, b) => {
      if (a.overdue !== b.overdue) {
        return a.overdue ? -1 : 1
      }
      const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity
      const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity
      return ad - bd
    })

  return {
    rows,
    totals: {
      outstanding: roundMoney(outstanding),
      overdue: roundMoney(overdue),
      open_count: openCount,
      buyers: buyers.size,
      requested_count: requestedCount,
      requested_amount: roundMoney(requestedAmount),
    },
  }
}
