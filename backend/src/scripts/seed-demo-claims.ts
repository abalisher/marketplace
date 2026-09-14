import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { REVIEWS_MODULE } from "../modules/reviews"
import ReviewsModuleService from "../modules/reviews/service"
import { registerDisputeWorkflow } from "../workflows/register-dispute"
import { transitionDisputeWorkflow } from "../workflows/transition-dispute"

// Демо-претензии и отзывы для показа и для кадров гейта U (T4.11): очередь
// претензий и раздел отзывов на пустом стенде показывать нечем, а из чата
// покупателя претензия приходит только в живом диалоге.
//
// Запуск: npx medusa exec ./src/scripts/seed-demo-claims.ts
// Идемпотентен: заказы, по которым претензия уже есть, пропускаются.
//
// Просроченную претензию делаем ЯВНО — датой открытия в прошлом (срок ответа
// считается от created_at, обычная запись всегда «0 ч» и метку просрочки не
// покажет). Правим запросом в БД: created_at модели MikroORM выставляет сам.
type DemoOrder = {
  id: string
  display_id?: number | null
  customer_id?: string | null
  items?: { title?: string | null; quantity?: number | null }[] | null
}

export default async function seedDemoClaims({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const reviews = container.resolve<ReviewsModuleService>(REVIEWS_MODULE)

  // Заказы стенда, свежие сверху: берём те, по которым претензий нет.
  // Состав заказа нужен для текста жалобы: претензия обязана называть товар из
  // СВОЕГО заказа — в карточке и в кадрах гейта U жалоба стоит рядом с блоком
  // «Состав заказа», и «привезли гипсокартон» под строкой с газоблоком читается
  // как дефект экрана.
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "customer_id",
      "created_at",
      "items.title",
      "items.quantity",
    ],
    pagination: { skip: 0, take: 30, order: { created_at: "DESC" } },
  })

  const busy = new Set(
    (await reviews.listDisputes({}, { select: ["order_id"] })).map(
      (dispute) => dispute.order_id
    )
  )

  const free = (orders as DemoOrder[]).filter(
    (order) => order.customer_id && !busy.has(order.id)
  )

  // Самая крупная позиция заказа — про неё и жалуются: мелочь вроде дюбелей
  // претензию не рождает.
  const mainItem = (order: DemoOrder) =>
    (order.items ?? [])
      .filter((item) => !!item?.title)
      .sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0))[0] ?? null

  const itemName = (order: DemoOrder) => mainItem(order)?.title ?? "товар заказа"
  const itemQty = (order: DemoOrder) => mainItem(order)?.quantity ?? 1

  if (free.length < 3) {
    logger.warn(
      `Свободных заказов без претензий — ${free.length}. Нужно 3: часть демо-претензий не создана.`
    )
  }

  // 1. Просроченная претензия: открыта третий день, ответа нет.
  const overdue = free[0]
  if (overdue) {
    const { result } = await registerDisputeWorkflow(container).run({
      input: {
        order_id: overdue.id,
        category: "damaged",
        description: `Привезли «${itemName(overdue)}» — часть упаковок повреждена, кромки раскрошены. Просит заменить бой или вернуть за него деньги.`,
      },
      throwOnError: true,
    })
    // Дата открытия — 62 часа назад: срок ответа (24 ч) просрочен. Пишем
    // запросом в БД (идиома repairReserveDrift): created_at выставляет MikroORM,
    // публичного сеттера у него нет.
    const connection = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    await connection.raw(
      "update dispute set created_at = now() - interval '62 hours' where id = ?",
      [result.id]
    )
    logger.info(`Просроченная претензия по заказу №${overdue.display_id}`)
  }

  // 2. Претензия в работе: оператор взял, решения ещё нет.
  const inReview = free[1]
  if (inReview) {
    const { result } = await registerDisputeWorkflow(container).run({
      input: {
        order_id: inReview.id,
        category: "not_delivered",
        description: `По накладной «${itemName(inReview)}» — ${itemQty(inReview)}, на объект выгрузили меньше. Просит довезти остаток.`,
      },
      throwOnError: true,
    })
    await transitionDisputeWorkflow(container).run({
      input: { id: result.id, to: "in_review", resolution: null },
      throwOnError: true,
    })
    logger.info(`Претензия в работе по заказу №${inReview.display_id}`)
  }

  // 3. Закрытая претензия с последствием: видно, что получил покупатель.
  const resolved = free[2]
  if (resolved) {
    const { result } = await registerDisputeWorkflow(container).run({
      input: {
        order_id: resolved.id,
        category: "quality",
        description: `«${itemName(resolved)}» ведёт себя не как обычно: часть работы пришлось переделывать. Просит компенсацию.`,
      },
      throwOnError: true,
    })
    await transitionDisputeWorkflow(container).run({
      input: {
        id: result.id,
        to: "resolved",
        resolution:
          "Партия проверена, срок годности в норме — нарушена технология на объекте. Договорились о бонусах на следующий заказ.",
        outcome: "bonus",
      },
      throwOnError: true,
    })
    logger.info(`Закрытая претензия по заказу №${resolved.display_id}`)
  }

  // Отзывы: раздел «Отзывы» на пустом стенде показывать нечем. Пишем через
  // сервис домена (гейт «свой доставленный заказ» — на слое API покупателя).
  const withCustomer = (orders as DemoOrder[]).filter(
    (order) => order.customer_id
  )

  const drafts: {
    target: "supplier" | "delivery"
    rating: number
    comment: string
  }[] = [
    { target: "supplier", rating: 5, comment: "Всё привезли целым, упаковки не помяты." },
    {
      target: "delivery",
      rating: 3,
      comment: "Привезли на три часа позже обещанного, разгружали сами.",
    },
    { target: "supplier", rating: 4, comment: "Всё по накладной, вопросов нет." },
  ]

  for (const [index, draft] of drafts.entries()) {
    const order = withCustomer[index]
    if (!order?.customer_id) {
      continue
    }
    const [existing] = await reviews.listReviews(
      {
        order_id: order.id,
        customer_id: order.customer_id,
        target: draft.target,
      },
      { take: 1 }
    )
    if (existing) {
      continue
    }
    await reviews.createReview({
      order_id: order.id,
      customer_id: order.customer_id,
      target: draft.target,
      rating: draft.rating,
      comment: draft.comment,
    })
    logger.info(`Отзыв (${draft.target}) по заказу №${order.display_id}`)
  }
}
