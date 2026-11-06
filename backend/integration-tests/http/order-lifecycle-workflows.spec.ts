import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import {
  addShippingMethodToCartWorkflow,
  cancelOrderWorkflow as cancelCoreOrderWorkflow,
  completeOrderWorkflow as completeCoreOrderWorkflow,
  createCartWorkflow,
  createInventoryLevelsWorkflow,
  createOrderFulfillmentWorkflow,
  createOrderShipmentWorkflow,
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  markOrderFulfillmentAsDeliveredWorkflow,
} from "@medusajs/medusa/core-flows"
import { placeOrderWorkflow } from "../../src/workflows/place-order"
import { confirmOrderWorkflow } from "../../src/workflows/confirm-order"
import { startOrderAssemblyWorkflow } from "../../src/workflows/start-order-assembly"
import { completeOrderAssemblyWorkflow } from "../../src/workflows/complete-order-assembly"
import { shipOrderWorkflow } from "../../src/workflows/ship-order"
import { deliverOrderWorkflow } from "../../src/workflows/deliver-order"
import { closeOrderWorkflow } from "../../src/workflows/close-order"
import { cancelOrderWorkflow } from "../../src/workflows/cancel-order"
import { rescheduleOrderDeliveryWorkflow } from "../../src/workflows/reschedule-order-delivery"
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
    // `metadata` — то, что оформление кладёт на корзину до оплаты: слот
    // доставки покупатель выбирает там (T5.6), а заказ забирает его оттуда.
    const placeTestOrder = async (metadata?: Record<string, unknown>) => {
      seq += 1
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          currency_code: "usd",
          email: `buyer${seq}@example.com`,
          ...(metadata ? { metadata } : {}),
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

      // T5.6: слот доставки выбирается на корзине (до оплаты) и должен
      // доехать до заказа — иначе покупатель выбрал окно, а продавец его не
      // видит. Дата берётся заведомо будущая: горизонт выбора — неделя, и
      // прошедшее окно домен считает недоступным.
      it("переносит слот доставки с корзины на жизненный цикл заказа", async () => {
        const date = new Date(Date.now() + 2 * 24 * 3600_000)
          .toISOString()
          .slice(0, 10)
        const { lifecycle } = await placeTestOrder({
          delivery_slot_date: date,
          delivery_slot_window: "day",
        })

        expect(lifecycle.delivery_date).toEqual(date)
        expect(lifecycle.delivery_window).toEqual("day")
      })

      // В метаданные корзины может попасть что угодно (их пишет клиент);
      // невалидное окно не должно ни ронять оформление, ни доезжать до заказа.
      it("игнорирует мусор в метаданных слота, но заказ оформляет", async () => {
        const { lifecycle } = await placeTestOrder({
          delivery_slot_date: "когда-нибудь",
          delivery_slot_window: "ночью",
        })

        expect(lifecycle.status).toEqual("new")
        expect(lifecycle.delivery_date).toBeNull()
        expect(lifecycle.delivery_window).toBeNull()
      })

      // Заказ без слота по-прежнему оформляется: слот собирает чат покупателя,
      // а POST /store/orders о нём не знает.
      it("оформляет заказ без слота", async () => {
        const { lifecycle } = await placeTestOrder()
        expect(lifecycle.delivery_date).toBeNull()
        expect(lifecycle.delivery_window).toBeNull()
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
          "не указан или неверный"
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

    // Перенос доставки (T5.6b): слот, выбранный при оформлении, продавец
    // двигает по звонку покупателя. Проверяем три вещи, из-за которых перенос
    // и заводился: слот заказа меняется, в лог ложится запись «кто и почему»,
    // а после отгрузки перенос отклоняется.
    describe("reschedule delivery slot", () => {
      // Слот в тестах берём заведомо будущий: правило доступности требует
      // запас на сборку (3 часа) и горизонт недели.
      const futureSlot = (days: number) => ({
        date: new Date(Date.now() + days * 24 * 3600_000)
          .toISOString()
          .slice(0, 10),
        window: "morning" as const,
      })

      const lifecycleSlot = async (orderId: string) => {
        const { data: orders } = await query().graph({
          entity: "order",
          fields: [
            "id",
            "order_lifecycle.id",
            "order_lifecycle.delivery_date",
            "order_lifecycle.delivery_window",
          ],
          filters: { id: orderId },
        })
        return (
          orders[0] as {
            order_lifecycle?: {
              id: string
              delivery_date: string | null
              delivery_window: string | null
            }
          }
        ).order_lifecycle
      }

      it("двигает окно заказа и пишет в лог, кто и почему подвинул", async () => {
        const before = futureSlot(2)
        const after = futureSlot(3)
        const { order } = await placeTestOrder({
          delivery_slot_date: before.date,
          delivery_slot_window: before.window,
        })

        await rescheduleOrderDeliveryWorkflow(container).run({
          input: {
            order_id: order.id,
            date: after.date,
            window: after.window,
            actor_type: "admin",
            actor_id: "user_reschedule",
            reason: "покупатель просит другой день",
          },
        })

        const slot = await lifecycleSlot(order.id)
        expect(slot?.delivery_date).toEqual(after.date)
        expect(slot?.delivery_window).toEqual(after.window)
        // Статус переносом не двигается — заказ остаётся там же, где был.
        expect(await lifecycleStatus(order.id)).toEqual("new")

        const service =
          container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
        const [events] = await service.listAndCountOrderLifecycleEvents(
          { order_lifecycle: slot?.id, kind: "slot" },
          { order: { created_at: "ASC" } }
        )
        expect(events).toHaveLength(1)
        expect(events[0].from_slot_date).toEqual(before.date)
        expect(events[0].to_slot_date).toEqual(after.date)
        expect(events[0].actor_id).toEqual("user_reschedule")
        expect(events[0].reason).toEqual("покупатель просит другой день")
      })

      it("отклоняет окно, которого магазин уже не предлагает", async () => {
        const { order } = await placeTestOrder()

        // Вчерашнее окно недоступно: обещать доставку в прошлое нельзя ни из
        // чата, ни из панели — правило одно (домен слота).
        await expectWorkflowError(
          rescheduleOrderDeliveryWorkflow(container).run({
            input: {
              order_id: order.id,
              date: new Date(Date.now() - 24 * 3600_000)
                .toISOString()
                .slice(0, 10),
              window: "morning",
              actor_type: "admin",
              reason: "по звонку",
            },
          }),
          "is not available"
        )
      })

      it("не двигает доставку отгруженного заказа", async () => {
        const slot = futureSlot(2)
        const { order } = await placeTestOrder({
          delivery_slot_date: slot.date,
          delivery_slot_window: slot.window,
        })
        const items = await orderItems(order.id)

        await confirmOrderWorkflow(container).run({
          input: { order_id: order.id, actor_type: "seller" },
        })
        await startOrderAssemblyWorkflow(container).run({
          input: { order_id: order.id, actor_type: "seller" },
        })
        await completeOrderAssemblyWorkflow(container).run({
          input: { order_id: order.id, items, actor_type: "seller" },
        })
        await shipOrderWorkflow(container).run({
          input: {
            order_id: order.id,
            fulfillment_id: await orderFulfillmentId(order.id),
            items,
            actor_type: "seller",
          },
        })

        await expectWorkflowError(
          rescheduleOrderDeliveryWorkflow(container).run({
            input: {
              order_id: order.id,
              date: futureSlot(3).date,
              window: "morning",
              actor_type: "admin",
              reason: "по звонку",
            },
          }),
          "Перенести доставку нельзя"
        )

        // Окно осталось прежним: отклонённый перенос ничего не переписал.
        const stored = await lifecycleSlot(order.id)
        expect(stored?.delivery_date).toEqual(slot.date)
      })
    })

    // Догон за ядром (T4.14b): продавец сделал операцию на ЯДРОВОЙ странице
    // заказа мимо нашего drawer'а — подписчики двигают наш цикл следом, чтобы
    // расхождения «в ядре отгружено, у нас Собран» не возникало.
    describe("sync from core", () => {
      // Ядровое событие доставляется подписчику после завершения workflow —
      // статус ждём опросом (идиома assembly-routes).
      const waitForStatus = async (orderId: string, expected: string) => {
        for (let attempt = 0; attempt < 80; attempt++) {
          if ((await lifecycleStatus(orderId)) === expected) {
            break
          }
          await new Promise((resolve) => setTimeout(resolve, 250))
        }
        return await lifecycleStatus(orderId)
      }

      const lifecycleId = async (orderId: string) => {
        const { data: orders } = await query().graph({
          entity: "order",
          fields: ["id", "order_lifecycle.id"],
          filters: { id: orderId },
        })
        return (orders[0] as unknown as { order_lifecycle: { id: string } })
          .order_lifecycle.id
      }

      // Лог переходов по порядку: id — сортируемый (ulid), created_at у хопов
      // одного догона совпадает до миллисекунды.
      const transitions = async (orderId: string) => {
        const service =
          container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
        const events = await service.listOrderLifecycleEvents(
          { order_lifecycle: await lifecycleId(orderId) },
          { order: { id: "ASC" } }
        )
        return events.map((e) => ({
          to: e.to_status,
          actor: e.actor_type,
          reason: e.reason,
        }))
      }

      it("проводит цикл от подтверждённого до закрытого по одним ядровым действиям", async () => {
        const { order } = await placeTestOrder()
        await confirmOrderWorkflow(container).run({
          input: { order_id: order.id, actor_type: "seller", actor_id: "u1" },
        })

        // 1. Ядровая сборка («Выполнить заказ») — цикл проходит пропущенный
        // этап «В сборке» и встаёт на «Собран».
        const items = await orderItems(order.id)
        await createOrderFulfillmentWorkflow(container).run({
          input: { order_id: order.id, items },
        })
        expect(await waitForStatus(order.id, "assembled")).toEqual("assembled")

        // 2. Ядровая отгрузка («Отметить как отправленный») — «В доставке»,
        // код получения выдаётся догоном сам (без него не пройдёт вручение).
        const fulfillmentId = await orderFulfillmentId(order.id)
        await createOrderShipmentWorkflow(container).run({
          input: { order_id: order.id, fulfillment_id: fulfillmentId, items },
        })
        expect(await waitForStatus(order.id, "in_delivery")).toEqual(
          "in_delivery"
        )
        expect(await deliveryCode(order.id)).toMatch(/^\d{6}$/)

        // 3. Ядровое вручение («Отметить как доставленный») — «Доставлен»
        // без кода от покупателя: физику ядро уже зафиксировало.
        await markOrderFulfillmentAsDeliveredWorkflow(container).run({
          input: { orderId: order.id, fulfillmentId },
        })
        expect(await waitForStatus(order.id, "delivered")).toEqual("delivered")

        // 4. Ядровое завершение — «Закрыт».
        await completeCoreOrderWorkflow(container).run({
          input: { orderIds: [order.id] },
        })
        expect(await waitForStatus(order.id, "closed")).toEqual("closed")

        // Лог: подтверждение продавцом + пять догнанных переходов, все —
        // актором «система» и с причиной-догоном («кто перевёл» отвечает
        // «ядро», а не продавец).
        const log = await transitions(order.id)
        expect(log.map((e) => e.to)).toEqual([
          "confirmed",
          "assembling",
          "assembled",
          "in_delivery",
          "delivered",
          "closed",
        ])
        expect(log[0].actor).toEqual("seller")
        for (const entry of log.slice(1)) {
          expect(entry.actor).toEqual("system")
          expect(entry.reason).toContain("Синхронизация с ядром")
        }
      })

      it("не дублирует переход, когда ядровое событие пришло от нашего же workflow", async () => {
        const { order } = await placeTestOrder()
        await confirmOrderWorkflow(container).run({
          input: { order_id: order.id, actor_type: "seller" },
        })
        await startOrderAssemblyWorkflow(container).run({
          input: { order_id: order.id, actor_type: "seller" },
        })

        // Наша сборка сама вызывает ядро и получает order.fulfillment_created
        // обратно — догон обязан промолчать (цикл уже в целевом статусе).
        const items = await orderItems(order.id)
        await completeOrderAssemblyWorkflow(container).run({
          input: { order_id: order.id, items, actor_type: "seller" },
        })
        await new Promise((resolve) => setTimeout(resolve, 2000))

        expect(await lifecycleStatus(order.id)).toEqual("assembled")
        const log = await transitions(order.id)
        expect(log.map((e) => e.to)).toEqual([
          "confirmed",
          "assembling",
          "assembled",
        ])
        expect(log.every((e) => e.actor === "seller")).toBe(true)
      })

      it("догоняет отмену, сделанную через ядро", async () => {
        const { order } = await placeTestOrder()

        await cancelCoreOrderWorkflow(container).run({
          input: { order_id: order.id },
        })

        expect(await waitForStatus(order.id, "canceled")).toEqual("canceled")
        const log = await transitions(order.id)
        expect(log).toHaveLength(1)
        expect(log[0].actor).toEqual("system")
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
          "Нельзя перевести"
        )

        expect(await lifecycleStatus(order.id)).toEqual("new")
      })
    })
  },
})
