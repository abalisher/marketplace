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
import { createProductCardWorkflow } from "../../src/workflows/create-product-card"
import { accrueOrderBonusWorkflow } from "../../src/workflows/accrue-order-bonus"
import accrueBonusesJob from "../../src/jobs/accrue-bonuses"
import { BONUS_MODULE } from "../../src/modules/bonus"
import BonusModuleService from "../../src/modules/bonus/service"

jest.setTimeout(180000)

// Сквозные тесты начисления бонусов (bonus, подзадача 2): workflow
// accrue-order-bonus (инварианты: closed, окно возврата, идемпотентность;
// сумма — только товарные позиции, сегментные проценты из product_card) и
// джоба accrue-bonuses. Заказы доводятся до closed настоящими переходами
// (фикстура доставки — как в order-lifecycle-workflows.spec.ts); окно
// возврата в тестах управляется конфигом (return_window_days=0 — начислять
// можно сразу). Нужен docker-postgres; временная БД — backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    let container: MedusaContainer

    let regionId: string
    let salesChannelId: string
    let shippingOptionId: string
    let shippingProfileId: string
    let locationId: string
    // Обычный товар (без карточки) и товар сегмента business (с карточкой).
    let plainVariantId: string
    let businessVariantId: string
    let configId: string
    let seq = 0

    const query = () => container.resolve(ContainerRegistrationKeys.QUERY)
    const bonus = () => container.resolve<BonusModuleService>(BONUS_MODULE)

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

    // Конфиг-singleton: каждый тест выставляет нужные значения явно, чтобы
    // не зависеть от порядка выполнения.
    const setConfig = async (
      overrides: Partial<{
        accrual_percent: number
        segment_percents: Record<string, number> | null
        return_window_days: number
        expiry_days: number | null
      }> = {}
    ) => {
      await bonus().updateBonusConfigs({
        id: configId,
        accrual_percent: 1,
        segment_percents: null,
        return_window_days: 0,
        expiry_days: null,
        ...overrides,
      })
    }

    // Создаёт published-товар с вариантом (цена 5000 usd) и остатком на складе.
    const createTestProduct = async (title: string, sku: string) => {
      const { result: products } = await createProductsWorkflow(container).run(
        {
          input: {
            products: [
              {
                title,
                status: ProductStatus.PUBLISHED,
                sales_channels: [{ id: salesChannelId }],
                options: [{ title: "Size", values: ["25kg"] }],
                variants: [
                  {
                    title: "25kg",
                    sku,
                    manage_inventory: true,
                    options: { Size: "25kg" },
                    prices: [{ amount: 5000, currency_code: "usd" }],
                  },
                ],
              },
            ],
          },
        }
      )
      const product = products[0]

      const link = container.resolve(ContainerRegistrationKeys.LINK)
      await link.create({
        [Modules.PRODUCT]: { product_id: product.id },
        [Modules.FULFILLMENT]: { shipping_profile_id: shippingProfileId },
      })

      const { data: withInventory } = await query().graph({
        entity: "product",
        fields: ["variants.inventory_items.inventory.id"],
        filters: { id: product.id },
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

      return product
    }

    beforeAll(async () => {
      container = getContainer()
      const fulfillment = container.resolve(Modules.FULFILLMENT)
      const link = container.resolve(ContainerRegistrationKeys.LINK)

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
      locationId = locations[0].id
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: { id: locationId, add: [salesChannelId] },
      })

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
      shippingProfileId = shippingProfile.id

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
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: locationId },
        [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
      })

      // Доставка стоит 1000 — заметная сумма, чтобы тест поймал её попадание
      // в базу начисления (1% от 10000 позиций = 100 ≠ 110 с доставкой).
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
              { currency_code: "usd", amount: 1000 },
              { region_id: regionId, amount: 1000 },
            ],
            rules: [
              { attribute: "enabled_in_store", value: "true", operator: "eq" },
              { attribute: "is_return", value: "false", operator: "eq" },
            ],
          },
        ],
      })
      shippingOptionId = shippingOptions[0].id

      const plain = await createTestProduct("Test Cement", "TEST-CEM-25")
      plainVariantId = plain.variants[0].id

      const business = await createTestProduct(
        "Test Marble",
        "TEST-MRB-25"
      )
      businessVariantId = business.variants[0].id
      await createProductCardWorkflow(container).run({
        input: { product_id: business.id, segment: "business", unit: "bag" },
      })

      configId = (await bonus().getOrCreateConfig()).id
    })

    // Оформляет заказ через полный флоу корзины + place-order.
    const placeTestOrder = async (
      items: { variant_id: string; quantity: number }[]
    ) => {
      seq += 1
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          currency_code: "usd",
          email: `bonus-buyer${seq}@example.com`,
          shipping_address: {
            first_name: "Test",
            last_name: "Buyer",
            address_1: "1 Test St",
            city: "Astana",
            country_code: "us",
            postal_code: "010000",
          },
          items,
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
      // Тип результата completeCart не включает customer_id — перечитываем
      // заказ сервисом (он нужен тестам для проверки счёта покупателя).
      const orderService = container.resolve(Modules.ORDER)
      return await orderService.retrieveOrder(result.order.id)
    }

    // Доводит заказ до closed настоящими переходами (delivery-путь).
    const closeTestOrder = async (orderId: string) => {
      await confirmOrderWorkflow(container).run({
        input: { order_id: orderId, actor_type: "seller" },
      })
      await startOrderAssemblyWorkflow(container).run({
        input: { order_id: orderId, actor_type: "seller" },
      })

      const orderService = container.resolve(Modules.ORDER)
      const order = await orderService.retrieveOrder(orderId, {
        relations: ["items"],
      })
      const items = (order.items ?? []).map((i) => ({
        id: i.id,
        quantity: Number(i.quantity),
      }))
      await completeOrderAssemblyWorkflow(container).run({
        input: { order_id: orderId, items, actor_type: "seller" },
      })

      const { data: orders } = await query().graph({
        entity: "order",
        fields: [
          "id",
          "fulfillments.id",
          "order_lifecycle.delivery_code",
        ],
        filters: { id: orderId },
      })
      const fulfillmentId = (orders[0] as { fulfillments: { id: string }[] })
        .fulfillments[0].id
      await shipOrderWorkflow(container).run({
        input: {
          order_id: orderId,
          fulfillment_id: fulfillmentId,
          items,
          actor_type: "seller",
        },
      })

      const { data: shipped } = await query().graph({
        entity: "order",
        fields: ["id", "order_lifecycle.delivery_code"],
        filters: { id: orderId },
      })
      const code = (
        shipped[0] as { order_lifecycle: { delivery_code: string } }
      ).order_lifecycle.delivery_code
      await deliverOrderWorkflow(container).run({
        input: {
          order_id: orderId,
          fulfillment_id: fulfillmentId,
          delivery_code: code,
          actor_type: "system",
        },
      })

      await closeOrderWorkflow(container).run({
        input: { order_id: orderId, actor_type: "system" },
      })
    }

    const placeClosedOrder = async (
      items: { variant_id: string; quantity: number }[]
    ) => {
      const order = await placeTestOrder(items)
      await closeTestOrder(order.id)
      return order
    }

    const orderAccruals = async (orderId: string) => {
      const { data: orders } = await query().graph({
        entity: "order",
        fields: ["id", "bonus_transactions.id", "bonus_transactions.type"],
        filters: { id: orderId },
      })
      return (
        (
          orders[0] as {
            bonus_transactions?: ({ id: string; type: string } | null)[]
          }
        ).bonus_transactions ?? []
      ).filter((t) => t?.type === "accrual")
    }

    const customerAccount = async (customerId: string) => {
      const { data: customers } = await query().graph({
        entity: "customer",
        fields: ["id", "bonus_account.id", "bonus_account.balance"],
        filters: { id: customerId },
      })
      return (
        customers[0] as {
          bonus_account?: { id: string; balance: number } | null
        }
      ).bonus_account
    }

    describe("accrue-order-bonus workflow", () => {
      it("accrues platform percent of item subtotals (shipping excluded), creating the account lazily", async () => {
        await setConfig()
        const order = await placeClosedOrder([
          { variant_id: plainVariantId, quantity: 2 },
        ])

        const { result } = await accrueOrderBonusWorkflow(container).run({
          input: { order_id: order.id },
        })

        // Позиции 2 × 5000 = 10000, доставка 1000 не бонусируется: 1% → 100.
        expect(result.amount).toEqual(100)
        expect(result.transaction_id).toMatch(/^bontx_/)

        // Счёт создан лениво и привязан к покупателю; баланс = начислению.
        const account = await customerAccount(order.customer_id!)
        expect(account?.id).toEqual(result.account_id)
        expect(Number(account?.balance)).toEqual(100)

        // Лот: remaining = amount, сгорание выключено (expiry_days=null).
        const transaction = await bonus().retrieveBonusTransaction(
          result.transaction_id!
        )
        expect(transaction.type).toEqual("accrual")
        expect(Number(transaction.remaining)).toEqual(100)
        expect(transaction.expires_at).toBeNull()

        // Link к заказу — маркер идемпотентности.
        const accruals = await orderAccruals(order.id)
        expect(accruals.map((t) => t?.id)).toEqual([result.transaction_id])
      })

      it("refuses a second accrual for the same order", async () => {
        await setConfig()
        const order = await placeClosedOrder([
          { variant_id: plainVariantId, quantity: 1 },
        ])

        await accrueOrderBonusWorkflow(container).run({
          input: { order_id: order.id },
        })
        await expectWorkflowError(
          accrueOrderBonusWorkflow(container).run({
            input: { order_id: order.id },
            throwOnError: true,
          }),
          "already has an accrual"
        )
        expect(await orderAccruals(order.id)).toHaveLength(1)
      })

      it("applies segment percent overrides per item and sets lot expiry from config", async () => {
        await setConfig({
          segment_percents: { business: 2 },
          expiry_days: 30,
        })
        const order = await placeClosedOrder([
          { variant_id: plainVariantId, quantity: 1 },
          { variant_id: businessVariantId, quantity: 1 },
        ])

        const { result } = await accrueOrderBonusWorkflow(container).run({
          input: { order_id: order.id },
        })

        // 1% от 5000 (без карточки) + 2% от 5000 (сегмент business) = 150.
        expect(result.amount).toEqual(150)

        const transaction = await bonus().retrieveBonusTransaction(
          result.transaction_id!
        )
        expect(transaction.expires_at).not.toBeNull()
      })

      it("refuses an order that is not closed", async () => {
        await setConfig()
        const order = await placeTestOrder([
          { variant_id: plainVariantId, quantity: 1 },
        ])

        await expectWorkflowError(
          accrueOrderBonusWorkflow(container).run({
            input: { order_id: order.id },
            throwOnError: true,
          }),
          "not closed"
        )
      })

      it("refuses while the return window has not elapsed", async () => {
        await setConfig({ return_window_days: 14 })
        const order = await placeClosedOrder([
          { variant_id: plainVariantId, quantity: 1 },
        ])

        await expectWorkflowError(
          accrueOrderBonusWorkflow(container).run({
            input: { order_id: order.id },
            throwOnError: true,
          }),
          "return window"
        )
        expect(await orderAccruals(order.id)).toHaveLength(0)
      })

      it("is a no-op without a transaction when the amount floors to zero", async () => {
        await setConfig({ accrual_percent: 0 })
        const order = await placeClosedOrder([
          { variant_id: plainVariantId, quantity: 1 },
        ])

        const { result } = await accrueOrderBonusWorkflow(container).run({
          input: { order_id: order.id },
        })

        expect(result.amount).toEqual(0)
        expect(result.transaction_id).toBeNull()
        expect(await orderAccruals(order.id)).toHaveLength(0)
      })
    })

    describe("accrue-bonuses job", () => {
      it("accrues due closed orders, skipping already-accrued and non-closed ones", async () => {
        await setConfig()
        const due = await placeClosedOrder([
          { variant_id: plainVariantId, quantity: 2 },
        ])
        const accrued = await placeClosedOrder([
          { variant_id: plainVariantId, quantity: 1 },
        ])
        await accrueOrderBonusWorkflow(container).run({
          input: { order_id: accrued.id },
        })
        const open = await placeTestOrder([
          { variant_id: plainVariantId, quantity: 1 },
        ])

        await accrueBonusesJob(container)

        expect(await orderAccruals(due.id)).toHaveLength(1)
        expect(await orderAccruals(accrued.id)).toHaveLength(1)
        expect(await orderAccruals(open.id)).toHaveLength(0)

        const dueAccount = await customerAccount(due.customer_id!)
        expect(Number(dueAccount?.balance)).toEqual(100)

        // Повторный прогон джобы — no-op (идемпотентность).
        await accrueBonusesJob(container)
        expect(await orderAccruals(due.id)).toHaveLength(1)
      })
    })
  },
})
