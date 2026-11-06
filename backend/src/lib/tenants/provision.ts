import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { loadChannelStockLocationIds } from "./scope"

// Ядровая инфраструктура компании-продавца: всё, что делает её канал продаж
// самостоятельной витриной. Идемпотентно — повторный запуск достраивает
// недостающее и не трогает существующее (кроме цены доставки, см. ниже).
//
//   канал продаж ── склад компании ── провайдер manual
//        │               └─ набор доставки → зона kz → «Доставка по Астане»
//        └─ publishable key (витрина компании шлёт его в каждом запросе)
//
// Доставка — на СКЛАДЕ компании: ядро подбирает корзине способы доставки по
// складам её канала, поэтому цена компании (2000 у одной, 2500 у другой) — это
// цена её собственной shipping option, а не цифра в настройках.

const PROVIDER_ID = "manual_manual"
const CURRENCY = "kzt"
const DELIVERY_OPTION_NAME = "Доставка по Астане"

type Log = (line: string) => void

// Цена доставки новой компании, если её не назвали.
const DEFAULT_DELIVERY_PRICE = 2000

export type TenantChannelInput = {
  name: string
  address?: string | null
  // Не задана — у существующей доставки цена не меняется, новой ставится
  // DEFAULT_DELIVERY_PRICE.
  delivery_price?: number
}

export type TenantChannel = {
  sales_channel_id: string
  stock_location_id: string
  publishable_key_id: string
}

const ensureSalesChannel = async (
  container: MedusaContainer,
  name: string,
  log: Log
): Promise<string> => {
  const service = container.resolve(Modules.SALES_CHANNEL)
  const channelName = `Канал продаж ${name}`
  const [existing] = await service.listSalesChannels(
    { name: channelName },
    { take: 1 }
  )
  if (existing) {
    return existing.id
  }
  const { result } = await createSalesChannelsWorkflow(container).run({
    input: { salesChannelsData: [{ name: channelName }] },
  })
  log(`+ канал продаж: ${channelName}`)
  return result[0].id
}

const ensureStockLocation = async (
  container: MedusaContainer,
  salesChannelId: string,
  input: TenantChannelInput,
  log: Log
): Promise<string> => {
  const [linked] = await loadChannelStockLocationIds(container, salesChannelId)
  if (linked) {
    return linked
  }
  const locationName = `Склад ${input.name}`
  const service = container.resolve(Modules.STOCK_LOCATION)
  let [location] = await service.listStockLocations(
    { name: locationName },
    { take: 1 }
  )
  if (!location) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: locationName,
            address: {
              address_1: input.address ?? "",
              city: "Астана",
              country_code: "kz",
            },
          },
        ],
      },
    })
    location = result[0]
    log(`+ склад: ${locationName}`)
  }
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: location.id, add: [salesChannelId] },
  })
  return location.id
}

const ensurePublishableKey = async (
  container: MedusaContainer,
  salesChannelId: string,
  name: string,
  log: Log
): Promise<string> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: links } = await query.graph({
    entity: "publishable_api_key_sales_channel",
    fields: ["publishable_key_id"],
    filters: { sales_channel_id: salesChannelId },
  })
  const linked = (links as { publishable_key_id: string }[])[0]
  if (linked) {
    return linked.publishable_key_id
  }
  const { result } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        { title: `Витрина ${name}`, type: "publishable", created_by: "setup-tenant" },
      ],
    },
  })
  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: result[0].id, add: [salesChannelId] },
  })
  log(`+ publishable key витрины: ${result[0].title}`)
  return result[0].id
}

// Способ доставки компании на её складе с её ценой. Существующая опция
// получает переданную цену заново — так «поменять цену доставки компании» =
// перезапуск с новой ценой.
export const ensureTenantDelivery = async (
  container: MedusaContainer,
  input: { name: string; stock_location_id: string; delivery_price?: number },
  log: Log = () => {}
): Promise<void> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillment = container.resolve(Modules.FULFILLMENT)

  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: [
      "id",
      "fulfillment_providers.id",
      "fulfillment_sets.id",
      "fulfillment_sets.service_zones.id",
    ],
    filters: { id: input.stock_location_id },
  })
  const location = locations[0] as
    | {
        fulfillment_providers?: { id: string }[] | null
        fulfillment_sets?: { id: string; service_zones?: { id: string }[] }[] | null
      }
    | undefined
  if (!location) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Склад ${input.stock_location_id} не найден`
    )
  }

  if (!(location.fulfillment_providers ?? []).some((p) => p.id === PROVIDER_ID)) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: input.stock_location_id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: PROVIDER_ID },
    })
  }

  let zoneId = location.fulfillment_sets?.[0]?.service_zones?.[0]?.id
  if (!zoneId) {
    const setName = `Доставка ${input.name}`
    const set = await fulfillment.createFulfillmentSets({
      name: setName,
      type: "shipping",
      service_zones: [
        {
          name: `${setName} — Казахстан`,
          geo_zones: [{ country_code: "kz", type: "country" }],
        },
      ],
    })
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: input.stock_location_id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: set.id },
    })
    zoneId = set.service_zones[0].id
    log(`+ набор доставки: ${setName}`)
  }

  const [existing] = await fulfillment.listShippingOptions(
    { service_zone: { id: zoneId } },
    { take: 1 }
  )
  if (existing) {
    if (input.delivery_price === undefined) {
      return
    }
    await updateShippingOptionsWorkflow(container).run({
      input: [
        {
          id: existing.id,
          prices: [{ currency_code: CURRENCY, amount: input.delivery_price }],
        },
      ],
    })
    return
  }

  const price = input.delivery_price ?? DEFAULT_DELIVERY_PRICE
  const [profile] = await fulfillment.listShippingProfiles(
    { type: "default" },
    { take: 1 }
  )
  if (!profile) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Нет профиля доставки по умолчанию (seed-kz не запускался?)"
    )
  }
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: DELIVERY_OPTION_NAME,
        price_type: "flat",
        provider_id: PROVIDER_ID,
        service_zone_id: zoneId,
        shipping_profile_id: profile.id,
        type: {
          label: "Delivery",
          description: "Доставка по городу",
          code: "delivery",
        },
        prices: [{ currency_code: CURRENCY, amount: price }],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  })
  log(`+ доставка: ${price} ₸`)
}

// Общий каталог площадки — в канал компании. Товары, которые ведёт 1С какой-либо
// компании (product.metadata.source = "1c"), — это её собственный каталог, и в
// чужой канал они не попадают.
export const linkCatalogToChannel = async (
  container: MedusaContainer,
  salesChannelId: string,
  log: Log = () => {}
): Promise<void> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const [{ data: products }, { data: linked }] = await Promise.all([
    query.graph({
      entity: "product",
      fields: ["id", "metadata"],
      filters: { status: "published" },
    }),
    query.graph({
      entity: "product_sales_channel",
      fields: ["product_id"],
      filters: { sales_channel_id: salesChannelId },
    }),
  ])
  const present = new Set(
    (linked as { product_id: string }[]).map((row) => row.product_id)
  )
  const missing = (
    products as { id: string; metadata?: Record<string, unknown> | null }[]
  ).filter((p) => !present.has(p.id) && p.metadata?.source !== "1c")
  if (!missing.length) {
    return
  }
  await link.create(
    missing.map((product) => ({
      [Modules.PRODUCT]: { product_id: product.id },
      [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
    }))
  )
  log(`+ товаров в канале: ${missing.length}`)
}

export const provisionTenantChannel = async (
  container: MedusaContainer,
  input: TenantChannelInput,
  log: Log = () => {}
): Promise<TenantChannel> => {
  const salesChannelId = await ensureSalesChannel(container, input.name, log)
  const stockLocationId = await ensureStockLocation(
    container,
    salesChannelId,
    input,
    log
  )
  const publishableKeyId = await ensurePublishableKey(
    container,
    salesChannelId,
    input.name,
    log
  )
  await ensureTenantDelivery(
    container,
    {
      name: input.name,
      stock_location_id: stockLocationId,
      delivery_price: input.delivery_price,
    },
    log
  )
  return {
    sales_channel_id: salesChannelId,
    stock_location_id: stockLocationId,
    publishable_key_id: publishableKeyId,
  }
}
