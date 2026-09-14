import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { ASSEMBLY_MODULE } from "../modules/assembly"
import AssemblyModuleService from "../modules/assembly/service"
import { REVIEWS_MODULE } from "../modules/reviews"
import ReviewsModuleService from "../modules/reviews/service"
import { ORDER_LIFECYCLE_MODULE } from "../modules/order-lifecycle"
import { generateDeliveryCode } from "../modules/order-lifecycle/delivery-code"
import OrderLifecycleModuleService from "../modules/order-lifecycle/service"
import { cancelOrderWorkflow } from "../workflows/cancel-order"
import { closeOrderWorkflow } from "../workflows/close-order"
import { deliverOrderWorkflow } from "../workflows/deliver-order"
import { shipOrderWorkflow } from "../workflows/ship-order"
import { transitionDisputeWorkflow } from "../workflows/transition-dispute"

// Подготовка стенда к показу (T12.6): довести исторические заказы до конечных
// статусов, чтобы дашборд открывался рабочим днём, а не свалкой просрочки.
//
// ЗАЧЕМ. Заказы Ф-прогонов августа так и висели в `new`/`in_delivery`, и первый
// экран показа встречал словами «открытых 26, просрочено 26, самый старый ждёт
// 592 часа» — магазин читается как заброшенный (находка T12.1).
//
// КАК. Только ДОМЕННЫМ путём — теми же workflow'ами, которыми заказ ведёт
// продавец: отгрузка, вручение по коду, закрытие, отмена. Правкой БД статусы не
// трогаем: иначе разъедутся резервы, fulfillment'ы и деньги, а лог заказа
// соврёт о том, что произошло. Каждый переход подписан причиной — открыв такой
// заказ на показе, видно, кто и почему его закрыл.
//
// Путь зависит от того, где заказ стоит:
//   new / confirmed (без сборки)         → отмена (физически ничего не собрано)
//   assembling…assembled (есть сборка)   → отгрузка → вручение по коду → закрытие
//   in_delivery                          → вручение по коду → закрытие
//   delivered                            → закрытие
//
// СВЕЖИЕ ЗАКАЗЫ ОСТАЮТСЯ В РАБОТЕ: последние `KEEP_OPEN` (по умолчанию 3) по
// дате создания скрипт не трогает — на показе очередь не должна быть пустой.
//
// Заодно вычищаются ЗАДАНИЯ СБОРКИ по заказам, которых больше нет в работе:
// сборщик открывает приложение и видит очередь из заданий по отменённым и
// удалённым заказам (на стенде их набралось 30 против 2 живых). Ни отмена
// заказа, ни чистка демо-данных задания не трогают — это отдельный долг домена
// (см. docs/PLAN.md), здесь подготовка стенда убирает следствие.
//
// Заодно закрываются ЗАЛЕЖАВШИЕСЯ ПРЕТЕНЗИИ: дашборд считает их так же строго
// («просрочено 2, самая старая ждёт 21 дн»), и открытая три недели претензия
// читается как «жалобы никто не разбирает».
//
// Идемпотентен: повторный запуск не находит, что закрывать.
//   Запуск: cd backend && npx medusa exec ./src/scripts/prepare-demo-stand.ts
//   Переменные: KEEP_OPEN=3 · STALE_DISPUTE_DAYS=7 · DRY_RUN=1 (показать план)
// Заказы «в работе» — ровно то, что дашборд считает открытым (delivered сюда не
// входит: вручённый заказ работы не требует, ему остаётся дождаться окна
// возврата и закрыться).
const IN_WORK_STATUSES = [
  "new",
  "confirmed",
  "assembling",
  "partially_assembled",
  "assembled",
  "in_delivery",
]

const REASON =
  "Архив подготовки стенда к показу: заказ фокус-прогона доведён до конечного статуса."

type OrderRow = {
  id: string
  display_id?: number | null
  created_at?: string | Date | null
  items?: { id: string; quantity?: number | null }[] | null
  fulfillments?:
    | {
        id: string
        shipped_at?: string | Date | null
        delivered_at?: string | Date | null
        canceled_at?: string | Date | null
      }[]
    | null
  order_lifecycle?: {
    id: string
    status?: string | null
    delivery_code?: string | null
  } | null
}

export default async function prepareDemoStand({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const lifecycleService =
    container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)

  const keepOpen = Number(process.env.KEEP_OPEN ?? "3")
  const dryRun = process.env.DRY_RUN === "1"

  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "created_at",
      "items.id",
      "items.quantity",
      "fulfillments.id",
      "fulfillments.shipped_at",
      "fulfillments.delivered_at",
      "fulfillments.canceled_at",
      "order_lifecycle.id",
      "order_lifecycle.status",
      "order_lifecycle.delivery_code",
    ],
  })

  const byAge = (a: OrderRow, b: OrderRow) =>
    new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()

  const rows = (data as OrderRow[]).filter((order) => order.order_lifecycle)
  const inWork = rows
    .filter((order) =>
      IN_WORK_STATUSES.includes(order.order_lifecycle?.status ?? "")
    )
    .sort(byAge)
  // Вручённые закрываем всегда: работы по ним нет, а «доставлен» в очереди
  // неделю спустя — это незакрытое окно возврата, а не рабочая строка.
  const deliveredRows = rows
    .filter((order) => order.order_lifecycle?.status === "delivered")
    .sort(byAge)

  // Свежие оставляем в работе — очередь показа не должна быть пустой.
  const keep = keepOpen > 0 ? inWork.slice(-keepOpen) : []
  const doomed = [
    ...deliveredRows,
    ...inWork.slice(0, inWork.length - keep.length),
  ].sort(byAge)

  logger.info(
    `В работе: ${inWork.length}, вручённых: ${deliveredRows.length}. ` +
      `Оставляем в работе: ${
        keep.map((o) => `№${o.display_id}`).join(", ") || "нет"
      }. Доводим до конца: ${doomed.length}.`
  )
  if (dryRun) {
    for (const order of doomed) {
      logger.info(
        `  DRY RUN №${order.display_id}: ${order.order_lifecycle?.status}`
      )
    }
    return
  }

  const done: string[] = []
  const failed: string[] = []

  for (const order of doomed) {
    const lifecycle = order.order_lifecycle!
    const status = lifecycle.status ?? ""
    const label = `№${order.display_id} (${status})`
    // Живой fulfillment: по нему идут и отгрузка, и вручение.
    const live = (order.fulfillments ?? []).filter((f) => !f.canceled_at)
    const actor = { actor_type: "admin" as const, actor_id: null }

    try {
      let current = status

      if (["assembling", "partially_assembled", "assembled"].includes(current)) {
        const target = live.find((f) => !f.shipped_at)
        if (!target && live.length) {
          // Расхождение старых фикстур: ядро считает отгрузку СОСТОЯВШЕЙСЯ
          // (`shipped_at` проставлен), а наш статус остался на сборке. Звать
          // отгрузку второй раз нельзя («Shipment has already been created»),
          // поэтому чиним зеркало: двигаем свой статус и выдаём код получения —
          // ровно то, что сделал бы шаг workflow, минус физика, которая уже
          // произошла. Причина уходит в лог заказа.
          await lifecycleService.recordTransition({
            order_lifecycle_id: lifecycle.id,
            to: "in_delivery",
            actor_type: "admin",
            reason:
              "Синхронизация с отгрузкой ядра при подготовке стенда: fulfillment уже отгружен.",
          })
          const stored = await lifecycleService.retrieveOrderLifecycle(
            lifecycle.id
          )
          if (!stored.delivery_code) {
            await lifecycleService.updateOrderLifecycles({
              id: lifecycle.id,
              delivery_code: generateDeliveryCode(),
            })
          }
          current = "in_delivery"
        } else if (!target) {
          // Сборка началась, но fulfillment так и не появился: заданий у заказа
          // нет (удалены как мёртвые) или сборщики их не закрывали. Физически
          // ничего не собрано — честный конец такой же, как у «нового» заказа,
          // и стейт-машина отмену из сборки разрешает. Без этой ветки заказ
          // застревал в «В сборке» навсегда (найдено при подготовке стенда
          // 2026-09-06).
          await cancelOrderWorkflow(container).run({
            input: { order_id: order.id, reason: REASON, ...actor },
            throwOnError: true,
          })
          done.push(`${label} → canceled (сборка без fulfillment'а)`)
          continue
        } else {
          await shipOrderWorkflow(container).run({
            input: {
              order_id: order.id,
              fulfillment_id: target.id,
              items: (order.items ?? []).map((item) => ({
                id: item.id,
                quantity: Number(item.quantity ?? 1),
              })),
              ...actor,
            },
            throwOnError: true,
          })
          current = "in_delivery"
        }
      }

      if (current === "in_delivery") {
        // Код выдаётся при входе в доставку — после отгрузки перечитываем.
        const { data: fresh } = await query.graph({
          entity: "order",
          fields: [
            "order_lifecycle.delivery_code",
            "fulfillments.id",
            "fulfillments.canceled_at",
            "fulfillments.delivered_at",
          ],
          filters: { id: order.id },
        })
        const row = (fresh as OrderRow[])[0]
        const code = row?.order_lifecycle?.delivery_code
        const alive = (row?.fulfillments ?? []).filter((f) => !f.canceled_at)
        const target = alive.find((f) => !f.delivered_at)
        if (!code) {
          throw new MedusaError(
            MedusaError.Types.NOT_ALLOWED,
            "нет кода получения — вручить нечем"
          )
        }
        if (target) {
          await deliverOrderWorkflow(container).run({
            input: {
              order_id: order.id,
              fulfillment_id: target.id,
              delivery_code: code,
              ...actor,
            },
            throwOnError: true,
          })
        } else if (alive.length) {
          // То же расхождение, что и с отгрузкой: ядро уже пометило доставку
          // (`delivered_at` стоит), наш статус отстал. Второй вызов ядра
          // отказал бы — двигаем только своё зеркало, с причиной в логе.
          await lifecycleService.recordTransition({
            order_lifecycle_id: lifecycle.id,
            to: "delivered",
            actor_type: "admin",
            delivery_code: code,
            reason:
              "Синхронизация с вручением ядра при подготовке стенда: fulfillment уже доставлен.",
          })
        } else {
          throw new MedusaError(
            MedusaError.Types.NOT_ALLOWED,
            "живого fulfillment'а нет — вручать нечего"
          )
        }
        current = "delivered"
      }

      if (current === "delivered") {
        await closeOrderWorkflow(container).run({
          input: { order_id: order.id, ...actor },
          throwOnError: true,
        })
        done.push(`${label} → closed`)
        continue
      }

      // Осталось «new»/«confirmed» — сборки не было, честный конец это отмена.
      await cancelOrderWorkflow(container).run({
        input: { order_id: order.id, reason: REASON, ...actor },
        throwOnError: true,
      })
      done.push(`${label} → canceled`)
    } catch (error) {
      // Ошибка workflow приходит не всегда Error'ом (шаги отдают массив
      // объектов) — «[object Object]» в отчёте подготовки бесполезен.
      const message =
        error instanceof Error
          ? error.message
          : Array.isArray(error)
            ? error
                .map((e) => (e as { error?: { message?: string } })?.error?.message ?? JSON.stringify(e))
                .join("; ")
            : JSON.stringify(error)
      failed.push(`${label}: ${message}`)
    }
  }

  for (const line of done) {
    logger.info(`  ${line}`)
  }
  for (const line of failed) {
    logger.warn(`  НЕ ЗАКРЫТ ${line}`)
  }
  logger.info(
    `Готово по заказам: доведено ${done.length}, не удалось ${failed.length}, ` +
      `в работе оставлено ${keep.length}.`
  )

  // --- Задания сборки по мёртвым заказам --------------------------------------
  // Правило простое и проверяемое: живут задания только тех заказов, что СЕЙЧАС
  // в работе. Всё остальное — отменённые, закрытые и осиротевшие (заказ удалён
  // чисткой демо-данных) — удаляем вместе с отметками позиций.
  const assemblyService =
    container.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)
  // Считаем по ОСТАВЛЕННЫМ в работе (`keep`), а не по тем, что были в работе на
  // входе: заказы из `doomed` только что доведены до конца, и их задания тоже
  // мёртвые. Иначе очередь сходилась бы за два прогона вместо одного.
  const inWorkIds = new Set(keep.map((order) => order.id))
  const allTasks = await assemblyService.listAssemblyTasks(
    {},
    { select: ["id", "order_id"] }
  )
  const deadTasks = allTasks.filter((task) => !inWorkIds.has(task.order_id))
  if (!deadTasks.length) {
    logger.info("Заданий сборки по мёртвым заказам нет — пропускаю.")
  } else {
    const taskIds = deadTasks.map((task) => task.id)
    const items = await assemblyService.listAssemblyTaskItems(
      { task_id: taskIds },
      { select: ["id"] }
    )
    if (items.length) {
      await assemblyService.deleteAssemblyTaskItems(items.map((i) => i.id))
    }
    await assemblyService.deleteAssemblyTasks(taskIds)
    logger.info(
      `Удалено заданий сборки по мёртвым заказам: ${deadTasks.length} ` +
        `(отметок позиций: ${items.length}).`
    )
  }

  // --- Залежавшиеся претензии ------------------------------------------------
  const staleDays = Number(process.env.STALE_DISPUTE_DAYS ?? "7")
  const staleBefore = Date.now() - staleDays * 24 * 60 * 60 * 1000
  const reviewsService =
    container.resolve<ReviewsModuleService>(REVIEWS_MODULE)
  const disputes = await reviewsService.listDisputes(
    { status: ["open", "in_review"] },
    { select: ["id", "status", "category", "created_at"] }
  )
  const staleDisputes = disputes.filter(
    (dispute) => new Date(dispute.created_at).getTime() < staleBefore
  )
  if (!staleDisputes.length) {
    logger.info("Залежавшихся претензий нет — пропускаю.")
    return
  }
  for (const dispute of staleDisputes) {
    await transitionDisputeWorkflow(container).run({
      input: {
        id: dispute.id,
        to: "resolved",
        outcome: "redelivery",
        resolution:
          "Архив подготовки стенда к показу: претензия фокус-прогона закрыта довозом.",
      },
      throwOnError: true,
    })
  }
  logger.info(`Закрыто залежавшихся претензий: ${staleDisputes.length}.`)
}
