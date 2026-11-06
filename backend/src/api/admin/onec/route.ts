import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ONEC_MODULE } from "../../../modules/onec"
import OnecModuleService from "../../../modules/onec/service"
import { TENANT_MODULE } from "../../../modules/tenant"
import TenantModuleService from "../../../modules/tenant/service"
import { loadChannelStockLocationIds } from "../../../lib/tenants/scope"
import { upsertOnecConnectionWorkflow } from "../../../workflows/onec/upsert-onec-connection"
import { getTenantScope } from "../../utils/tenant-access"
import { resolveOnecTenant, serializeOnecConnection } from "./helpers"
import {
  AdminGetOnecParamsType,
  AdminUpsertOnecConnectionType,
} from "./validators"

const serializeRun = (run: {
  id: string
  trigger: string
  status: string
  started_at: Date | string
  finished_at: Date | string | null
  received: number
  created: number
  updated: number
  unchanged: number
  hidden: number
  detached: number
  failed: number
  error: string | null
  issues: unknown
  file_name?: string | null
}) => ({
  id: run.id,
  trigger: run.trigger,
  status: run.status,
  started_at: run.started_at,
  finished_at: run.finished_at,
  received: run.received,
  created: run.created,
  updated: run.updated,
  unchanged: run.unchanged,
  hidden: run.hidden,
  detached: run.detached,
  failed: run.failed,
  error: run.error,
  issues: Array.isArray(run.issues) ? run.issues : [],
  file_name: run.file_name ?? null,
})

// GET /admin/onec — подключение компании к 1С, её склады и последние прогоны.
// Сотрудник площадки без tenant_id получает список компаний с состоянием их
// подключений — чтобы выбрать, чьё открыть.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { tenant_id } = req.validatedQuery as AdminGetOnecParamsType
  const service = req.scope.resolve<OnecModuleService>(ONEC_MODULE)

  if (!getTenantScope(req) && !tenant_id) {
    const tenants = await req.scope
      .resolve<TenantModuleService>(TENANT_MODULE)
      .listTenants({}, { take: null, order: { name: "ASC" } })
    const connections = await service.listOnecConnections({}, { take: null })
    const byTenant = new Map(connections.map((c) => [c.tenant_id, c]))
    const tenantsOut = await Promise.all(
      tenants.map(async (tenant) => {
        const last = await service.getLastRun(tenant.id)
        const connection = byTenant.get(tenant.id) ?? null
        return {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          connection: serializeOnecConnection(connection),
          last_run: last ? serializeRun(last) : null,
        }
      })
    )
    res.json({ tenants: tenantsOut })
    return
  }

  const tenant = await resolveOnecTenant(req, tenant_id)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const [connection, runs, locationIds, managed] = await Promise.all([
    service.getConnectionByTenant(tenant.id),
    service.listRecentRuns(tenant.id, 20),
    loadChannelStockLocationIds(req.scope, tenant.sales_channel_id),
    service.listOnecItems({ tenant_id: tenant.id }, { take: null, select: ["id", "present"] }),
  ])
  const { data: locations } = locationIds.length
    ? await query.graph({
        entity: "stock_location",
        fields: ["id", "name"],
        filters: { id: locationIds },
      })
    : { data: [] }

  res.json({
    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
    connection: serializeOnecConnection(connection),
    locations: (locations as { id: string; name: string }[]).map((l) => ({
      id: l.id,
      name: l.name,
    })),
    products: {
      total: managed.length,
      present: managed.filter((item) => item.present).length,
    },
    runs: runs.map(serializeRun),
  })
}

// POST /admin/onec — сохранить подключение (адрес, логин, пароль, расписание).
export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpsertOnecConnectionType>,
  res: MedusaResponse
) {
  const { tenant_id, ...fields } = req.validatedBody
  const tenant = await resolveOnecTenant(req, tenant_id)

  if (fields.stock_location_id) {
    const allowed = await loadChannelStockLocationIds(
      req.scope,
      tenant.sales_channel_id
    )
    if (!allowed.includes(fields.stock_location_id)) {
      res.status(400).json({
        type: "invalid_data",
        message: "Склад не принадлежит компании",
      })
      return
    }
  }

  const { result } = await upsertOnecConnectionWorkflow(req.scope).run({
    input: { tenant_id: tenant.id, ...fields },
    throwOnError: true,
  })
  res.json({ connection: serializeOnecConnection(result) })
}
