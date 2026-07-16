import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import BonusAccount from "./models/bonus-account"
import BonusConfig from "./models/bonus-config"
import BonusTransaction from "./models/bonus-transaction"
import {
  BONUS_CREDIT_TYPES,
  BonusCreditType,
  BonusLotBreakdown,
} from "./models/constants"

// Сумма начисления за заказ: по каждой товарной позиции — процент её сегмента
// (переопределение из конфига) либо платформенный процент; доставка не
// бонусируется (передаются только товарные позиции). Floor до целой единицы
// валюты — в конце, по сумме. Чистая функция — тестируется без БД,
// переиспользуется в workflow начисления (подзадача 2).
export function calculateOrderAccrual(input: {
  items: { subtotal: number; segment?: string | null }[]
  accrual_percent: number
  segment_percents?: Record<string, number> | null
}): number {
  const exact = input.items.reduce((sum, item) => {
    const override = item.segment
      ? input.segment_percents?.[item.segment]
      : undefined
    const percent = override ?? input.accrual_percent
    return sum + (item.subtotal * percent) / 100
  }, 0)
  return Math.max(0, Math.floor(exact))
}

// Инвариант потолка списания (ТЗ 4.16): не более max_spend_percent от суммы
// нового заказа. Сам сервис заказа не знает — проверка вызывается из workflow
// оформления (подзадача 3). Чистая функция.
export function assertSpendWithinCap(input: {
  spend_amount: number
  order_amount: number
  max_spend_percent: number
}) {
  const cap = (input.order_amount * input.max_spend_percent) / 100
  if (input.spend_amount > cap) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Bonus spend ${input.spend_amount} exceeds ${input.max_spend_percent}% of order amount ${input.order_amount}`
    )
  }
}

// Сервис бонусного кошелька. CRUD генерируется MedusaService; здесь — движения
// леджера с лотовым учётом (см. docs/modules/bonus.md): каждое начисление —
// лот с remaining/expires_at, списание уменьшает лоты FIFO (ближайшее сгорание
// первым), сгорает только несписанный остаток просроченных лотов. balance
// счёта денормализован и поддерживается только этими методами. Гонки при
// параллельном списании не блокируем (MVP ~10 заказов/день).
class BonusModuleService extends MedusaService({
  BonusAccount,
  BonusTransaction,
  BonusConfig,
}) {
  // Конфиг-singleton: первая строка либо создание с дефолтами моделей.
  async getOrCreateConfig() {
    const [existing] = await this.listBonusConfigs({}, { take: 1 })
    if (existing) {
      return existing
    }
    return await this.createBonusConfigs({})
  }

  // Кредит: создать лот + увеличить баланс. Возвращает и счёт, и транзакцию —
  // id транзакции нужен workflow-шагу для компенсации.
  async credit(input: {
    account_id: string
    amount: number
    type?: BonusCreditType
    expires_at?: Date | null
    note?: string | null
  }) {
    const type = input.type ?? "accrual"
    if (!(BONUS_CREDIT_TYPES as readonly string[]).includes(type)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Bonus credit type must be one of: ${BONUS_CREDIT_TYPES.join(", ")}`
      )
    }
    if (!(input.amount > 0)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Bonus credit amount must be positive"
      )
    }

    const account = await this.retrieveBonusAccount(input.account_id)
    const transaction = await this.createBonusTransactions({
      account_id: input.account_id,
      type,
      amount: input.amount,
      remaining: input.amount,
      expires_at: input.expires_at ?? null,
      note: input.note ?? null,
    })
    const updated = await this.updateBonusAccounts({
      id: account.id,
      balance: Number(account.balance) + input.amount,
    })

    return { account: updated, transaction }
  }

  // Списание FIFO по лотам: ближайший срок сгорания первым (без срока — в
  // конец), при равенстве — по дате создания. Разбивка по лотам сохраняется
  // в lot_breakdown списания — по ней revertSpend откатывает движение.
  async spend(input: { account_id: string; amount: number; note?: string | null }) {
    if (!(input.amount > 0)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Bonus spend amount must be positive"
      )
    }

    const account = await this.retrieveBonusAccount(input.account_id)
    if (Number(account.balance) < input.amount) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Insufficient bonus balance"
      )
    }

    const lots = await this.listBonusTransactions(
      { account_id: input.account_id, type: [...BONUS_CREDIT_TYPES] },
      { take: null }
    )
    const active = lots
      .filter((lot) => Number(lot.remaining ?? 0) > 0)
      .sort((a, b) => {
        const aExpiry = a.expires_at
          ? new Date(a.expires_at).getTime()
          : Infinity
        const bExpiry = b.expires_at
          ? new Date(b.expires_at).getTime()
          : Infinity
        if (aExpiry !== bExpiry) {
          return aExpiry - bExpiry
        }
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      })

    let left = input.amount
    const breakdown: BonusLotBreakdown = []
    const lotUpdates: { id: string; remaining: number }[] = []
    for (const lot of active) {
      if (left <= 0) {
        break
      }
      const available = Number(lot.remaining)
      const taken = Math.min(available, left)
      breakdown.push({ transaction_id: lot.id, taken })
      lotUpdates.push({ id: lot.id, remaining: available - taken })
      left -= taken
    }
    // balance = Σ remaining лотов — инвариант методов сервиса; расхождение
    // означает порчу данных, не двигаемся дальше.
    if (left > 0) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Bonus account balance is inconsistent with its lots"
      )
    }

    await this.updateBonusTransactions(lotUpdates)
    const transaction = await this.createBonusTransactions({
      account_id: input.account_id,
      type: "spend",
      amount: input.amount,
      // json-колонка типизируется как Record — массив разбивки кастуем
      // (идиома documents в create-company).
      lot_breakdown: breakdown as unknown as Record<string, unknown>,
      note: input.note ?? null,
    })
    const updated = await this.updateBonusAccounts({
      id: account.id,
      balance: Number(account.balance) - input.amount,
    })

    return { account: updated, transaction }
  }

  // Откат списания (компенсация workflow-шага): вернуть remaining лотам по
  // lot_breakdown, удалить spend-транзакцию, восстановить баланс.
  async revertSpend(input: { spend_transaction_id: string }) {
    const spend = await this.retrieveBonusTransaction(
      input.spend_transaction_id
    )
    if (spend.type !== "spend") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Transaction ${spend.id} is not a spend transaction`
      )
    }

    const breakdown = (spend.lot_breakdown ?? []) as BonusLotBreakdown
    const lots = await this.listBonusTransactions(
      { id: breakdown.map((part) => part.transaction_id) },
      { take: null }
    )
    const remainingById = new Map(
      lots.map((lot) => [lot.id, Number(lot.remaining ?? 0)])
    )
    await this.updateBonusTransactions(
      breakdown.map((part) => ({
        id: part.transaction_id,
        remaining: (remainingById.get(part.transaction_id) ?? 0) + part.taken,
      }))
    )

    const account = await this.retrieveBonusAccount(spend.account_id)
    const updated = await this.updateBonusAccounts({
      id: account.id,
      balance: Number(account.balance) + Number(spend.amount),
    })
    await this.deleteBonusTransactions(spend.id)

    return { account: updated }
  }

  // Сгорание: сжечь несписанный остаток всех просроченных лотов. На каждый
  // затронутый счёт — одна expiry-транзакция на сумму сожжённого. Идемпотентен:
  // повторный вызов не находит лотов с remaining > 0. Вызывается джобой
  // (подзадача 4).
  async expireLots(input?: { now?: Date }) {
    const now = input?.now ?? new Date()
    const lots = await this.listBonusTransactions(
      { type: [...BONUS_CREDIT_TYPES], expires_at: { $lte: now } },
      { take: null }
    )
    const expired = lots.filter((lot) => Number(lot.remaining ?? 0) > 0)

    const byAccount = new Map<string, typeof expired>()
    for (const lot of expired) {
      const list = byAccount.get(lot.account_id) ?? []
      list.push(lot)
      byAccount.set(lot.account_id, list)
    }

    const results: {
      account_id: string
      amount: number
      transaction: { id: string }
    }[] = []
    for (const [accountId, accountLots] of byAccount) {
      const burned = accountLots.reduce(
        (sum, lot) => sum + Number(lot.remaining),
        0
      )
      await this.updateBonusTransactions(
        accountLots.map((lot) => ({ id: lot.id, remaining: 0 }))
      )
      const transaction = await this.createBonusTransactions({
        account_id: accountId,
        type: "expiry",
        amount: burned,
        note: `Expired ${accountLots.length} lot(s)`,
      })
      const account = await this.retrieveBonusAccount(accountId)
      const updated = await this.updateBonusAccounts({
        id: accountId,
        balance: Number(account.balance) - burned,
      })
      void updated
      results.push({ account_id: accountId, amount: burned, transaction })
    }

    return results
  }
}

export default BonusModuleService
