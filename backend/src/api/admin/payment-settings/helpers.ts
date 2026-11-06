import { AuthenticatedMedusaRequest } from "@medusajs/framework/http"
import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { TENANT_MODULE } from "../../../modules/tenant"
import TenantModuleService from "../../../modules/tenant/service"
import { kaspiModeFor, kaspiStaticQrUrl, settingsView } from "../../../lib/payments/methods"
import { getTenantScope } from "../../utils/tenant-access"

// Продавец на площадке — канал продаж компании. Каналы без компании (служебный
// «Default Sales Channel» ядра: на нём ключ общей витрины, но товаров, заказов и
// денег нет) продавцами не считаются и в выборе продавца не показываются.
export type PaymentSeller = {
  sales_channel_id: string
  name: string
  tenant_id: string | null
}

export const listPaymentSellers = async (
  container: MedusaContainer
): Promise<PaymentSeller[]> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const [{ data: channels }, tenants] = await Promise.all([
    query.graph({ entity: "sales_channel", fields: ["id", "name"] }),
    container
      .resolve<TenantModuleService>(TENANT_MODULE)
      .listTenants({}, { take: null, order: { name: "ASC" } }),
  ])
  const byChannel = new Map(tenants.map((t) => [t.sales_channel_id, t]))
  return (channels as { id: string; name: string }[])
    .filter((channel) => byChannel.has(channel.id))
    .map((channel) => {
      const tenant = byChannel.get(channel.id)!
      return {
        sales_channel_id: channel.id,
        name: tenant.name,
        tenant_id: tenant.id,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Канал, чьи способы оплаты смотрят или правят. Пользователь компании — только
// свой (канал из запроса не слушаем); сотрудник площадки называет его явно.
export const resolvePaymentSeller = async (
  req: AuthenticatedMedusaRequest,
  requested?: string
): Promise<PaymentSeller> => {
  const scope = getTenantScope(req)
  if (scope) {
    return {
      sales_channel_id: scope.sales_channel_id,
      name: scope.name,
      tenant_id: scope.tenant_id,
    }
  }
  if (!requested) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Укажите продавца (sales_channel_id)"
    )
  }
  const seller = (await listPaymentSellers(req.scope)).find(
    (candidate) => candidate.sales_channel_id === requested
  )
  if (!seller) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Продавец не найден")
  }
  return seller
}

type SettingsRow = Parameters<typeof settingsView>[0] & {
  kaspi_webhook_secret_cipher?: string | null
  updated_at?: Date | string | null
}

// Настройки наружу — без ключей: экран знает только, заданы ли они. Режим
// Kaspi — фактический: на стенде (KASPI_MODE=mock) всегда тестовый.
export const serializePaymentSettings = (row: SettingsRow | null) => {
  const view = settingsView(row)
  return {
    ...view,
    has_kaspi_webhook_secret: !!row?.kaspi_webhook_secret_cipher,
    effective_kaspi_mode: kaspiModeFor(view, process.env.KASPI_MODE),
    // Kaspi QR идёт через постоянный QR магазина (ключей API нет).
    kaspi_static_active: !!kaspiStaticQrUrl(view),
    platform_kaspi_mode: process.env.KASPI_MODE === "mock" ? "mock" : "live",
    configured: !!row,
    updated_at: row?.updated_at ?? null,
  }
}
