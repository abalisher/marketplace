import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { TENANT_MODULE } from "../../../../modules/tenant"
import TenantModuleService from "../../../../modules/tenant/service"
import { serializeTenantForStore } from "../serialize"

// Slug компании: латиница, цифры и дефис — он же сегмент адреса витрины.
const SLUG = /^[a-z0-9-]{1,64}$/

// GET /store/tenants/:slug — карточка активной компании для её витрины.
// Приостановленная компания для витрины не существует (404).
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
  res.json({ tenant: await serializeTenantForStore(req.scope, tenant) })
}
