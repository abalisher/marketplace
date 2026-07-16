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

jest.setTimeout(180000)

// Интеграционные тесты способов получения заказа (поправка 2026-07-15):
// самовывоз (pickup — выдача у окна без этапа доставки, приёмка по накладной)
// и продажа у окна (counter — POST /admin/counter-orders, свёрнутый путь
// new → delivered). Доставка с кодом получения покрыта в order-routes.spec.
// Требует полную инфраструктуру доставки; фикстура строит её один раз. Нужен
// docker-postgres; временная БД — backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let storeHeaders: Record<string, string>
    let adminHeaders: Record<string, string>

    let regionId: string
    let salesChannelId: string
    let shippingOptionId: string
    let locationId: string
    let variantId: string
    let seq = 0

    const query = () => container.resolve(ContainerRegistrationKeys.QUERY)

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
      const email = `pickup-buyer-${seq}@example.com`
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

      const fulfillmentSet = await fulfillment.createFulfillmentSets({
        name: "Test Delivery",
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
              title: "Test Cement",
              status: ProductStatus.PUBLISHED,
              sales_channels: [{ id: salesChannelId }],
              options: [{ title: "Size", values: ["25kg"] }],
              variants: [
                {
                  title: "25kg",
                  sku: "DM-CEM-25",
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
              stocked_quantity: 100,
            },
          ],
        },
      })

      // Publishable key, привязанный к каналу продаж (обязателен для /store/*).
      const apiKeyService = container.resolve(Modules.API_KEY)
      const [publishableKey] = await apiKeyService.createApiKeys([
        { title: "test", type: "publishable", created_by: "test" },
      ])
      await link.create({
        [Modules.API_KEY]: { publishable_key_id: publishableKey.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
      })
      storeHeaders = { "x-publishable-api-key": publishableKey.token }

      // Admin-пользователь (первый user только через контейнер), логин по HTTP.
      const email = "admin@example.com"
      const password = "supersecret"
      const authService = container.resolve(Modules.AUTH)
      const { authIdentity } = await authService.register("emailpass", {
        body: { email, password },
      })
      const user = await container.resolve(Modules.USER).createUsers({ email })
      await authService.updateAuthIdentities({
        id: authIdentity!.id,
        app_metadata: { user_id: user.id },
      })
      const { data: login } = await api.post("/auth/user/emailpass", {
        email,
        password,
      })
      adminHeaders = { authorization: `Bearer ${login.token}` }
    })

    // Готовит корзину покупателя до состояния, пригодного для завершения.
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
      return cart.id
    }

    const orderItems = async (orderId: string) => {
      // query.graph не отдаёт quantity позиции (BigNumber) — читаем через сервис.
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

    describe("pickup: самовывоз у окна", () => {
      it("walks confirm → assembly → hand over (deliver без кода и без ship)", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        const placed = await call(
          api.post(
            "/store/orders",
            { cart_id: cartId, delivery_method: "pickup" },
            { headers: buyer.headers }
          )
        )
        expect(placed.status).toEqual(201)
        expect(placed.data.lifecycle.delivery_method).toEqual("pickup")
        const orderId = placed.data.order.id as string

        await api.post(
          `/admin/orders/${orderId}/lifecycle/confirm`,
          {},
          { headers: adminHeaders }
        )
        await api.post(
          `/admin/orders/${orderId}/lifecycle/start-assembly`,
          {},
          { headers: adminHeaders }
        )
        const items = await orderItems(orderId)
        await api.post(
          `/admin/orders/${orderId}/lifecycle/complete-assembly`,
          { items },
          { headers: adminHeaders }
        )

        // Отгрузка самовывозу запрещена стейт-машиной.
        const fulfillmentId = await orderFulfillmentId(orderId)
        const ship = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/ship`,
            { fulfillment_id: fulfillmentId, items },
            { headers: adminHeaders }
          )
        )
        expect(ship.status).toEqual(400)
        expect(ship.data.message).toContain("not allowed")

        // Выдача у окна: assembled → delivered, код получения не нужен.
        const delivered = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/deliver`,
            { fulfillment_id: fulfillmentId },
            { headers: adminHeaders }
          )
        )
        expect(delivered.status).toEqual(200)
        expect(delivered.data.status).toEqual("delivered")

        // Код получения не выдавался — его нет и в ЛК покупателя.
        const lifecycle = await call(
          api.get(`/store/orders/${orderId}/lifecycle`, {
            headers: buyer.headers,
          })
        )
        expect(lifecycle.data.delivery_method).toEqual("pickup")
        expect(lifecycle.data.delivery_code).toBeNull()

        const closed = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/close`,
            {},
            { headers: adminHeaders }
          )
        )
        expect(closed.data.status).toEqual("closed")
      })

      it("rejects counter as a store delivery_method (400)", async () => {
        const buyer = await createCustomer()
        const res = await call(
          api.post(
            "/store/orders",
            { cart_id: "cart_x", delivery_method: "counter" },
            { headers: buyer.headers }
          )
        )
        expect(res.status).toEqual(400)
      })
    })

    describe("counter: продажа у окна (POST /admin/counter-orders)", () => {
      it("creates an order already delivered with method counter", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        const res = await call(
          api.post(
            "/admin/counter-orders",
            { cart_id: cartId, location_id: locationId },
            { headers: adminHeaders }
          )
        )

        expect(res.status).toEqual(201)
        expect(res.data.order.id).toMatch(/^order_/)
        expect(res.data.lifecycle.delivery_method).toEqual("counter")
        const orderId = res.data.order.id as string

        // Статус сразу delivered, в истории один переход new → delivered.
        const lifecycle = await call(
          api.get(`/admin/orders/${orderId}/lifecycle`, {
            headers: adminHeaders,
          })
        )
        expect(lifecycle.data.status).toEqual("delivered")
        expect(lifecycle.data.delivery_method).toEqual("counter")
        expect(lifecycle.data.history).toHaveLength(1)
        expect(lifecycle.data.history[0].from_status).toEqual("new")
        expect(lifecycle.data.history[0].to_status).toEqual("delivered")

        // Физика ядра консистентна: fulfillment всех позиций создан и выдан.
        const { data: orders } = await query().graph({
          entity: "order",
          fields: ["id", "fulfillments.id", "fulfillments.delivered_at"],
          filters: { id: orderId },
        })
        const fulfillments = (
          orders[0] as {
            fulfillments: { id: string; delivered_at: string | null }[]
          }
        ).fulfillments
        expect(fulfillments).toHaveLength(1)
        expect(fulfillments[0].delivered_at).not.toBeNull()

        // Дальше — обычное закрытие после окна возврата.
        const closed = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/close`,
            {},
            { headers: adminHeaders }
          )
        )
        expect(closed.data.status).toEqual("closed")
      })

      it("rejects a request without cart_id (400)", async () => {
        const res = await call(
          api.post("/admin/counter-orders", {}, { headers: adminHeaders })
        )
        expect(res.status).toEqual(400)
      })
    })
  },
})
