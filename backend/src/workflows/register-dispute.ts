import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { DISPUTE_OPENED_EVENT } from "../modules/reviews/events"
import { DisputeCategory } from "../modules/reviews/models/constants"
import { openDisputeStep } from "./steps/open-dispute"
import { resolveOrderCustomerStep } from "./steps/resolve-order-customer"

export type RegisterDisputeWorkflowInput = {
  order_id: string
  category: DisputeCategory
  description: string
}

// Регистрация претензии ОПЕРАТОРОМ с чужих слов (блокер 3 Асель, Ф-прогон
// 2026-08-18: «покупатель звонит и жалуется — записать его обращение некуда»).
// Канал покупателя один — чат с ассистентом (DECISIONS 2026-08-17), но звонок и
// самовывоз мимо него проходят, и такая претензия должна попадать в ту же
// очередь, а не в тетрадь.
//
// Отличие от open-dispute (покупатель): покупателя не проверяем, а ВЫЧИСЛЯЕМ из
// заказа — оператор знает только номер заказа. Инварианты домена общие: блок
// второго активного диспута живёт в сервисе, поэтому оба входа их делят.
// Источник помечается `operator` — при разборе через месяц видно, что претензию
// записали с чужих слов.
export const registerDisputeWorkflow = createWorkflow(
  "register-dispute",
  (input: WorkflowData<RegisterDisputeWorkflowInput>) => {
    const customer = resolveOrderCustomerStep({ order_id: input.order_id })

    const dispute = openDisputeStep(
      transform({ input, customer }, (d) => ({
        order_id: d.input.order_id,
        customer_id: d.customer.customer_id,
        category: d.input.category,
        description: d.input.description,
        source: "operator" as const,
      }))
    )

    emitEventStep({
      eventName: DISPUTE_OPENED_EVENT,
      data: transform({ dispute }, (d) => ({
        dispute_id: d.dispute.id,
        order_id: d.dispute.order_id,
        category: d.dispute.category,
      })),
    })

    return new WorkflowResponse(dispute)
  }
)
