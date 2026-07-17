import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { BONUS_MODULE } from "../../../../../modules/bonus"
import BonusModuleService from "../../../../../modules/bonus/service"

// Последние операции — виджету достаточно короткой истории; полная
// история покупателю доступна в его ЛК (GET /store/bonus).
const RECENT_TRANSACTIONS_LIMIT = 20

// GET /admin/customers/:id/bonus — бонусный счёт покупателя для админа
// (widget на ядровой странице customer): баланс + последние операции.
// Счёт создаётся лениво при первом начислении — без счёта отдаём нулевой
// баланс. lot_breakdown списаний — внутренняя механика, наружу не отдаётся.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: [
      "id",
      "bonus_account.id",
      "bonus_account.balance",
      "bonus_account.currency_code",
    ],
    filters: { id: req.params.id },
  })

  if (!customers.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Customer ${req.params.id} not found`
    )
  }

  const account = (
    customers[0] as {
      bonus_account?: {
        id: string
        balance: number
        currency_code: string
      } | null
    }
  ).bonus_account

  if (!account) {
    res.json({
      bonus: {
        account_id: null,
        balance: 0,
        currency_code: "kzt",
        transactions: [],
        count: 0,
      },
    })
    return
  }

  const bonusService = req.scope.resolve<BonusModuleService>(BONUS_MODULE)
  const [transactions, count] =
    await bonusService.listAndCountBonusTransactions(
      { account_id: account.id },
      { take: RECENT_TRANSACTIONS_LIMIT, order: { created_at: "DESC" } }
    )

  res.json({
    bonus: {
      account_id: account.id,
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
    },
  })
}
