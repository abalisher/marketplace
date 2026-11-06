import { MedusaService } from "@medusajs/framework/utils"
import Tenant from "./models/tenant"

class TenantModuleService extends MedusaService({
  Tenant,
}) {
  // Приостановленная компания для витрины и проверок доступа не существует:
  // поиски ниже возвращают только активные. Полный список (с suspended) —
  // обычный listTenants.
  async getActiveBySlug(slug: string) {
    const [tenant] = await this.listTenants(
      { slug: slug.toLowerCase(), status: "active" },
      { take: 1 }
    )
    return tenant ?? null
  }

  // Компания — продавец заказа/корзины этого канала, в любом статусе: заказы
  // приостановленной компании остаются её заказами (документы, реестр).
  async getBySalesChannel(salesChannelId: string) {
    const [tenant] = await this.listTenants(
      { sales_channel_id: salesChannelId },
      { take: 1 }
    )
    return tenant ?? null
  }

  async getActiveBySalesChannels(salesChannelIds: string[]) {
    if (!salesChannelIds.length) {
      return null
    }
    const [tenant] = await this.listTenants(
      { sales_channel_id: salesChannelIds, status: "active" },
      { take: 1 }
    )
    return tenant ?? null
  }
}

export default TenantModuleService
