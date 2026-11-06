import { AuthenticatedMedusaRequest } from "@medusajs/framework/http"
import { getTenantScope } from "../../../../utils/tenant-access"

// Кто отметил движение денег: пользователь компании — продавец, иначе —
// сотрудник площадки.
export const paymentActor = (req: AuthenticatedMedusaRequest) => ({
  actor_type: (getTenantScope(req) ? "seller" : "admin") as "seller" | "admin",
  actor_id: req.auth_context.actor_id,
})
