import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TENANT_MODULE } from "../../../modules/tenant"
import TenantModuleService from "../../../modules/tenant/service"
import { serializeTenantForStore } from "./serialize"

// GET /store/tenants — активные компании площадки (витрина строит по ним
// страницы компаний).
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const tenants = await req.scope
    .resolve<TenantModuleService>(TENANT_MODULE)
    .listTenants({ status: "active" }, { order: { name: "ASC" } })
  res.json({
    tenants: await Promise.all(
      tenants.map((tenant) => serializeTenantForStore(req.scope, tenant))
    ),
  })
}
