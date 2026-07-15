import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { ExecArgs } from "@medusajs/framework/types"
import {
  addShippingMethodToCartWorkflow,
  createCartWorkflow,
  createInventoryLevelsWorkflow,
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
  createProductsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { placeOrderWorkflow } from "../workflows/place-order"
import { confirmOrderWorkflow } from "../workflows/confirm-order"
import { startOrderAssemblyWorkflow } from "../workflows/start-order-assembly"
import { completeOrderAssemblyWorkflow } from "../workflows/complete-order-assembly"
import { shipOrderWorkflow } from "../workflows/ship-order"

// Демо-заказы для ручной проверки админ-UI жизненного цикла (очередь заказов +
// widget статуса/переходов на странице заказа). Строит минимальную инфраструктуру
// доставки (fulfillment set / service zone / shipping option), если её ещё нет
// (в seed-kz.ts она осознанно отложена), и размещает три заказа на разных этапах:
// new, confirmed, in_delivery. Идемпотентен по маркеру — повторный запуск
// доп. заказы не плодит.
//
// Запуск: npx medusa exec ./src/scripts/seed-demo-order.ts
export default async function seedDemoOrder({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const orderService = container.resolve(Modules.ORDER)

  const MARKER_EMAIL = "demo-order-buyer@example.com"

  // Идемпотентность: если демо-заказы уже есть — выходим.
  const { data: existing } = await query.graph({
    entity: "order",
    fields: ["id"],
    filters: { email: MARKER_EMAIL },
  })
  if (existing.length) {
    logger.info(
      `Demo orders already seeded (${existing.length} found for ${MARKER_EMAIL}). Skipping.`
    )
    return
  }

  // Регион (переиспользуем существующий, иначе — понятная ошибка).
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  })
  if (!regions.length) {
    throw new Error(
      "No region found. Run seed-kz.ts (or core seed) before seeding demo orders."
    )
  }
  const region = regions[0] as { id: string; currency_code: string }

  // Канал продаж.
  const { data: channels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
  })
  let salesChannelId: string
  if (channels.length) {
    salesChannelId = (channels[0] as { id: string }).id
  } else {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Demo Channel" }] },
    })
    salesChannelId = result[0].id
  }

  // Склад (переиспустим первый, иначе создаём в Астане).
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  })
  let locationId: string
  if (locations.length) {
    locationId = (locations[0] as { id: string }).id
  } else {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Demo Warehouse",
            address: {
              city: "Astana",
              country_code: region.currency_code === "kzt" ? "kz" : "us",
              address_1: "1",
            },
          },
        ],
      },
    })
    locationId = result[0].id
  }
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: locationId, add: [salesChannelId] },
  })

  // Профиль доставки по умолчанию.
  let [shippingProfile] = await fulfillment.listShippingProfiles(
    { type: "default" },
    { take: 1 }
  )
  if (!shippingProfile) {
    shippingProfile = await fulfillment.createShippingProfiles({
      name: "Default",
      type: "default",
    })
  }

  // Fulfillment set + зона + linked provider (manual) — минимальная доставка.
  const countryCode = region.currency_code === "kzt" ? "kz" : "us"
  const fulfillmentSet = await fulfillment.createFulfillmentSets({
    name: "Demo Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Zone",
        geo_zones: [{ country_code: countryCode, type: "country" }],
      },
    ],
  })
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: locationId },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  })
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: locationId },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  })

  const { result: shippingOptions } = await createShippingOptionsWorkflow(
    container
  ).run({
    input: [
      {
        name: "Demo Standard",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Standard delivery",
          code: "standard",
        },
        prices: [
          { currency_code: region.currency_code, amount: 10 },
          { region_id: region.id, amount: 10 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  })
  const shippingOptionId = shippingOptions[0].id

  // Товар с остатком (свой, чтобы не зависеть от статуса модерации каталожных).
  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Demo Order Product",
          status: ProductStatus.PUBLISHED,
          sales_channels: [{ id: salesChannelId }],
          options: [{ title: "Size", values: ["1u"] }],
          variants: [
            {
              title: "1u",
              sku: "DEMO-ORD-1U",
              manage_inventory: true,
              options: { Size: "1u" },
              prices: [{ amount: 100, currency_code: region.currency_code }],
            },
          ],
        },
      ],
    },
  })
  const variantId = products[0].variants![0].id
  await link.create({
    [Modules.PRODUCT]: { product_id: products[0].id },
    [Modules.FULFILLMENT]: { shipping_profile_id: shippingProfile.id },
  })

  const { data: withInventory } = await query.graph({
    entity: "product",
    fields: ["variants.inventory_items.inventory.id"],
    filters: { id: products[0].id },
  })
  const inventoryItemId = (withInventory[0] as any)?.variants?.[0]
    ?.inventory_items?.[0]?.inventory?.id as string
  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: [
        {
          inventory_item_id: inventoryItemId,
          location_id: locationId,
          stocked_quantity: 1000,
        },
      ],
    },
  })

  // Готовит корзину и оформляет заказ, возвращает его id.
  const placeOne = async (index: number) => {
    const { result: cart } = await createCartWorkflow(container).run({
      input: {
        region_id: region.id,
        sales_channel_id: salesChannelId,
        currency_code: region.currency_code,
        email: MARKER_EMAIL,
        shipping_address: {
          first_name: "Demo",
          last_name: `Buyer ${index}`,
          address_1: "1 Demo St",
          city: "Astana",
          country_code: countryCode,
          postal_code: "010000",
        },
        items: [{ variant_id: variantId, quantity: 2 }],
      },
    })
    await addShippingMethodToCartWorkflow(container).run({
      input: { cart_id: cart.id, options: [{ id: shippingOptionId }] },
    })
    await createPaymentCollectionForCartWorkflow(container).run({
      input: { cart_id: cart.id },
    })
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: ["id", "payment_collection.id"],
      filters: { id: cart.id },
    })
    const paymentCollectionId = (
      carts[0] as { payment_collection?: { id: string } }
    ).payment_collection!.id
    await createPaymentSessionsWorkflow(container).run({
      input: {
        payment_collection_id: paymentCollectionId,
        provider_id: "pp_system_default",
      },
    })
    const { result } = await placeOrderWorkflow(container).run({
      input: { cart_id: cart.id },
    })
    return (result as { order: { id: string } }).order.id
  }

  const orderItems = async (orderId: string) => {
    const order = await orderService.retrieveOrder(orderId, {
      relations: ["items"],
    })
    return (order.items ?? []).map((i) => ({
      id: i.id,
      quantity: Number(i.quantity),
    }))
  }

  // Заказ 1 — остаётся в статусе new.
  await placeOne(1)

  // Заказ 2 — подтверждён (new → confirmed).
  const order2 = await placeOne(2)
  await confirmOrderWorkflow(container).run({
    input: { order_id: order2, actor_type: "admin" },
  })

  // Заказ 3 — в доставке (new → confirmed → assembling → assembled → in_delivery).
  const order3 = await placeOne(3)
  await confirmOrderWorkflow(container).run({
    input: { order_id: order3, actor_type: "admin" },
  })
  await startOrderAssemblyWorkflow(container).run({
    input: { order_id: order3, actor_type: "admin" },
  })
  const items3 = await orderItems(order3)
  await completeOrderAssemblyWorkflow(container).run({
    input: { order_id: order3, items: items3, actor_type: "admin" },
  })
  const { data: order3Full } = await query.graph({
    entity: "order",
    fields: ["id", "fulfillments.id"],
    filters: { id: order3 },
  })
  const fulfillmentId = (order3Full[0] as { fulfillments: { id: string }[] })
    .fulfillments[0].id
  await shipOrderWorkflow(container).run({
    input: {
      order_id: order3,
      fulfillment_id: fulfillmentId,
      items: items3,
      actor_type: "admin",
    },
  })

  logger.info(
    "Seeded 3 demo orders (new, confirmed, in_delivery) for admin lifecycle UI verification."
  )
}
