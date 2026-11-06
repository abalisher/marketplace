import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { TENANT_MODULE } from "../../../modules/tenant"
import TenantModuleService from "../../../modules/tenant/service"
import { OnecRequestError } from "../../../lib/onec/client"
import { OnecSecretError } from "../../../lib/onec/secret"
import { OnecSyncError } from "../../../lib/onec/sync"
import { getTenantScope } from "../../utils/tenant-access"

// Компания, чьё подключение к 1С смотрят или правят. Продавец компании — только
// своя (tenant_id из запроса не слушаем); сотрудник площадки называет её явно.
export const resolveOnecTenant = async (
  req: AuthenticatedMedusaRequest,
  requested?: string
) => {
  const scope = getTenantScope(req)
  const tenantId = scope?.tenant_id ?? requested
  if (!tenantId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Укажите компанию (tenant_id)"
    )
  }
  const tenants = req.scope.resolve<TenantModuleService>(TENANT_MODULE)
  const [tenant] = await tenants.listTenants({ id: tenantId }, { take: 1 })
  if (!tenant) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Компания не найдена")
  }
  return tenant
}

// Подключение наружу — без пароля: экран знает только, что он задан.
export const serializeOnecConnection = (
  connection: {
    id: string
    tenant_id: string
    source: "http" | "file"
    base_url: string | null
    stock_url: string | null
    login: string | null
    password_cipher: string | null
    enabled: boolean
    interval_minutes: number
    exclusive_catalog: boolean
    stock_location_id: string | null
    updated_at?: Date | string
  } | null
) =>
  connection
    ? {
        id: connection.id,
        tenant_id: connection.tenant_id,
        source: connection.source,
        base_url: connection.base_url,
        stock_url: connection.stock_url,
        login: connection.login,
        has_password: !!connection.password_cipher,
        enabled: connection.enabled,
        interval_minutes: connection.interval_minutes,
        exclusive_catalog: connection.exclusive_catalog,
        stock_location_id: connection.stock_location_id,
        updated_at: connection.updated_at ?? null,
      }
    : null

// Ошибки 1С и синхронизации — понятным ответом, а не 500: экран показывает
// message как есть.
export const respondOnecError = (
  res: MedusaResponse,
  error: unknown
): boolean => {
  if (error instanceof OnecRequestError) {
    res.status(422).json({
      type: "onec_error",
      code: error.code,
      status: error.status ?? null,
      message: error.message,
    })
    return true
  }
  if (error instanceof OnecSyncError) {
    res.status(error.code === "busy" ? 409 : 422).json({
      type: "onec_sync_error",
      code: error.code,
      message: error.message,
    })
    return true
  }
  if (error instanceof OnecSecretError) {
    res.status(422).json({
      type: "onec_secret_error",
      code: "password_unreadable",
      message: error.message,
    })
    return true
  }
  return false
}
