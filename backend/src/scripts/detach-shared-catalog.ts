import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  deleteInventoryLevelsWorkflow,
  linkProductsToSalesChannelWorkflow,
} from "@medusajs/medusa/core-flows"
import { TENANT_MODULE } from "../modules/tenant"
import TenantModuleService from "../modules/tenant/service"
import { ONEC_PRODUCT_SOURCE } from "../lib/onec/plan"
import { loadChannelStockLocationIds } from "../lib/tenants/scope"

// Убрать из каталога компании общий (демо) каталог площадки: в канале компании
// остаются только её товары из 1С. Сами товары не удаляются — они остаются у
// площадки и других компаний, заказы на них не трогаются.
//
// Заодно со складов компании снимаются остатки товаров, которых нет в её
// каталоге: их завели, пока компания продавала общий каталог, и на «Ценах и
// остатках» они выглядели как её остатки. Остаток под резервом (идущий заказ)
// не трогаем — его снимет отгрузка.
//
// Синхронизация с 1С (exclusive_catalog) делает это сама, но только когда у
// компании появился первый продаваемый товар из 1С — чтобы витрина не осталась
// пустой. Этот скрипт — для решения владельца убрать демо сразу.
//
//   TENANT_SLUG=orgstroy npx medusa exec ./src/scripts/detach-shared-catalog.ts
export default async function detachSharedCatalog({ container }: ExecArgs) {
  const slug = process.env.TENANT_SLUG?.trim()
  if (!slug) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Задайте TENANT_SLUG")
  }
  const [tenant] = await container
    .resolve<TenantModuleService>(TENANT_MODULE)
    .listTenants({ slug }, { take: 1 })
  if (!tenant) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Компания «${slug}» не найдена`)
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: links } = await query.graph({
    entity: "product_sales_channel",
    fields: ["product_id"],
    filters: { sales_channel_id: tenant.sales_channel_id },
  })
  const ids = [...new Set((links as { product_id: string }[]).map((l) => l.product_id))]
  const { data: products } = ids.length
    ? await query.graph({
        entity: "product",
        fields: ["id", "title", "metadata"],
        filters: { id: ids },
      })
    : { data: [] }
  const shared = (
    products as { id: string; title: string; metadata?: Record<string, unknown> | null }[]
  ).filter((product) => product.metadata?.source !== ONEC_PRODUCT_SOURCE)

  if (shared.length) {
    await linkProductsToSalesChannelWorkflow(container).run({
      input: { id: tenant.sales_channel_id, remove: shared.map((product) => product.id) },
      throwOnError: true,
    })
  }
  console.log(
    `Из каталога «${tenant.name}» убрано общих товаров: ${shared.length}; товаров из 1С: ${products.length - shared.length}`
  )

  // Склады, которые принадлежат ТОЛЬКО этой компании: остатки на общем складе
  // могут быть чужими.
  const locationIds = await loadChannelStockLocationIds(container, tenant.sales_channel_id)
  const { data: locationChannels } = locationIds.length
    ? await query.graph({
        entity: "sales_channel_location",
        fields: ["stock_location_id", "sales_channel_id"],
        filters: { stock_location_id: locationIds },
      })
    : { data: [] }
  const ownLocations = new Set(
    locationIds.filter((locationId) =>
      (locationChannels as { stock_location_id: string; sales_channel_id: string }[])
        .filter((row) => row.stock_location_id === locationId)
        .every((row) => row.sales_channel_id === tenant.sales_channel_id)
    )
  )
  const own = new Set(ids.filter((id) => !shared.some((product) => product.id === id)))
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "product_id",
      "inventory_items.inventory.location_levels.id",
      "inventory_items.inventory.location_levels.location_id",
      "inventory_items.inventory.location_levels.reserved_quantity",
    ],
  })
  const levels = (
    variants as {
      product_id: string
      inventory_items?: {
        inventory?: {
          location_levels?: { id: string; location_id: string; reserved_quantity: number }[]
        }
      }[]
    }[]
  )
    .filter((variant) => !own.has(variant.product_id))
    .flatMap((variant) =>
      (variant.inventory_items ?? []).flatMap((item) => item.inventory?.location_levels ?? [])
    )
    .filter((level) => ownLocations.has(level.location_id))
  const free = levels.filter((level) => !Number(level.reserved_quantity))
  if (free.length) {
    await deleteInventoryLevelsWorkflow(container).run({
      input: { id: free.map((level) => level.id), force: true },
      throwOnError: true,
    })
  }
  console.log(
    `Со складов «${tenant.name}» снято остатков чужих товаров: ${free.length}${
      levels.length > free.length
        ? ` (под резервом оставлено: ${levels.length - free.length})`
        : ""
    }`
  )
}
