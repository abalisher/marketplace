import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { BONUS_MODULE } from "../../modules/bonus"
import BonusModuleService, {
  calculateOrderAccrual,
} from "../../modules/bonus/service"

export type PrepareOrderBonusAccrualStepInput = {
  order_id: string
}

const DAY_MS = 24 * 60 * 60 * 1000

// Проверяет условия начисления бонуса за заказ (ТЗ 4.16) и считает сумму.
// Инварианты живут здесь, а не в джобе: workflow безопасен и при ручном
// вызове. Условия: статус закрыт (order_lifecycle.status=closed), окно
// возврата от даты доставки истекло (дата — переход to=delivered из лога
// OrderLifecycleEvent), начисления ещё нет (идемпотентность — по link'у
// order ↔ bonus_transaction). Сумма — по товарным позициям (доставка не
// бонусируется): процент сегмента позиции (product_card по link'у) или
// платформенный. Read-only шаг — компенсация не нужна.
export const prepareOrderBonusAccrualStep = createStep(
  "prepare-order-bonus-accrual",
  async (input: PrepareOrderBonusAccrualStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "customer_id",
        "order_lifecycle.status",
        "order_lifecycle.events.to_status",
        "order_lifecycle.events.created_at",
        "bonus_transactions.type",
      ],
      filters: { id: input.order_id },
    })
    // Link-поля читаем через явную форму строки — tsc не зависит от
    // генерации .medusa/types (идиома resolve-order-company).
    const order = orders[0] as
      | {
          id: string
          customer_id: string | null
          order_lifecycle?: {
            status: string
            events?: { to_status: string; created_at: string }[]
          } | null
          bonus_transactions?: ({ type: string } | null)[] | null
        }
      | undefined

    if (!order) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Order ${input.order_id} not found`
      )
    }
    if (!order.customer_id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Order ${input.order_id} has no customer — nothing to accrue to`
      )
    }
    if (order.order_lifecycle?.status !== "closed") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Order ${input.order_id} is not closed — bonus accrues only after closing`
      )
    }
    const hasAccrual = (order.bonus_transactions ?? []).some(
      (transaction) => transaction?.type === "accrual"
    )
    if (hasAccrual) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Order ${input.order_id} already has an accrual transaction`
      )
    }

    // Заказ «в долг» или по переводу, за который ещё не заплатили целиком, —
    // не начисляем: бонус платится с денег, а не с обещания. Джоба вернётся к
    // заказу на следующем проходе, когда долг погасят.
    const { data: orderPayments } = await query.graph({
      entity: "order_payment",
      fields: ["status"],
      filters: { order_id: input.order_id },
    })
    const paymentStatus = (orderPayments as { status?: string }[])[0]?.status
    if (paymentStatus && paymentStatus !== "paid") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Order ${input.order_id} is not paid in full (${paymentStatus}) — bonus accrues only on paid orders`
      )
    }

    // Дата доставки — последний переход в delivered из лога (у counter-заказов
    // он тоже есть: new → delivered → closed).
    const deliveredAt = (order.order_lifecycle.events ?? [])
      .filter((event) => event.to_status === "delivered")
      .map((event) => new Date(event.created_at).getTime())
      .sort((a, b) => b - a)[0]
    if (!deliveredAt) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Order ${input.order_id} has no delivered transition in its lifecycle log`
      )
    }

    const config = await bonusService.getOrCreateConfig()
    const windowEndsAt =
      deliveredAt + Number(config.return_window_days) * DAY_MS
    if (windowEndsAt > Date.now()) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Order ${input.order_id} return window has not elapsed yet`
      )
    }

    // Позиции — через сервис order: query.graph не отдаёт надёжно
    // BigNumber-поля позиций (см. get-order-items). База позиции —
    // unit_price × quantity (промо-скидок в MVP нет).
    const orderService = container.resolve(Modules.ORDER)
    const withItems = await orderService.retrieveOrder(input.order_id, {
      relations: ["items"],
    })
    const items = (withItems.items ?? []).map((item) => ({
      product_id: item.product_id ?? null,
      subtotal: Number(item.unit_price) * Number(item.quantity),
    }))

    // Сегменты позиций — product_card по link'у, одним запросом по всем
    // товарам заказа.
    const productIds = [
      ...new Set(items.map((item) => item.product_id).filter(Boolean)),
    ] as string[]
    const segmentByProduct = new Map<string, string>()
    if (productIds.length) {
      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "product_card.segment"],
        filters: { id: productIds },
      })
      for (const product of products as {
        id: string
        product_card?: { segment?: string } | null
      }[]) {
        if (product.product_card?.segment) {
          segmentByProduct.set(product.id, product.product_card.segment)
        }
      }
    }

    const amount = calculateOrderAccrual({
      items: items.map((item) => ({
        subtotal: item.subtotal,
        segment: item.product_id
          ? segmentByProduct.get(item.product_id)
          : undefined,
      })),
      accrual_percent: Number(config.accrual_percent),
      segment_percents: config.segment_percents as Record<
        string,
        number
      > | null,
    })

    // Срок сгорания лота — от момента начисления (не доставки), null =
    // сгорание выключено. Дата — ISO-строкой: данные шагов сериализуются.
    const expiresAt = config.expiry_days
      ? new Date(Date.now() + Number(config.expiry_days) * DAY_MS)
      : null

    return new StepResponse({
      customer_id: order.customer_id,
      amount,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
    })
  }
)
