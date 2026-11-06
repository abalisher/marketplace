import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { TENANT_MODULE } from "../../modules/tenant"
import TenantModuleService from "../../modules/tenant/service"
import { publicTenantName } from "./public-name"

// Канал продаж запроса витрины — из publishable key: ядро проверяет ключ на
// каждом /store-запросе и кладёт его каналы в контекст. Продавца витрины
// определяет только он — заголовок, cookie или поле тела подделывается
// клиентом, ключ же выдаёт площадка (у каждой компании свой).
export const requestSalesChannelId = (req: {
  publishable_key_context?: { sales_channel_ids?: string[] }
}): string | undefined => req.publishable_key_context?.sales_channel_ids?.[0]

// Компания — продавец витрины канала, или null: витрина самой площадки.
// Приостановленная компания на витрине не торгует.
export const resolveStoreTenant = async (
  container: MedusaContainer,
  salesChannelId: string | undefined
) =>
  salesChannelId
    ? container
        .resolve<TenantModuleService>(TENANT_MODULE)
        .getActiveBySalesChannels([salesChannelId])
    : null

type ChannelDeliveryRow = {
  stock_locations?: ({
    fulfillment_sets?: ({
      service_zones?: ({
        shipping_options?: ({
          prices?: ({ amount?: number | null; currency_code?: string | null } | null)[]
        } | null)[]
      } | null)[]
    } | null)[]
  } | null)[]
}

// Цена доставки канала — по его настоящим способам доставки (shipping option
// на складах канала), а не отдельной цифрой в настройках: назвать покупателю
// можно только то, что потом спишется. Несколько опций — самая дешёвая;
// опций нет — null.
export const loadChannelDeliveryPrice = async (
  container: MedusaContainer,
  salesChannelId: string,
  currencyCode = "kzt"
): Promise<number | null> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "sales_channel",
    fields: [
      "id",
      "stock_locations.fulfillment_sets.service_zones.shipping_options.prices.amount",
      "stock_locations.fulfillment_sets.service_zones.shipping_options.prices.currency_code",
    ],
    filters: { id: salesChannelId },
  })
  const amounts = ((data[0] as ChannelDeliveryRow | undefined)?.stock_locations ?? [])
    .flatMap((location) => location?.fulfillment_sets ?? [])
    .flatMap((set) => set?.service_zones ?? [])
    .flatMap((zone) => zone?.shipping_options ?? [])
    .flatMap((option) => option?.prices ?? [])
    .filter((price) => price?.currency_code === currencyCode)
    .map((price) => Number(price?.amount))
    .filter((amount) => Number.isFinite(amount))
  return amounts.length ? Math.min(...amounts) : null
}

// Канал и продавец витрины для хода ассистента: в канале создаётся корзина,
// продавца модель называет покупателю.
export const assistantStorefrontContext = async (
  container: MedusaContainer,
  req: { publishable_key_context?: { sales_channel_ids?: string[] } }
): Promise<{
  salesChannelId: string | undefined
  seller: { name: string; bin: string | null } | null
}> => {
  const salesChannelId = requestSalesChannelId(req)
  const tenant = await resolveStoreTenant(container, salesChannelId)
  return {
    salesChannelId,
    seller: tenant
      ? { name: publicTenantName(tenant.name), bin: tenant.bin ?? null }
      : null,
  }
}

// Publishable key витрины компании — ключ её канала продаж (ядровая связь
// publishable_api_key_sales_channel). Ключ публичный по природе: витрина шлёт
// его в каждом запросе, и именно он делает запрос запросом к этой компании.
export const loadChannelPublishableKey = async (
  container: MedusaContainer,
  salesChannelId: string
): Promise<string | null> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: links } = await query.graph({
    entity: "publishable_api_key_sales_channel",
    fields: ["publishable_key_id"],
    filters: { sales_channel_id: salesChannelId },
  })
  const keyIds = (links as { publishable_key_id: string }[]).map(
    (link) => link.publishable_key_id
  )
  if (!keyIds.length) {
    return null
  }
  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token", "revoked_at"],
    filters: { id: keyIds, type: "publishable" },
  })
  const active = (keys as { token: string; revoked_at?: string | null }[]).find(
    (key) => !key.revoked_at
  )
  return active?.token ?? null
}
