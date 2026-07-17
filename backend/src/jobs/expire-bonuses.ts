import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { BONUS_MODULE } from "../modules/bonus"
import {
  BONUS_EXPIRED_EVENT,
  BONUS_EXPIRING_SOON_EVENT,
} from "../modules/bonus/events"
import { BONUS_CREDIT_TYPES } from "../modules/bonus/models/constants"
import BonusModuleService from "../modules/bonus/service"

const DAY_MS = 24 * 60 * 60 * 1000

// Сгорание бонусов (ТЗ 4.16): сжечь несписанный остаток просроченных лотов
// (сервисный expireLots идемпотентен — повторный прогон no-op) и предупредить
// о скором сгорании за expiry_notice_days. Лоты несут собственный expires_at,
// поэтому джоба работает и после выключения сгорания в конфиге (уже созданные
// лоты досгорают). Идемпотентность предупреждения — маркер expiry_notified_at
// на лоте; события агрегируются по счёту (одно уведомление на покупателя).
export default async function expireBonusesJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const eventBus = container.resolve(Modules.EVENT_BUS)
  const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)
  const now = new Date()

  // 1. Сгорание: на каждый затронутый счёт — expiry-транзакция + событие.
  const expired = await bonusService.expireLots({ now })
  if (expired.length) {
    await eventBus.emit(
      expired.map((result) => ({
        name: BONUS_EXPIRED_EVENT,
        data: {
          account_id: result.account_id,
          amount: result.amount,
          transaction_id: result.transaction.id,
        },
      }))
    )
    logger.info(
      `[bonus] expired lots on ${expired.length} account(s): ` +
        expired.map((r) => `${r.account_id}=${r.amount}`).join(", ")
    )
  }

  // 2. Предупреждение: лоты с остатком, сгорающие в пределах notice-окна,
  // о которых ещё не предупреждали. Маркер ставится после эмита — упавший
  // прогон предупредит повторно, что безвредно (лучше дважды, чем никогда).
  const config = await bonusService.getOrCreateConfig()
  const noticeDays = Number(config.expiry_notice_days)
  if (noticeDays <= 0) {
    return
  }

  const cutoff = new Date(now.getTime() + noticeDays * DAY_MS)
  const lots = await bonusService.listBonusTransactions(
    {
      type: [...BONUS_CREDIT_TYPES],
      expires_at: { $gt: now, $lte: cutoff },
      expiry_notified_at: null,
    },
    { take: null }
  )
  const expiring = lots.filter((lot) => Number(lot.remaining ?? 0) > 0)
  if (!expiring.length) {
    return
  }

  // Агрегация по счёту: сумма сгорающего остатка + ближайший срок.
  const byAccount = new Map<string, { amount: number; expires_at: Date }>()
  for (const lot of expiring) {
    const expiresAt = new Date(lot.expires_at!)
    const entry = byAccount.get(lot.account_id)
    byAccount.set(lot.account_id, {
      amount: (entry?.amount ?? 0) + Number(lot.remaining),
      expires_at:
        entry && entry.expires_at < expiresAt ? entry.expires_at : expiresAt,
    })
  }

  await eventBus.emit(
    [...byAccount].map(([accountId, entry]) => ({
      name: BONUS_EXPIRING_SOON_EVENT,
      data: {
        account_id: accountId,
        amount: entry.amount,
        expires_at: entry.expires_at,
      },
    }))
  )
  await bonusService.updateBonusTransactions(
    expiring.map((lot) => ({ id: lot.id, expiry_notified_at: now }))
  )
  logger.info(
    `[bonus] expiring-soon notice for ${byAccount.size} account(s), ` +
      `${expiring.length} lot(s)`
  )
}

export const config = {
  name: "expire-bonuses",
  // Ежечасно в :30 — в противофазе с accrue-bonuses (:00); точность сроков
  // сгорания в днях этого не требует чаще.
  schedule: "30 * * * *",
}
