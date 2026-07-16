import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import {
  addShippingMethodToCartWorkflow,
  createCartWorkflow,
  createInventoryLevelsWorkflow,
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { placeOrderWorkflow } from "../../src/workflows/place-order"
import { confirmOrderWorkflow } from "../../src/workflows/confirm-order"
import { startOrderAssemblyWorkflow } from "../../src/workflows/start-order-assembly"
import { completeOrderAssemblyWorkflow } from "../../src/workflows/complete-order-assembly"
import { shipOrderWorkflow } from "../../src/workflows/ship-order"
import { deliverOrderWorkflow } from "../../src/workflows/deliver-order"
import { closeOrderWorkflow } from "../../src/workflows/close-order"
import { cancelOrderWorkflow } from "../../src/workflows/cancel-order"
import { ORDER_LIFECYCLE_MODULE } from "../../src/modules/order-lifecycle"
import OrderLifecycleModuleService from "../../src/modules/order-lifecycle/service"

jest.setTimeout(180000)

// Сквозные тесты жизненного цикла заказа: place-order (обёртка над
// completeCart) и переходы (confirm → assembling → complete-assembly →
// ship → deliver → close, плюс cancel). Требует полную инфраструктуру доставки
// (регион, канал продаж, склад, fulfillment set + service zone, shipping option
// manual, товар с остатком), которую фикстура строит один раз. Нужен
// docker-postgres; временная БД — backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    let container: MedusaContainer

    let regionId: string
    let salesChannelId: string
    let shippingOptionId: string
    let variantId: string
    let seq = 0

    const query = () => container.resolve(ContainerRegistrationKeys.QUERY)

    // Ошибка шага workflow сериализуется в plain object (не instanceof Error) —
    // проверяем отклонение по message через try/catch (как в остальных spec'ах).
    const expectWorkflowError = async (
      run: PromiseLike<unknown>,
      substring: string
    ) => {
      let thrown: { message?: string } | null = null
      try {
        await run
      } catch (e) {
        thrown = e as { message?: string }
      }
      expect(thrown?.message).toContain(substring)
    }

    beforeAll(async () => {
      container = getContainer()
      const fulfillment = container.resolve(Modules.FULFILLMENT)
      const link = container.resolve(ContainerRegistrationKeys.LINK)

      // Регион (usd, платёжный провайдер system_default — авто-авторизация).
      const { result: regions } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Test Region",
              currency_code: "usd",
              countries: ["us"],
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      })
      regionId = regions[0].id

      // Канал продаж + склад в нём.
      const { result: channels } = await createSalesChannelsWorkflow(
        container
      ).run({
        input: { salesChannelsData: [{ name: "Test Channel" }] },
      })
      salesChannelId = channels[0].id

      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "Test Warehouse",
              address: { city: "Astana", country_code: "us", address_1: "1" },
            },
          ],
        },
      })
      const locationId = locations[0].id
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: { id: locationId, add: [salesChannelId] },
      })

      // Профиль доставки (дефолтный) + fulfillment set со service zone (страна
      // us) на складе.
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

      const fulfillmentSet = await fulfillment.createFulfillmentSets({
        name: "Test Delivery",
        type: "shipping",
        service_zones: [
          {
            name: "US",
            geo_zones: [{ country_code: "us", type: "country" }],
          },
        ],
      })
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: locationId },
        [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
      })
      // Провайдер доставки должен быть включён для склада, иначе
      // createShippingOptions отклонит provider_id (validate-fulfillment-providers).
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: locationId },
        [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
      })

      const { result: shippingOptions } = await createShippingOptionsWorkflow(
        container
      ).run({
        input: [
          {
            name: "Standard",
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
              { currency_code: "usd", amount: 10 },
              { region_id: regionId, amount: 10 },
            ],
            rules: [
              { attribute: "enabled_in_store", value: "true", operator: "eq" },
              { attribute: "is_return", value: "false", operator: "eq" },
            ],
          },
        ],
      })
      shippingOptionId = shippingOptions[0].id

      // Товар с вариантом, ценой и остатком на складе.
      const { result: products } = await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: "Test Cement",
              status: ProductStatus.PUBLISHED,
              sales_channels: [{ id: salesChannelId }],
              options: [{ title: "Size", values: ["25kg"] }],
              variants: [
                {
                  title: "25kg",
                  sku: "TEST-CEM-25",
                  manage_inventory: true,
                  options: { Size: "25kg" },
                  prices: [{ amount: 20, currency_code: "usd" }],
                },
              ],
            },
          ],
        },
      })
      variantId = products[0].variants[0].id

      // Товар → shipping profile (link): без него completeCart отклоняет
      // заказ (validate-shipping — «items require shipping profiles»).
      await link.create({
        [Modules.PRODUCT]: { product_id: products[0].id },
        [Modules.FULFILLMENT]: { shipping_profile_id: shippingProfile.id },
      })

      const { data: withInventory } = await query().graph({
        entity: "product",
        fields: ["variants.inventory_items.inventory.id"],
        filters: { id: products[0].id },
      })
      const inventoryItemId = withInventory[0]?.variants?.[0]
        ?.inventory_items?.[0]?.inventory?.id as string
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: [
            {
              inventory_item_id: inventoryItemId,
              location_id: locationId,
              stocked_quantity: 100,
            },
          ],
        },
      })
    })

    // Оформляет свежий заказ через полный флоу корзины + place-order.
    const placeTestOrder = async () => {
      seq += 1
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          currency_code: "usd",
          email: `buyer${seq}@example.com`,
          shipping_address: {
            first_name: "Test",
            last_name: "Buyer",
            address_1: "1 Test St",
            city: "Astana",
            country_code: "us",
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
      const { data: carts } = await query().graph({
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
      return result
    }

    const orderItems = async (orderId: string) => {
      // query.graph не отдаёт quantity позиции (BigNumber) — читаем через сервис
      // заказа, где quantity доступно; приводим к числу для createOrderFulfillment.
      const orderService = container.resolve(Modules.ORDER)
      const order = await orderService.retrieveOrder(orderId, {
        relations: ["items"],
      })
      return (order.items ?? []).map((i) => ({
        id: i.id,
        quantity: Number(i.quantity),
      }))
    }

    const orderFulfillmentId = async (orderId: string) => {
      const { data: orders } = await query().graph({
        entity: "order",
        fields: ["id", "fulfillments.id"],
        filters: { id: orderId },
      })
      return (orders[0] as { fulfillments: { id: string }[] }).fulfillments[0]
        .id
    }

    const lifecycleStatus = async (orderId: string) => {
      const { data: orders } = await query().graph({
        entity: "order",
        fields: ["id", "order_lifecycle.status"],
        filters: { id: orderId },
      })
      return (orders[0] as { order_lifecycle?: { status: string } })
        .order_lifecycle?.status
    }

    // Код получения (выдаётся ship-order'ом) — нужен для deliver при delivery.
    const deliveryCode = async (orderId: string) => {
      const { data: orders } = await query().graph({
        entity: "order",
        fields: ["id", "order_lifecycle.delivery_code"],
        filters: { id: orderId },
      })
      return (
        orders[0] as { order_lifecycle?: { delivery_code: string | null } }
      ).order_lifecycle?.delivery_code
    }

    describe("placeOrderWorkflow", () => {
      it("completes the cart and creates a lifecycle in status 'new'", async () => {
        const { order, lifecycle } = await placeTestOrder()

        expect(order.id).toMatch(/^order_/)
        expect(lifecycle.status).toEqual("new")

        // Link 1:1 заказ ↔ жизненный цикл виден через query.graph.
        expect(await lifecycleStatus(order.id)).toEqual("new")
      })
    })

    describe("lifecycle transitions (happy path)", () => {
      it("walks new → confirmed → assembling → assembled → in_delivery → delivered → closed", async () => {
        const { order } = await placeTestOrder()

        await confirmOrderWorkflow(container).run({
          input: { order_id: order.id, actor_type: "seller", actor_id: "u1" },
        })
        expect(await lifecycleStatus(order.id)).toEqual("confirmed")

        await startOrderAssemblyWorkflow(container).run({
          input: { order_id: order.id, actor_type: "seller" },
        })
        expect(await lifecycleStatus(order.id)).toEqual("assembling")

        // Полная сборка всех позиций → assembled (по fulfillment_status ядра).
        const items = await orderItems(order.id)
        await completeOrderAssemblyWorkflow(container).run({
          input: {
            order_id: order.id,
            items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
            actor_type: "seller",
          },
        })
        expect(await lifecycleStatus(order.id)).toEqual("assembled")

        const fulfillmentId = await orderFulfillmentId(order.id)
        await shipOrderWorkflow(container).run({
          input: {
            order_id: order.id,
            fulfillment_id: fulfillmentId,
            items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
            actor_type: "seller",
          },
        })
        expect(await lifecycleStatus(order.id)).toEqual("in_delivery")

        // При отгрузке выдан 6-значный код получения; без него вручение
        // отклоняется инвариантом приёмки.
        const code = await deliveryCode(order.id)
        expect(code).toMatch(/^\d{6}$/)
        await expectWorkflowError(
          deliverOrderWorkflow(container).run({
            input: {
              order_id: order.id,
              fulfillment_id: fulfillmentId,
              actor_type: "system",
            },
            throwOnError: true,
          }),
          "missing or invalid"
        )
        expect(await lifecycleStatus(order.id)).toEqual("in_delivery")

        await deliverOrderWorkflow(container).run({
          input: {
            order_id: order.id,
            fulfillment_id: fulfillmentId,
            delivery_code: code,
            actor_type: "system",
          },
        })
        expect(await lifecycleStatus(order.id)).toEqual("delivered")

        await closeOrderWorkflow(container).run({
          input: { order_id: order.id, actor_type: "system" },
        })
        expect(await lifecycleStatus(order.id)).toEqual("closed")

        // Лог переходов ведётся бессрочно — по записи на переход.
        const service =
          container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
        const { data: orders } = await query().graph({
          entity: "order",
          fields: ["id", "order_lifecycle.id"],
          filters: { id: order.id },
        })
        const lifecycleId = (
          orders[0] as unknown as { order_lifecycle: { id: string } }
        ).order_lifecycle.id
        const [, count] = await service.listAndCountOrderLifecycleEvents({
          order_lifecycle: lifecycleId,
        })
        // 6 переходов: confirmed, assembling, assembled, in_delivery,
        // delivered, closed (лог ведётся бессрочно — запись на переход).
        expect(count).toEqual(6)
      })
    })

    describe("partial assembly", () => {
      it("fulfilling part of the order → partially_assembled", async () => {
        const { order } = await placeTestOrder()

        await confirmOrderWorkflow(container).run({
          input: { order_id: order.id, actor_type: "seller" },
        })
        await startOrderAssemblyWorkflow(container).run({
          input: { order_id: order.id, actor_type: "seller" },
        })

        // Заказано 2 шт — собираем только 1 → частичная сборка.
        const items = await orderItems(order.id)
        await completeOrderAssemblyWorkflow(container).run({
          input: {
            order_id: order.id,
            items: [{ id: items[0].id, quantity: 1 }],
            actor_type: "seller",
          },
        })

        expect(await lifecycleStatus(order.id)).toEqual("partially_assembled")
      })
    })

    describe("cancel path", () => {
      it("cancels a new order: core canceled + lifecycle canceled with reason", async () => {
        const { order } = await placeTestOrder()

        await cancelOrderWorkflow(container).run({
          input: {
            order_id: order.id,
            actor_type: "buyer",
            reason: "changed my mind",
          },
        })

        expect(await lifecycleStatus(order.id)).toEqual("canceled")
        const { data: orders } = await query().graph({
          entity: "order",
          fields: ["id", "status", "order_lifecycle.note"],
          filters: { id: order.id },
        })
        expect((orders[0] as { status: string }).status).toEqual("canceled")
        expect(
          (orders[0] as unknown as { order_lifecycle: { note: string } })
            .order_lifecycle.note
        ).toEqual("changed my mind")
      })
    })

    describe("state machine invariant", () => {
      it("rejects an illegal transition (new → assembling) and keeps status", async () => {
        const { order } = await placeTestOrder()

        // start-assembly требует confirmed; на new-заказе переход запрещён.
        // Это чистый статус-переход (без ядрового шага) — падает именно
        // инвариант стейт-машины, а статус остаётся new (компенсации нет).
        await expectWorkflowError(
          startOrderAssemblyWorkflow(container).run({
            input: { order_id: order.id, actor_type: "seller" },
            throwOnError: true,
          }),
          "not allowed"
        )

        expect(await lifecycleStatus(order.id)).toEqual("new")
      })
    })
  },
})
