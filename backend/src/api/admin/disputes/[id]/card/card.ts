// Рабочее место претензии (T4.11): всё, что нужно оператору для решения, бэкенд
// отдаёт ОДНИМ ответом — сама претензия со сроком, заказ целиком (состав, деньги,
// стадии, документы), отзывы по заказу и история обращений этого покупателя.
// Отдельный файл от роута: роут остаётся тонким, вся выборка здесь (идиома
// order-lifecycles/rows.ts и карточки заказа).
//
// Почему заказ берём готовой карточкой заказа (buildOrderCard), а не своей
// выборкой: Асель (Ф-прогон 2026-08-18) не могла принять решение именно потому,
// что из претензии не попасть в заказ — «жалуется на цемент, а в заказе вата».
// Состав, суммы, стадии и документы должны быть теми же, что видит продавец на
// экране заказа, иначе спор о претензии превратится в спор о данных.

import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { REVIEWS_MODULE } from "../../../../../modules/reviews"
import ReviewsModuleService from "../../../../../modules/reviews/service"
import {
  AdminOrderCard,
  buildOrderCard,
} from "../../../orders/[id]/lifecycle/card/card"
import {
  serializeDisputeForAdmin,
  serializeReviewForAdmin,
} from "../../../../utils/serialize-review"
import { ageHours, disputeSlaHours, isOverdue } from "../../rows"

// Прочие обращения того же покупателя — короткой строкой: номер заказа,
// категория, статус, последствие. Отвечает на вопрос «жалуется ли он на каждую
// поставку» (МЕШАЕТ 7 Асель), на котором и строится решение.
export type DisputeHistoryEntry = {
  id: string
  order_id: string
  order_display_id: number | null
  category: string
  status: string
  outcome: string | null
  created_at: string | null
}

export type DisputeCustomerHistory = {
  order_count: number
  dispute_count: number
  resolved_count: number
  rejected_count: number
  others: DisputeHistoryEntry[]
}

export type AdminDisputeCard = {
  dispute: ReturnType<typeof serializeDisputeForAdmin> & {
    age_hours: number
    overdue: boolean
  }
  sla_hours: number
  // null — заказ претензии не найден (удалён/битая ссылка): карточка честно
  // скажет об этом, а не упадёт.
  order: AdminOrderCard | null
  reviews: ReturnType<typeof serializeReviewForAdmin>[]
  customer_history: DisputeCustomerHistory
}

// Сколько прошлых обращений показываем: решение принимают по картине, а не по
// полному журналу (весь журнал остаётся в очереди с фильтром).
const HISTORY_LIMIT = 5

type DisputeRow = {
  id: string
  order_id: string
  customer_id: string
  category: string
  description: string
  status: string
  resolution: string | null
  outcome?: string | null
  source?: string | null
  created_at?: Date | string | null
}

const isoDate = (value: Date | string | null | undefined): string | null => {
  if (!value) {
    return null
  }
  return value instanceof Date ? value.toISOString() : value
}

// История обращений покупателя: сколько всего, чем закончились, и последние
// обращения по другим заказам с их номерами.
async function loadCustomerHistory(
  scope: MedusaContainer,
  reviewsService: ReviewsModuleService,
  dispute: DisputeRow
): Promise<DisputeCustomerHistory> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const [all, { metadata }] = await Promise.all([
    reviewsService.listDisputes(
      { customer_id: dispute.customer_id },
      { order: { created_at: "DESC" } }
    ),
    query.graph({
      entity: "order",
      fields: ["id"],
      filters: { customer_id: dispute.customer_id },
      pagination: { skip: 0, take: 1 },
    }),
  ])

  const rows = all as DisputeRow[]
  const others = rows
    .filter((entry) => entry.id !== dispute.id)
    .slice(0, HISTORY_LIMIT)

  // Номера заказов прошлых обращений: технический id в истории читается как
  // «шифровка из тридцати букв» (блокер 2 Асель), нужен номер.
  const orderIds = [...new Set(others.map((entry) => entry.order_id))]
  const displayIds = new Map<string, number | null>()
  if (orderIds.length) {
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "display_id"],
      filters: { id: orderIds },
      pagination: { skip: 0, take: orderIds.length },
    })
    for (const order of data as { id: string; display_id?: number | null }[]) {
      displayIds.set(order.id, order.display_id ?? null)
    }
  }

  return {
    order_count: metadata?.count ?? 0,
    dispute_count: rows.length,
    resolved_count: rows.filter((entry) => entry.status === "resolved").length,
    rejected_count: rows.filter((entry) => entry.status === "rejected").length,
    others: others.map((entry) => ({
      id: entry.id,
      order_id: entry.order_id,
      order_display_id: displayIds.get(entry.order_id) ?? null,
      category: entry.category,
      status: entry.status,
      outcome: entry.outcome ?? null,
      created_at: isoDate(entry.created_at),
    })),
  }
}

export async function buildDisputeCard(
  scope: MedusaContainer,
  disputeId: string,
  now: number = Date.now()
): Promise<AdminDisputeCard> {
  const reviewsService = scope.resolve<ReviewsModuleService>(REVIEWS_MODULE)
  // Претензии нет → 404 бросает сервис (retrieveDispute).
  const dispute = (await reviewsService.retrieveDispute(
    disputeId
  )) as unknown as DisputeRow

  const [order, reviews, customerHistory] = await Promise.all([
    // Заказ мог быть удалён вместе с демо-данными — карточка претензии не
    // должна из-за этого стать недоступной (сам текст жалобы важнее заказа).
    buildOrderCard(scope, dispute.order_id).catch(() => null),
    reviewsService.listReviews(
      { order_id: dispute.order_id },
      { order: { created_at: "DESC" } }
    ),
    loadCustomerHistory(scope, reviewsService, dispute),
  ])

  const age = ageHours(dispute.created_at, now)
  const slaHours = disputeSlaHours()

  return {
    dispute: {
      ...serializeDisputeForAdmin(dispute),
      age_hours: age,
      overdue: isOverdue(dispute.status, age, slaHours),
    },
    sla_hours: slaHours,
    order,
    reviews: reviews.map(serializeReviewForAdmin),
    customer_history: customerHistory,
  }
}
