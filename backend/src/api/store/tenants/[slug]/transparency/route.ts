import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { TENANT_MODULE } from "../../../../../modules/tenant"
import TenantModuleService from "../../../../../modules/tenant/service"
import { loadTenantTransparency } from "../../../../../lib/tenants/transparency"

const SLUG = /^[a-z0-9-]{1,64}$/

// GET /store/tenants/:slug/transparency — живая сводка учёта компании для её
// страницы: агрегаты и обезличенный журнал (см. lib/tenants/transparency.ts).
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const slug = String(req.params.slug ?? "").toLowerCase()
  const tenant = SLUG.test(slug)
    ? await req.scope
        .resolve<TenantModuleService>(TENANT_MODULE)
        .getActiveBySlug(slug)
    : null
  if (!tenant) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Компания не найдена")
  }
  res.json({
    transparency: await loadTenantTransparency(req.scope, tenant.sales_channel_id),
  })
}
