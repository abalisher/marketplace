import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { IUserModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { setDriverStatusWorkflow } from "../../../../../workflows/set-driver-status"
import {
  loadDriverDeciderNames,
  toAdminDriverView,
} from "../../driver-admin-view"
import { AdminSetDriverStatusType } from "../../validators"

// POST /admin/drivers/:id/status — решение продавца по водителю: допустить к
// заказам или закрыть доступ (отказ по заявке и блокировка — одно состояние,
// различает их причина). Причина уходит водителю в приложение, поэтому пишется
// человеческим текстом. Кто решил — берём из учётки (actor_id), телом не
// принимаем.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminSetDriverStatusType>,
  res: MedusaResponse
) {
  const { result } = await setDriverStatusWorkflow(req.scope).run({
    input: {
      driver_id: req.params.id,
      status: req.validatedBody.status,
      note: req.validatedBody.note ?? null,
      actor_id: req.auth_context?.actor_id ?? null,
    },
    throwOnError: true,
  })

  // Ответ — тот же вид, что и в очереди: экран показывает решение сразу
  // именем, не перезапрашивая карточку.
  const names = await loadDriverDeciderNames(
    req.scope.resolve<IUserModuleService>(Modules.USER),
    [result]
  )

  res.json({ driver: toAdminDriverView(result, names) })
}
