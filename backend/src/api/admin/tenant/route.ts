import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getTenantScope } from "../../utils/tenant-access"

// GET /admin/tenant — компания, от имени которой работает пользователь панели,
// и роль в ней (seller | picker), или null (сотрудник площадки). Панель
// подписывает по ней шапку и закрывает то, что роли недоступно (правку цены,
// сборку и отгрузку у продавца).
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const tenant = getTenantScope(req)
  res.json({
    tenant: tenant
      ? {
          id: tenant.tenant_id,
          name: tenant.name,
          slug: tenant.slug,
          role: tenant.role,
        }
      : null,
  })
}
