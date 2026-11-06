import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { startOnecSync } from "../../../../lib/onec/sync"
import { resolveOnecTenant, respondOnecError } from "../helpers"
import { AdminSyncOnecType } from "../validators"

// POST /admin/onec/sync — запустить синхронизацию сейчас. Прогон идёт в фоне
// (первый — минуты), ответ 202 сразу; ход и итог — в журнале прогонов
// (GET /admin/onec).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminSyncOnecType>,
  res: MedusaResponse
) {
  const tenant = await resolveOnecTenant(req, req.validatedBody.tenant_id)
  try {
    await startOnecSync(req.scope, {
      tenant_id: tenant.id,
      trigger: "manual",
      user_id: req.auth_context?.actor_id ?? null,
    })
    res.status(202).json({ started: true })
  } catch (error) {
    if (respondOnecError(res, error)) {
      return
    }
    throw error
  }
}
