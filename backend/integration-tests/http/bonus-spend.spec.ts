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
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { BONUS_MODULE } from "../../src/modules/bonus"
import BonusModuleService from "../../src/modules/bonus/service"

jest.setTimeout(180000)

// Интеграционные тесты списания бонусов в оформлении (подзадача 3 модуля
// bonus): GET /store/bonus, применение/снятие бонусов на корзине (кредитная
// линия ядра), согласование с предоплатой Kaspi (payment collection на сумму
// за вычетом бонусов, сброс сессии при смене суммы), списание лотов при
// placeOrder + link заказа к spend-транзакции. Корзины тестов в USD → бонусные
// счета создаются с currency_code=usd (проверка соответствия валют).
// Нужен docker-postgres; временная БД — backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let storeHeaders: Record<string, string>

    let regionId: string
    let salesChannelId: string
    let shippingOptionId: string
    let variantId: string
    let seq = 0

    // Позиции 2×20 + доставка 10 — total корзины 50; дефолтный потолок
    // max_spend_percent=50 → к списанию не более 25.
    const CART_TOTAL = 50

    const query = () => container.resolve(ContainerRegistrationKeys.QUERY)
    const bonus = () => container.resolve<BonusModuleService>(BONUS_MODULE)

    // 4xx-ответы приходят как исключения axios — возвращаем response.
    const call = async (promise: Promise<any>) =>
      promise.then(
        (res) => res,
        (err) => {
          if (!err.response) {
            throw err
          }
          return err.response
        }
      )

    // Регистрирует customer через публичный auth-флоу и возвращает его id
    // и headers с JWT (+ publishable key).
    const createCustomer = async () => {
      seq += 1
      const email = `bonus-buyer-${seq}@example.com`
      const password = "supersecret"

      const { data: reg } = await api.post(
        "/auth/customer/emailpass/register",
        { email, password }
      )
      const { data: created } = await api.post(
        "/store/customers",
        { email },
        { headers: { authorization: `Bearer ${reg.token}`, ...storeHeaders } }
      )
      const { data: login } = await api.post("/auth/customer/emailpass", {
        email,
        password,
      })

      return {
        customerId: created.customer.id as string,
        email,
        headers: {
          authorization: `Bearer ${login.token}`,
          ...storeHeaders,
        },
      }
    }

    // Бонусный счёт покупателя с начисленным лотом (идиома ленивого счёта —
    // как шаг get-or-create-bonus-account). Валюта — usd, под корзины тестов.
    const creditBuyer = async (customerId: string, amount: number) => {
      const account = await bonus().createBonusAccounts({
        currency_code: "usd",
      })
      const link = container.resolve(ContainerRegistrationKeys.LINK)
      await link.create({
        [Modules.CUSTOMER]: { customer_id: customerId },
        [BONUS_MODULE]: { bonus_account_id: account.id },
      })
      await bonus().credit({ account_id: account.id, amount })
      return account.id
    }

    const accountBalance = async (accountId: string) => {
      const account = await bonus().retrieveBonusAccount(accountId)
      return Number(account.balance)
    }

    const collectionAmount = async (cartId: string) => {
      const { data: carts } = await query().graph({
        entity: "cart",
        fields: ["payment_collection.amount"],
        filters: { id: cartId },
      })
      const collection = (
        carts[0] as { payment_collection?: { amount: number } | null }
      ).payment_collection
      return collection ? Number(collection.amount) : null
    }

    const orderSpends = async (orderId: string) => {
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
      ).filter((t) => t?.type === "spend")
    }

    beforeAll(async () => {
      container = getContainer()
      const fulfillment = container.resolve(Modules.FULFILLMENT)
      const link = container.resolve(ContainerRegistrationKeys.LINK)

      const { result: regions } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Bonus Test Region",
              currency_code: "usd",
              countries: ["us"],
              payment_providers: ["pp_kaspi_kaspi", "pp_system_default"],
            },
          ],
        },
      })
      regionId = regions[0].id

      const { result: channels } = await createSalesChannelsWorkflow(
        container
      ).run({
        input: { salesChannelsData: [{ name: "Bonus Test Channel" }] },
      })
      salesChannelId = channels[0].id

      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "Bonus Test Warehouse",
              address: { city: "Astana", country_code: "us", address_1: "1" },
            },
          ],
        },
      })
      const locationId = locations[0].id
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

      const fulfillmentSet = await fulfillment.createFulfillmentSets({
        name: "Bonus Test Delivery",
        type: "shipping",
        service_zones: [
          { name: "US", geo_zones: [{ country_code: "us", type: "country" }] },
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

      const { result: products } = await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: "Bonus Test Cement",
              status: ProductStatus.PUBLISHED,
              sales_channels: [{ id: salesChannelId }],
              options: [{ title: "Size", values: ["25kg"] }],
              variants: [
                {
                  title: "25kg",
                  sku: "BNS-CEM-25",
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
              stocked_quantity: 1000,
            },
          ],
        },
      })

      const apiKeyService = container.resolve(Modules.API_KEY)
      const [publishableKey] = await apiKeyService.createApiKeys([
        { title: "bonus-test", type: "publishable", created_by: "test" },
      ])
      await link.create({
        [Modules.API_KEY]: { publishable_key_id: publishableKey.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
      })
      storeHeaders = { "x-publishable-api-key": publishableKey.token }

      // Конфиг-singleton с дефолтами (accrual 1% / потолок 50%).
      await bonus().getOrCreateConfig()
    })

    // Корзина покупателя, готовая к оплате (позиции + доставка), БЕЗ платёжной
    // коллекции — её создаёт init оплаты (уже с учётом бонусной линии).
    const prepareCart = async (customerId: string, email: string) => {
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          customer_id: customerId,
          currency_code: "usd",
          email,
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
      return cart.id
    }

    describe("GET /store/bonus", () => {
      it("returns zero balance without an account", async () => {
        const buyer = await createCustomer()

        const res = await call(
          api.get("/store/bonus", { headers: buyer.headers })
        )

        expect(res.status).toBe(200)
        expect(res.data.bonus.balance).toBe(0)
        expect(res.data.bonus.transactions).toEqual([])
        expect(res.data.bonus.count).toBe(0)
      })

      it("returns balance and history, newest first, without lot internals", async () => {
        const buyer = await createCustomer()
        const accountId = await creditBuyer(buyer.customerId, 100)
        await bonus().spend({ account_id: accountId, amount: 30 })

        const res = await call(
          api.get("/store/bonus", { headers: buyer.headers })
        )

        expect(res.status).toBe(200)
        expect(res.data.bonus.balance).toBe(70)
        expect(res.data.bonus.currency_code).toBe("usd")
        expect(res.data.bonus.count).toBe(2)
        expect(res.data.bonus.transactions[0].type).toBe("spend")
        expect(res.data.bonus.transactions[0].amount).toBe(30)
        expect(res.data.bonus.transactions[1].type).toBe("accrual")
        expect(res.data.bonus.transactions[0].lot_breakdown).toBeUndefined()
      })

      it("returns 401 without authentication", async () => {
        const res = await call(
          api.get("/store/bonus", { headers: storeHeaders })
        )

        expect(res.status).toBe(401)
      })
    })

    describe("POST /store/carts/:id/bonus", () => {
      it("applies bonuses and reduces the cart total", async () => {
        const buyer = await createCustomer()
        await creditBuyer(buyer.customerId, 100)
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        const res = await call(
          api.post(
            `/store/carts/${cartId}/bonus`,
            { amount: 20 },
            { headers: buyer.headers }
          )
        )

        expect(res.status).toBe(200)
        expect(res.data.bonus.amount).toBe(20)
        expect(res.data.bonus.cart_total).toBe(CART_TOTAL - 20)
      })

      it("replaces the amount on repeated apply", async () => {
        const buyer = await createCustomer()
        await creditBuyer(buyer.customerId, 100)
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        await call(
          api.post(
            `/store/carts/${cartId}/bonus`,
            { amount: 20 },
            { headers: buyer.headers }
          )
        )
        const res = await call(
          api.post(
            `/store/carts/${cartId}/bonus`,
            { amount: 10 },
            { headers: buyer.headers }
          )
        )

        expect(res.status).toBe(200)
        expect(res.data.bonus.amount).toBe(10)
        expect(res.data.bonus.cart_total).toBe(CART_TOTAL - 10)
      })

      it("rejects spending above the max_spend_percent cap", async () => {
        const buyer = await createCustomer()
        await creditBuyer(buyer.customerId, 100)
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        // Потолок 50% от 50 — 25; просим 26.
        const res = await call(
          api.post(
            `/store/carts/${cartId}/bonus`,
            { amount: 26 },
            { headers: buyer.headers }
          )
        )

        expect(res.status).toBe(400)
        expect(res.data.message).toContain("exceeds")
      })

      it("rejects spending above the balance (and without an account)", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        const noAccount = await call(
          api.post(
            `/store/carts/${cartId}/bonus`,
            { amount: 10 },
            { headers: buyer.headers }
          )
        )
        expect(noAccount.status).toBe(400)
        expect(noAccount.data.message).toContain("Insufficient")

        await creditBuyer(buyer.customerId, 5)
        const overBalance = await call(
          api.post(
            `/store/carts/${cartId}/bonus`,
            { amount: 10 },
            { headers: buyer.headers }
          )
        )
        expect(overBalance.status).toBe(400)
        expect(overBalance.data.message).toContain("Insufficient")
      })

      it("rejects a non-positive or fractional amount", async () => {
        const buyer = await createCustomer()
        await creditBuyer(buyer.customerId, 100)
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        for (const amount of [0, -5, 1.5]) {
          const res = await call(
            api.post(
              `/store/carts/${cartId}/bonus`,
              { amount },
              { headers: buyer.headers }
            )
          )
          expect(res.status).toBe(400)
        }
      })

      it("returns 404 for another buyer's cart and 401 without auth", async () => {
        const owner = await createCustomer()
        const stranger = await createCustomer()
        await creditBuyer(stranger.customerId, 100)
        const cartId = await prepareCart(owner.customerId, owner.email)

        const foreign = await call(
          api.post(
            `/store/carts/${cartId}/bonus`,
            { amount: 10 },
            { headers: stranger.headers }
          )
        )
        expect(foreign.status).toBe(404)

        const anonymous = await call(
          api.post(
            `/store/carts/${cartId}/bonus`,
            { amount: 10 },
            { headers: storeHeaders }
          )
        )
        expect(anonymous.status).toBe(401)
      })
    })

    describe("DELETE /store/carts/:id/bonus", () => {
      it("removes applied bonuses and restores the total; idempotent", async () => {
        const buyer = await createCustomer()
        await creditBuyer(buyer.customerId, 100)
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        await call(
          api.post(
            `/store/carts/${cartId}/bonus`,
            { amount: 20 },
            { headers: buyer.headers }
          )
        )
        const removed = await call(
          api.delete(`/store/carts/${cartId}/bonus`, {
            headers: buyer.headers,
          })
        )
        expect(removed.status).toBe(200)
        expect(removed.data.bonus.amount).toBe(0)
        expect(removed.data.bonus.cart_total).toBe(CART_TOTAL)

        const again = await call(
          api.delete(`/store/carts/${cartId}/bonus`, {
            headers: buyer.headers,
          })
        )
        expect(again.status).toBe(200)
        expect(again.data.bonus.amount).toBe(0)
      })
    })

    describe("bonus + Kaspi prepayment", () => {
      it("initializes payment for total minus bonus and places the order with a spend", async () => {
        const buyer = await createCustomer()
        const accountId = await creditBuyer(buyer.customerId, 100)
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        await call(
          api.post(
            `/store/carts/${cartId}/bonus`,
            { amount: 20 },
            { headers: buyer.headers }
          )
        )
        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            { scenario: "paid" },
            { headers: buyer.headers }
          )
        )
        expect(await collectionAmount(cartId)).toBe(CART_TOTAL - 20)

        const placed = await call(
          api.post(
            "/store/orders",
            { cart_id: cartId },
            { headers: buyer.headers }
          )
        )

        expect(placed.status).toBe(201)
        expect(placed.data.lifecycle.status).toBe("new")
        expect(await accountBalance(accountId)).toBe(80)

        const spends = await orderSpends(placed.data.order.id)
        expect(spends).toHaveLength(1)

        // Кредитная линия перенесена ядром в заказ — суммы «деньгами» и
        // «бонусами» разделены для будущего модуля documents.
        const { data: orders } = await query().graph({
          entity: "order",
          fields: ["id", "credit_lines.amount", "credit_lines.reference"],
          filters: { id: placed.data.order.id },
        })
        const creditLines =
          (orders[0] as {
            credit_lines?: { amount: number; reference: string | null }[]
          }).credit_lines ?? []
        expect(creditLines).toHaveLength(1)
        expect(Number(creditLines[0].amount)).toBe(20)
        expect(creditLines[0].reference).toBe("bonus_account")
      })

      it("resets an existing Kaspi session when the bonus changes the amount", async () => {
        const buyer = await createCustomer()
        await creditBuyer(buyer.customerId, 100)
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            { scenario: "paid" },
            { headers: buyer.headers }
          )
        )
        expect(await collectionAmount(cartId)).toBe(CART_TOTAL)

        await call(
          api.post(
            `/store/carts/${cartId}/bonus`,
            { amount: 20 },
            { headers: buyer.headers }
          )
        )

        // Сессия на старую сумму сброшена ядром — оплата не инициализирована.
        const stale = await call(
          api.get(`/store/carts/${cartId}/payment/kaspi`, {
            headers: buyer.headers,
          })
        )
        expect(stale.status).toBe(400)

        // Повторная инициализация — инвойс уже на сумму за вычетом бонусов.
        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            { scenario: "paid" },
            { headers: buyer.headers }
          )
        )
        expect(await collectionAmount(cartId)).toBe(CART_TOTAL - 20)

        const placed = await call(
          api.post(
            "/store/orders",
            { cart_id: cartId },
            { headers: buyer.headers }
          )
        )
        expect(placed.status).toBe(201)
      })

      it("places a fully bonus-covered order without any payment", async () => {
        const buyer = await createCustomer()
        const accountId = await creditBuyer(buyer.customerId, 100)
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        const config = await bonus().getOrCreateConfig()
        await bonus().updateBonusConfigs({
          id: config.id,
          max_spend_percent: 100,
        })
        try {
          const applied = await call(
            api.post(
              `/store/carts/${cartId}/bonus`,
              { amount: CART_TOTAL },
              { headers: buyer.headers }
            )
          )
          expect(applied.status).toBe(200)
          expect(applied.data.bonus.cart_total).toBe(0)

          // Оплата не инициализировалась вовсе — заказ полностью на бонусах.
          const placed = await call(
            api.post(
              "/store/orders",
              { cart_id: cartId },
              { headers: buyer.headers }
            )
          )

          expect(placed.status).toBe(201)
          expect(placed.data.lifecycle.status).toBe("new")
          expect(await accountBalance(accountId)).toBe(100 - CART_TOTAL)
          expect(await orderSpends(placed.data.order.id)).toHaveLength(1)
        } finally {
          await bonus().updateBonusConfigs({
            id: config.id,
            max_spend_percent: 50,
          })
        }
      })

      it("rejects placing the order when the balance ran out after applying", async () => {
        const buyer = await createCustomer()
        const accountId = await creditBuyer(buyer.customerId, 25)
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        await call(
          api.post(
            `/store/carts/${cartId}/bonus`,
            { amount: 20 },
            { headers: buyer.headers }
          )
        )
        // Баланс «утёк» между применением и оформлением (другой заказ).
        await bonus().spend({ account_id: accountId, amount: 10 })

        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            { scenario: "paid" },
            { headers: buyer.headers }
          )
        )
        const placed = await call(
          api.post(
            "/store/orders",
            { cart_id: cartId },
            { headers: buyer.headers }
          )
        )

        expect(placed.status).toBe(400)
        expect(placed.data.message).toContain("Insufficient")
        // Списание не произошло: 25 − 10 = 15 нетронуты.
        expect(await accountBalance(accountId)).toBe(15)
      })
    })
  },
})
