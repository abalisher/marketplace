import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { REVIEWS_MODULE } from "../../../modules/reviews"
import ReviewsModuleService from "../../../modules/reviews/service"
import { registerDisputeWorkflow } from "../../../workflows/register-dispute"
import { serializeDisputeForAdmin } from "../../utils/serialize-review"
import {
  ACTIVE_DISPUTE_STATUSES,
  countDisputes,
  disputeSlaHours,
  loadDisputeRows,
} from "./rows"
import {
  AdminGetDisputesParamsType,
  AdminRegisterDisputeType,
} from "./validators"

// Очередь претензий оператора (экран «Претензии», T4.11) и регистрация претензии
// по звонку. Каждая строка несёт всё, что рисует таблица — заказ, покупателя,
// сумму, возраст и просрочку (сборка в rows.ts), а ответ — счётчики по статусам
// для чипов: экран остаётся тонким и ничего не пересчитывает.

// Кросс-модульного фильтра по полям заказа у списка претензий нет (order_id —
// опазная колонка, docs/modules/reviews.md): поиск идёт вторым запросом со
// стороны заказа, найденные id подставляются фильтром. Идиома поиска очереди
// заказов.
const SEARCH_MATCH_CAP = 100

async function findOrderIdsBySearch(
  query: Omit<RemoteQueryFunction, symbol>,
  q: string
): Promise<string[]> {
  const orderFilters: Record<string, unknown>[] = [
    { email: { $ilike: `%${q}%` } },
  ]
  // Номер заказа — целиком и как число (оператор вводит «39» или «#39»).
  const displayId = Number(q.replace(/^#/, ""))
  if (Number.isSafeInteger(displayId) && displayId > 0) {
    orderFilters.push({ display_id: displayId })
  }

  const ids = new Set<string>()
  for (const filters of orderFilters) {
    const { data } = await query.graph({
      entity: "order",
      fields: ["id"],
      filters,
      pagination: { skip: 0, take: SEARCH_MATCH_CAP },
    })
    for (const order of data as { id: string }[]) {
      ids.add(order.id)
    }
  }
  return [...ids]
}

// Поиск по претензиям: заказ (номер/почта покупателя) ИЛИ текст жалобы. Двумя
// выборками, а не одним $or: условие по заказу приходит списком id, а по тексту —
// ilike по своей таблице; объединяем найденные id претензий.
async function findDisputeIdsBySearch(
  reviewsService: ReviewsModuleService,
  query: Omit<RemoteQueryFunction, symbol>,
  q: string
): Promise<string[]> {
  const orderIds = await findOrderIdsBySearch(query, q)

  const [byText, byOrder] = await Promise.all([
    reviewsService.listDisputes(
      { description: { $ilike: `%${q}%` } },
      { take: SEARCH_MATCH_CAP, select: ["id"] }
    ),
    orderIds.length
      ? reviewsService.listDisputes(
          { order_id: orderIds },
          { take: SEARCH_MATCH_CAP, select: ["id"] }
        )
      : Promise.resolve([]),
  ])

  return [...new Set([...byText, ...byOrder].map((dispute) => dispute.id))]
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { status, q, limit, offset } =
    req.validatedQuery as AdminGetDisputesParamsType

  const reviewsService =
    req.scope.resolve<ReviewsModuleService>(REVIEWS_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // База для счётчиков чипов — всё, кроме самого статуса: чипы показывают,
  // сколько претензий в каждом статусе при текущем поиске.
  const baseFilters: Record<string, unknown> = {}
  const empty = {
    disputes: [],
    counts: {
      total: 0,
      by_status: { open: 0, in_review: 0, resolved: 0, rejected: 0 },
      overdue: 0,
    },
    sla_hours: disputeSlaHours(),
    count: 0,
    offset,
    limit,
  }

  if (q) {
    const ids = await findDisputeIdsBySearch(reviewsService, query, q)
    if (!ids.length) {
      res.json(empty)
      return
    }
    baseFilters.id = ids
  }

  const filters: Record<string, unknown> = {
    ...baseFilters,
    // Дефолт — активные: очередь на разбор, а не журнал обращений.
    status: status ?? ACTIVE_DISPUTE_STATUSES,
  }

  const now = Date.now()
  const [[disputes, count], counts] = await Promise.all([
    reviewsService.listAndCountDisputes(filters, {
      skip: offset,
      take: limit,
      // FIFO: старые сверху — с них и начинают, они же просрочены первыми.
      order: { created_at: "ASC" },
    }),
    countDisputes(
      (statusFilters) =>
        reviewsService.listAndCountDisputes(statusFilters, {
          select: ["id", "created_at"],
        }),
      baseFilters,
      now
    ),
  ])

  res.json({
    disputes: await loadDisputeRows(
      query,
      req.scope.resolve(Modules.ORDER),
      disputes,
      now
    ),
    counts,
    sla_hours: disputeSlaHours(),
    count,
    offset,
    limit,
  })
}

// POST /admin/disputes — оператор регистрирует претензию с чужих слов (звонок,
// самовывоз): покупателя вычисляет workflow из заказа, источник — `operator`.
// Второй активный диспут по заказу не пустит сервис (409/400 из workflow).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminRegisterDisputeType>,
  res: MedusaResponse
) {
  const { result } = await registerDisputeWorkflow(req.scope).run({
    input: {
      order_id: req.validatedBody.order_id,
      category: req.validatedBody.category,
      description: req.validatedBody.description,
    },
    throwOnError: true,
  })
  res.status(201).json({ dispute: serializeDisputeForAdmin(result) })
}
