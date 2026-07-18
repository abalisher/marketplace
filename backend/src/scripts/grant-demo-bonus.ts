import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ExecArgs } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { BONUS_MODULE } from "../modules/bonus"
import BonusModuleService from "../modules/bonus/service"

// Dev-утилита: начислить бонусы существующему покупателю по email — для
// ручной проверки бонусов в чекауте витрины (демо-клиент из seed-demo-bonus
// не имеет пароля и в витрину не логинится). Счёт создаётся лениво, как в
// боевом начислении. НЕ идемпотентен намеренно: каждый запуск — новый лот.
//
// Запуск: npx medusa exec ./src/scripts/grant-demo-bonus.ts <email> [amount=5000]
export default async function grantDemoBonus({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const customerService = container.resolve(Modules.CUSTOMER)
  const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)

  const [email, rawAmount] = args ?? []
  if (!email) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Usage: npx medusa exec ./src/scripts/grant-demo-bonus.ts <email> [amount]"
    )
  }
  const amount = Number(rawAmount ?? 5000)
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Amount must be a positive integer, got "${rawAmount}"`
    )
  }

  const [customer] = await customerService.listCustomers(
    { email },
    { take: 1 }
  )
  if (!customer) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Customer with email ${email} not found`
    )
  }

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "bonus_account.id"],
    filters: { id: customer.id },
  })
  let accountId = (
    customers[0] as { bonus_account?: { id: string } | null } | undefined
  )?.bonus_account?.id

  if (!accountId) {
    const account = await bonusService.createBonusAccounts({
      currency_code: "kzt",
    })
    await link.create({
      [Modules.CUSTOMER]: { customer_id: customer.id },
      [BONUS_MODULE]: { bonus_account_id: account.id },
    })
    accountId = account.id
  }

  await bonusService.credit({
    account_id: accountId,
    amount,
    note: "dev grant (grant-demo-bonus script)",
  })
  const balance = Number(
    (await bonusService.retrieveBonusAccount(accountId)).balance
  )
  logger.info(
    `Credited ${amount} kzt to ${email} (account ${accountId}), balance now ${balance} kzt.`
  )
}
