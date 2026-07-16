import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BONUS_MODULE } from "../modules/bonus"
import BonusModuleService from "../modules/bonus/service"
import { accrueOrderBonusWorkflow } from "../workflows/accrue-order-bonus"

const DAY_MS = 24 * 60 * 60 * 1000

// Начисление бонусов за закрытые заказы (ТЗ 4.16) — единственный триггер
// accrue-order-bonus (подписка на to=closed не годится: окно возврата ещё не
// истекло). Кандидаты: order_lifecycle.status=closed, переход в delivered
// раньше, чем (now − return_window_days), и НЕТ accrual-транзакции по link'у
// order ↔ bonus_transaction (идемпотентность — повторный прогон no-op).
// Скан по всем closed-заказам линеен по их числу — на масштабе MVP (~10
// заказов/день) приемлемо; при росте добавить маркер обработки на lifecycle.
export default async function accrueBonusesJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)

  const bonusConfig = await bonusService.getOrCreateConfig()
  const cutoff =
    Date.now() - Number(bonusConfig.return_window_days) * DAY_MS

  const { data: lifecycles } = await query.graph({
    entity: "order_lifecycle",
    fields: [
      "id",
      "order.id",
      "events.to_status",
      "events.created_at",
    ],
    filters: { status: "closed" },
  })

  const dueOrderIds = (
    lifecycles as {
      order?: { id: string } | null
      events?: { to_status: string; created_at: string }[]
    }[]
  )
    .filter((lifecycle) => {
      const deliveredAt = (lifecycle.events ?? [])
        .filter((event) => event.to_status === "delivered")
        .map((event) => new Date(event.created_at).getTime())
        .sort((a, b) => b - a)[0]
      return Boolean(deliveredAt) && deliveredAt <= cutoff
    })
    .map((lifecycle) => lifecycle.order?.id)
    .filter(Boolean) as string[]

  if (!dueOrderIds.length) {
    return
  }

  // Идемпотентность: заказы с уже существующей accrual-транзакцией
  // отбрасываются здесь (и повторно проверяются инвариантом workflow).
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "bonus_transactions.type"],
    filters: { id: dueOrderIds },
  })
  const pendingOrderIds = (
    orders as {
      id: string
      bonus_transactions?: ({ type: string } | null)[] | null
    }[]
  )
    .filter(
      (order) =>
        !(order.bonus_transactions ?? []).some(
          (transaction) => transaction?.type === "accrual"
        )
    )
    .map((order) => order.id)

  let accrued = 0
  for (const orderId of pendingOrderIds) {
    try {
      const { result } = await accrueOrderBonusWorkflow(container).run({
        input: { order_id: orderId },
        throwOnError: true,
      })
      if (result.transaction_id) {
        accrued += 1
      }
    } catch (error) {
      // Ошибка одного заказа не роняет прогон — остальные обрабатываются,
      // неудачник останется кандидатом следующего запуска.
      logger.error(
        `[bonus] accrual failed for order ${orderId}: ${
          (error as { message?: string })?.message
        }`
      )
    }
  }

  if (accrued > 0) {
    logger.info(`[bonus] accrued bonuses for ${accrued} order(s)`)
  }
}

export const config = {
  name: "accrue-bonuses",
  schedule: "0 * * * *", // ежечасно — точность окна возврата в днях этого не требует чаще
}
