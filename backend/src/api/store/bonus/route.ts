import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BONUS_MODULE } from "../../../modules/bonus"
import BonusModuleService from "../../../modules/bonus/service"
import { StoreGetBonusParamsType } from "./validators"

// GET /store/bonus — бонусный счёт текущего покупателя: баланс + история
// операций (новые первыми). Счёт создаётся лениво при первом начислении —
// у покупателя без операций отдаём нулевой баланс без создания счёта.
// lot_breakdown списаний — внутренняя механика леджера, наружу не отдаётся.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { limit, offset } = req.validatedQuery as StoreGetBonusParamsType
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: [
      "id",
      "bonus_account.id",
      "bonus_account.balance",
      "bonus_account.currency_code",
    ],
    filters: { id: req.auth_context.actor_id },
  })
  const account = (
    customers[0] as
      | {
          bonus_account?: {
            id: string
            balance: number
            currency_code: string
          } | null
        }
      | undefined
  )?.bonus_account

  if (!account) {
    res.json({
      bonus: {
        balance: 0,
        currency_code: "kzt",
        transactions: [],
        count: 0,
        limit,
        offset,
      },
    })
    return
  }

  const bonusService = req.scope.resolve<BonusModuleService>(BONUS_MODULE)
  const [transactions, count] =
    await bonusService.listAndCountBonusTransactions(
      { account_id: account.id },
      { take: limit, skip: offset, order: { created_at: "DESC" } }
    )

  res.json({
    bonus: {
      balance: Number(account.balance),
      currency_code: account.currency_code,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount),
        remaining: tx.remaining === null ? null : Number(tx.remaining),
        expires_at: tx.expires_at,
        note: tx.note,
        created_at: tx.created_at,
      })),
      count,
      limit,
      offset,
    },
  })
}
