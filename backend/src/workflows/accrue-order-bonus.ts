import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createRemoteLinkStep,
  emitEventStep,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { BONUS_MODULE } from "../modules/bonus"
import { BONUS_ACCRUED_EVENT } from "../modules/bonus/events"
import { creditBonusAccountStep } from "./steps/credit-bonus-account"
import { getOrCreateBonusAccountStep } from "./steps/get-or-create-bonus-account"
import { prepareOrderBonusAccrualStep } from "./steps/prepare-order-bonus-accrual"

export type AccrueOrderBonusWorkflowInput = {
  order_id: string
}

// Начисление бонуса за закрытый заказ (ТЗ 4.16). Триггер — джоба
// src/jobs/accrue-bonuses.ts (единственный: подписка на to=closed не годится —
// окно возврата в этот момент ещё не истекло). Инварианты (закрыт, окно
// истекло, ещё не начислено) проверяет первый шаг — workflow безопасен и при
// ручном вызове. Нулевая сумма (процент 0 / копеечный заказ) — no-op без
// транзакции: лот с amount=0 запрещён леджером; такой заказ останется
// кандидатом следующих прогонов джобы, что безвредно.
export const accrueOrderBonusWorkflow = createWorkflow(
  "accrue-order-bonus",
  (input: WorkflowData<AccrueOrderBonusWorkflowInput>) => {
    const prepared = prepareOrderBonusAccrualStep({
      order_id: input.order_id,
    })

    const credited = when(
      "accrual-amount-positive",
      { prepared },
      ({ prepared }) => prepared.amount > 0
    ).then(() => {
      const account = getOrCreateBonusAccountStep({
        customer_id: prepared.customer_id,
      })

      const credit = creditBonusAccountStep(
        transform({ input, prepared, account }, (d) => ({
          account_id: d.account.account_id,
          amount: d.prepared.amount,
          expires_at: d.prepared.expires_at,
          note: `accrual for order ${d.input.order_id}`,
        }))
      )

      // Link транзакции к заказу — маркер идемпотентности начисления
      // (см. links/order-bonus-transaction.ts).
      createRemoteLinkStep(
        transform({ input, credit }, (d) => [
          {
            [Modules.ORDER]: { order_id: d.input.order_id },
            [BONUS_MODULE]: { bonus_transaction_id: d.credit.transaction_id },
          },
        ])
      )

      emitEventStep({
        eventName: BONUS_ACCRUED_EVENT,
        data: transform({ input, prepared, credit }, (d) => ({
          order_id: d.input.order_id,
          account_id: d.credit.account_id,
          transaction_id: d.credit.transaction_id,
          amount: d.prepared.amount,
        })),
      })

      return credit
    })

    return new WorkflowResponse(
      transform({ prepared, credited }, (d) => ({
        amount: d.prepared.amount,
        account_id: d.credited?.account_id ?? null,
        transaction_id: d.credited?.transaction_id ?? null,
      }))
    )
  }
)
