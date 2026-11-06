import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { confirmOrderWorkflow } from "../../../../../../workflows/confirm-order"
import { AdminConfirmOrderType } from "../../../validators"

// POST /admin/orders/:id/lifecycle/confirm — менеджер подтверждает заявку
// (new → confirmed). Под /lifecycle/, чтобы не конфликтовать с ядровыми
// операциями заказа (/admin/orders/:id/complete, /cancel и т.п.). Заказ «в
// долг» подтверждением одобряется — со сроком из тела или по умолчанию.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminConfirmOrderType>,
  res: MedusaResponse
) {
  // Дата срока — конец дня магазина (UTC+5): «до 12 ноября» — включительно.
  const dueDate = req.validatedBody?.debt_due_date
    ? `${req.validatedBody.debt_due_date}T23:59:59+05:00`
    : null
  const { result } = await confirmOrderWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      actor_type: "admin",
      actor_id: req.auth_context.actor_id,
      debt_due_date: dueDate,
    },
    throwOnError: true,
  })

  res.json({ order_id: req.params.id, status: result.to })
}
