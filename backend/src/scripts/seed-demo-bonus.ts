import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ExecArgs } from "@medusajs/framework/types"
import { BONUS_MODULE } from "../modules/bonus"
import BonusModuleService from "../modules/bonus/service"

const DAY_MS = 24 * 60 * 60 * 1000

// Демо-бонусный счёт для ручной проверки админ-UI (widget на странице
// customer + джоба сгорания): покупатель с балансом из трёх лотов — обычный,
// сгорающий через 3 дня (кандидат bonus.expiring_soon) и уже просроченный
// (кандидат expire-bonuses), плюс списание. Идемпотентен по маркер-почте.
//
// Запуск: npx medusa exec ./src/scripts/seed-demo-bonus.ts
export default async function seedDemoBonus({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const customerService = container.resolve(Modules.CUSTOMER)
  const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)

  const MARKER_EMAIL = "demo-bonus-buyer@example.com"

  const [existing] = await customerService.listCustomers(
    { email: MARKER_EMAIL },
    { take: 1 }
  )
  if (existing) {
    logger.info(
      `Demo bonus customer already seeded (${existing.id}). Skipping.`
    )
    return
  }

  const customer = await customerService.createCustomers({
    email: MARKER_EMAIL,
    first_name: "Demo",
    last_name: "Bonus Buyer",
  })
  const account = await bonusService.createBonusAccounts({
    currency_code: "kzt",
  })
  await link.create({
    [Modules.CUSTOMER]: { customer_id: customer.id },
    [BONUS_MODULE]: { bonus_account_id: account.id },
  })

  await bonusService.credit({
    account_id: account.id,
    amount: 5000,
    note: "demo accrual",
  })
  await bonusService.credit({
    account_id: account.id,
    amount: 1200,
    expires_at: new Date(Date.now() + 3 * DAY_MS),
    note: "demo accrual expiring soon",
  })
  await bonusService.credit({
    account_id: account.id,
    amount: 700,
    expires_at: new Date(Date.now() - 1 * DAY_MS),
    note: "demo accrual already expired",
  })
  await bonusService.spend({
    account_id: account.id,
    amount: 300,
    note: "demo spend",
  })

  const balance = Number(
    (await bonusService.retrieveBonusAccount(account.id)).balance
  )
  logger.info(
    `Seeded demo bonus account ${account.id} for ${MARKER_EMAIL} ` +
      `(customer ${customer.id}), balance ${balance} kzt. ` +
      `Run the expire-bonuses job to see expiry + expiring-soon in action.`
  )
}
