import { MedusaContainer } from "@medusajs/framework/types"
import {
  loadChannelDeliveryPrice,
  loadChannelPublishableKey,
} from "../../../lib/tenants/storefront"
import { publicTenantName } from "../../../lib/tenants/public-name"

type TenantRow = {
  id: string
  name: string
  slug: string
  bin?: string | null
  logo_url?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  sales_channel_id: string
}

// Публичная карточка компании для витрины: то, что можно показать покупателю,
// плюс publishable key её витрины. Название — без формы (ИП, ТОО): она нужна
// только в документах. Внутренних id (канал, склад) наружу нет.
export const serializeTenantForStore = async (
  container: MedusaContainer,
  tenant: TenantRow
) => {
  const [publishableKey, deliveryPrice] = await Promise.all([
    loadChannelPublishableKey(container, tenant.sales_channel_id),
    loadChannelDeliveryPrice(container, tenant.sales_channel_id),
  ])
  return {
    id: tenant.id,
    name: publicTenantName(tenant.name),
    slug: tenant.slug,
    bin: tenant.bin ?? null,
    logo_url: tenant.logo_url ?? null,
    phone: tenant.phone ?? null,
    email: tenant.email ?? null,
    address: tenant.address ?? null,
    publishable_key: publishableKey,
    // Цена доставки — из способа доставки канала (то, что реально спишется).
    delivery_price: deliveryPrice,
  }
}
