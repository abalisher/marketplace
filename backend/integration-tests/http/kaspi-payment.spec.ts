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
import { initCartKaspiPaymentWorkflow } from "../../src/workflows/init-cart-kaspi-payment"

jest.setTimeout(180000)

// Интеграционные тесты оплаты Kaspi в оформлении заказа (подзадача 2 модуля
// payment-kaspi): инициализация оплаты корзины (collection + сессия + QR),
// polling статуса, предусловие 100% предоплаты в placeOrder. Исход оплаты
// управляется сценарием мока через body.scenario → data.kaspi_scenario
// (провайдер стателесс — см. DECISIONS 2026-07-15). Нужен docker-postgres;
// временная БД — backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let storeHeaders: Record<string, string>
    let adminHeaders: Record<string, string>

    let regionId: string
    let salesChannelId: string
    let shippingOptionId: string
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
      const email = `kaspi-buyer-${seq}@example.com`
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

      // Регион с провайдером Kaspi — сессии создаются только для провайдеров
      // региона корзины.
      const { result: regions } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "KZ Test Region",
              currency_code: "usd",
              countries: ["us"],
              payment_providers: ["pp_kaspi_kaspi"],
            },
          ],
        },
      })
      regionId = regions[0].id

      const { result: channels } = await createSalesChannelsWorkflow(
        container
      ).run({
        input: { salesChannelsData: [{ name: "Kaspi Test Channel" }] },
      })
      salesChannelId = channels[0].id

      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "Kaspi Test Warehouse",
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
        name: "Kaspi Test Delivery",
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
              title: "Kaspi Test Cement",
              status: ProductStatus.PUBLISHED,
              sales_channels: [{ id: salesChannelId }],
              options: [{ title: "Size", values: ["25kg"] }],
              variants: [
                {
                  title: "25kg",
                  sku: "KSP-CEM-25",
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
        { title: "kaspi-test", type: "publishable", created_by: "test" },
      ])
      await link.create({
        [Modules.API_KEY]: { publishable_key_id: publishableKey.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
      })
      storeHeaders = { "x-publishable-api-key": publishableKey.token }

      // Admin-пользователь: dev-подтверждение оплаты из панели идёт под ним.
      const authService = container.resolve(Modules.AUTH)
      const userService = container.resolve(Modules.USER)
      const adminEmail = "kaspi-admin@example.com"
      const adminPassword = "supersecret"
      const { authIdentity } = await authService.register("emailpass", {
        body: { email: adminEmail, password: adminPassword },
      })
      const adminUser = await userService.createUsers({ email: adminEmail })
      await authService.updateAuthIdentities({
        id: authIdentity!.id,
        app_metadata: { user_id: adminUser.id },
      })
      const { data: adminLogin } = await api.post("/auth/user/emailpass", {
        email: adminEmail,
        password: adminPassword,
      })
      adminHeaders = { authorization: `Bearer ${adminLogin.token}` }
    })

    // Корзина покупателя, готовая к оплате (позиции + доставка), БЕЗ платёжной
    // коллекции — её создаёт тестируемый роут инициализации оплаты.
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

    // Гостевая корзина (без customer_id) — путь гостевого checkout'а ассистента:
    // владение корзиной подтверждает сам cart_id (капабилити-токен).
    const prepareGuestCart = async () => {
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          currency_code: "usd",
          shipping_address: {
            first_name: "Guest",
            last_name: "Buyer",
            address_1: "1 Test St",
            city: "Astana",
            country_code: "us",
            postal_code: "010000",
          },
          items: [{ variant_id: variantId, quantity: 1 }],
        },
      })
      await addShippingMethodToCartWorkflow(container).run({
        input: { cart_id: cart.id, options: [{ id: shippingOptionId }] },
      })
      return cart.id
    }

    // Гостевая корзина, привязанная к ГОСТЕВОМУ customer (has_account=false —
    // ядро заводит такого, когда у гостевой корзины появляется email через
    // set_delivery ассистента). Должна оставаться доступной гостю по cart_id.
    const prepareGuestCartWithGuestCustomer = async () => {
      const customerModule = container.resolve(Modules.CUSTOMER)
      seq += 1
      const [guest] = await customerModule.createCustomers([
        { email: `guest-cust-${seq}@example.com` },
      ])
      expect(guest.has_account).toBe(false)
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          customer_id: guest.id,
          email: guest.email,
          currency_code: "usd",
          shipping_address: {
            first_name: "Guest",
            last_name: "Buyer",
            address_1: "1 Test St",
            city: "Astana",
            country_code: "us",
            postal_code: "010000",
          },
          items: [{ variant_id: variantId, quantity: 1 }],
        },
      })
      await addShippingMethodToCartWorkflow(container).run({
        input: { cart_id: cart.id, options: [{ id: shippingOptionId }] },
      })
      return cart.id
    }

    describe("POST /store/carts/:id/payment/kaspi", () => {
      it("creates payment collection + kaspi session and returns QR", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        const res = await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            {},
            { headers: buyer.headers }
          )
        )

        expect(res.status).toBe(200)
        const payment = res.data.payment
        expect(payment.payment_collection_id).toBeTruthy()
        expect(payment.payment_session_id).toBeTruthy()
        expect(payment.kaspi_state).toBe("pending")
        expect(payment.qr_payload).toContain("kaspi://pay?invoice=")
        expect(payment.payment_url).toContain("https://kaspi.kz/pay/")
      })

      it("is idempotent: repeated init returns the same session", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        const first = await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            {},
            { headers: buyer.headers }
          )
        )
        const second = await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            {},
            { headers: buyer.headers }
          )
        )

        expect(second.status).toBe(200)
        expect(second.data.payment.payment_session_id).toBe(
          first.data.payment.payment_session_id
        )
        expect(second.data.payment.payment_collection_id).toBe(
          first.data.payment.payment_collection_id
        )
      })

      it("returns 404 for another buyer's cart", async () => {
        const owner = await createCustomer()
        const stranger = await createCustomer()
        const cartId = await prepareCart(owner.customerId, owner.email)

        const res = await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            {},
            { headers: stranger.headers }
          )
        )

        expect(res.status).toBe(404)
      })

      it("returns 401 without authentication", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        const res = await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            {},
            { headers: storeHeaders }
          )
        )

        expect(res.status).toBe(401)
      })
    })

    describe("GET /store/carts/:id/payment/kaspi", () => {
      it("returns 400 when payment is not initialized", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        const res = await call(
          api.get(`/store/carts/${cartId}/payment/kaspi`, {
            headers: buyer.headers,
          })
        )

        expect(res.status).toBe(400)
      })

      it("keeps status pending while the invoice is not paid", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            { scenario: "pending" },
            { headers: buyer.headers }
          )
        )
        const res = await call(
          api.get(`/store/carts/${cartId}/payment/kaspi`, {
            headers: buyer.headers,
          })
        )

        expect(res.status).toBe(200)
        expect(res.data.payment.status).toBe("pending")
        expect(res.data.payment.kaspi_state).toBe("pending")
      })

      it("authorizes the session when the invoice is paid", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            { scenario: "paid" },
            { headers: buyer.headers }
          )
        )
        const res = await call(
          api.get(`/store/carts/${cartId}/payment/kaspi`, {
            headers: buyer.headers,
          })
        )

        expect(res.status).toBe(200)
        expect(["authorized", "captured"]).toContain(res.data.payment.status)
      })

      // --- Гостевой поллинг (T2.4): владение гостевой корзиной = сам cart_id ---

      it("polls a guest cart without authentication (cart_id is the capability)", async () => {
        // Гостевая корзина (без customer_id); оплату гостя инициирует ассистент
        // через workflow напрямую — повторяем это в тесте.
        const cartId = await prepareGuestCart()
        await initCartKaspiPaymentWorkflow(container).run({
          input: { cart_id: cartId },
          throwOnError: true,
        })

        const res = await call(
          api.get(`/store/carts/${cartId}/payment/kaspi`, {
            headers: storeHeaders,
          })
        )

        expect(res.status).toBe(200)
        expect(res.data.payment.kaspi_state).toBe("pending")
      })

      it("polls a guest cart with a guest customer (has_account=false)", async () => {
        // Корзина email-привязанного гостевого покупателя — именно её создаёт
        // ядро после set_delivery; поллинг без авторизации должен проходить.
        const cartId = await prepareGuestCartWithGuestCustomer()
        await initCartKaspiPaymentWorkflow(container).run({
          input: { cart_id: cartId },
          throwOnError: true,
        })

        const res = await call(
          api.get(`/store/carts/${cartId}/payment/kaspi`, {
            headers: storeHeaders,
          })
        )

        expect(res.status).toBe(200)
        expect(res.data.payment.kaspi_state).toBe("pending")
      })

      it("returns 404 for a customer-owned cart when polled without authentication", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            {},
            { headers: buyer.headers }
          )
        )

        const res = await call(
          api.get(`/store/carts/${cartId}/payment/kaspi`, {
            headers: storeHeaders,
          })
        )

        expect(res.status).toBe(404)
      })

      it("returns 404 for another buyer's cart on GET", async () => {
        const owner = await createCustomer()
        const stranger = await createCustomer()
        const cartId = await prepareCart(owner.customerId, owner.email)
        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            {},
            { headers: owner.headers }
          )
        )

        const res = await call(
          api.get(`/store/carts/${cartId}/payment/kaspi`, {
            headers: stranger.headers,
          })
        )

        expect(res.status).toBe(404)
      })
    })

    // --- Dev-подтверждение мок-оплаты (T8.6) --------------------------------
    // Мок задаёт исход при СОЗДАНИИ инвойса, а покупатель платит позже: без
    // этого роута сквозной путь «чат → оплата → заказ» руками не пройти.
    describe("POST /store/carts/:id/payment/kaspi/mock-pay", () => {
      it("marks a pending invoice as paid and authorizes the session", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            { scenario: "pending" },
            { headers: buyer.headers }
          )
        )

        const res = await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi/mock-pay`,
            {},
            { headers: buyer.headers }
          )
        )

        expect(res.status).toBe(200)
        expect(res.data.payment.kaspi_state).toBe("paid")
        expect(["authorized", "captured"]).toContain(res.data.payment.status)

        // Поллинг после подтверждения показывает то же — состояние держится.
        const polled = await call(
          api.get(`/store/carts/${cartId}/payment/kaspi`, {
            headers: buyer.headers,
          })
        )
        expect(["authorized", "captured"]).toContain(polled.data.payment.status)
      })

      it("works for a guest cart without authentication (cart_id is the capability)", async () => {
        const cartId = await prepareGuestCart()
        await initCartKaspiPaymentWorkflow(container).run({
          input: { cart_id: cartId },
          throwOnError: true,
        })

        const res = await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi/mock-pay`,
            {},
            { headers: storeHeaders }
          )
        )

        expect(res.status).toBe(200)
        expect(res.data.payment.kaspi_state).toBe("paid")
      })

      it("returns 400 when payment is not initialized", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        const res = await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi/mock-pay`,
            {},
            { headers: buyer.headers }
          )
        )

        expect(res.status).toBe(400)
      })

      it("returns 404 for a customer-owned cart when called without authentication", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            {},
            { headers: buyer.headers }
          )
        )

        const res = await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi/mock-pay`,
            {},
            { headers: storeHeaders }
          )
        )

        expect(res.status).toBe(404)
      })
    })

    // --- Та же мок-оплата, но кнопкой в панели (T12.23) --------------------
    // Оператору стенда нужен способ сказать «покупатель оплатил», не заходя на
    // сервер за `npm run kaspi:pay`: админ-роут ходит к сессии напрямую, без
    // токена покупателя.
    describe("/admin/kaspi-mock-payments", () => {
      it("lists the unpaid invoice and pays it by session id", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        const init = await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            { scenario: "pending" },
            { headers: buyer.headers }
          )
        )
        const sessionId = init.data.payment.payment_session_id

        const listed = await call(
          api.get("/admin/kaspi-mock-payments", { headers: adminHeaders })
        )
        expect(listed.status).toBe(200)
        expect(listed.data.mock_mode).toBe(true)
        const row = listed.data.payments.find(
          (payment: { payment_session_id: string }) =>
            payment.payment_session_id === sessionId
        )
        expect(row).toBeTruthy()
        expect(row.cart_id).toBe(cartId)
        expect(row.status).toBe("pending")
        expect(row.amount).toBeGreaterThan(0)
        expect(row.customer_name).toBe("Test Buyer")

        const paid = await call(
          api.post(
            "/admin/kaspi-mock-payments",
            { payment_session_id: sessionId },
            { headers: adminHeaders }
          )
        )
        expect(paid.status).toBe(200)
        expect(paid.data.payment.kaspi_state).toBe("paid")
        expect(["authorized", "captured"]).toContain(paid.data.payment.status)

        // Оплаченный счёт из списка уходит — оператор видит только то, что ждёт.
        const after = await call(
          api.get("/admin/kaspi-mock-payments", { headers: adminHeaders })
        )
        expect(
          after.data.payments.some(
            (payment: { payment_session_id: string }) =>
              payment.payment_session_id === sessionId
          )
        ).toBe(false)

        // Покупатель видит оплату своим поллингом: состояние одно на всех.
        const polled = await call(
          api.get(`/store/carts/${cartId}/payment/kaspi`, {
            headers: buyer.headers,
          })
        )
        expect(["authorized", "captured"]).toContain(polled.data.payment.status)
      })

      it("pays the freshest invoice without a body (npm run kaspi:pay behaviour)", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            { scenario: "pending" },
            { headers: buyer.headers }
          )
        )

        const paid = await call(
          api.post("/admin/kaspi-mock-payments", {}, { headers: adminHeaders })
        )

        expect(paid.status).toBe(200)
        expect(paid.data.payment.cart_id).toBe(cartId)
        expect(paid.data.payment.kaspi_state).toBe("paid")
      })

      it("returns 401 without admin authentication", async () => {
        const res = await call(api.get("/admin/kaspi-mock-payments"))
        expect(res.status).toBe(401)
      })
    })

    describe("placeOrder with Kaspi prepayment", () => {
      it("places the order after payment: init(paid) → poll → place", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            { scenario: "paid" },
            { headers: buyer.headers }
          )
        )
        const poll = await call(
          api.get(`/store/carts/${cartId}/payment/kaspi`, {
            headers: buyer.headers,
          })
        )
        expect(["authorized", "captured"]).toContain(poll.data.payment.status)

        const placed = await call(
          api.post(
            "/store/orders",
            { cart_id: cartId },
            { headers: buyer.headers }
          )
        )

        expect(placed.status).toBe(201)
        expect(placed.data.order.id).toBeTruthy()
        expect(placed.data.lifecycle.status).toBe("new")
      })

      it("places the order without explicit polling (precondition self-syncs)", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

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

        expect(placed.status).toBe(201)
        expect(placed.data.lifecycle.status).toBe("new")
      })

      // T4.14: при QR-оплате авторизация И ЕСТЬ оплата — оформление списывает
      // платёж само. Иначе у заказа два состояния денег: очередь показывает
      // «Оплачен», а ядровая страница — «Остаток к оплате».
      it("captures the payment right after placing the order", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

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
        expect(placed.status).toBe(201)

        const { data: orders } = await query().graph({
          entity: "order",
          fields: [
            "id",
            "payment_collections.status",
            "payment_collections.amount",
            "payment_collections.captured_amount",
            "payment_collections.payments.captured_at",
          ],
          filters: { id: placed.data.order.id },
        })
        const collection = (orders[0] as any).payment_collections[0]

        expect(collection.payments[0].captured_at).toBeTruthy()
        expect(Number(collection.captured_amount)).toBe(
          Number(collection.amount)
        )
        expect(collection.status).toBe("completed")
      })

      it("rejects placing the order while the invoice is unpaid", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            { scenario: "pending" },
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
        expect(placed.data.message).toContain("not completed")
      })

      it("rejects placing the order when the invoice is canceled", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        await call(
          api.post(
            `/store/carts/${cartId}/payment/kaspi`,
            { scenario: "canceled" },
            { headers: buyer.headers }
          )
        )
        const poll = await call(
          api.get(`/store/carts/${cartId}/payment/kaspi`, {
            headers: buyer.headers,
          })
        )
        expect(poll.status).toBe(200)
        expect(["authorized", "captured"]).not.toContain(
          poll.data.payment.status
        )

        const placed = await call(
          api.post(
            "/store/orders",
            { cart_id: cartId },
            { headers: buyer.headers }
          )
        )

        expect(placed.status).toBe(400)
      })

      it("rejects placing the order when payment was never initialized", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        const placed = await call(
          api.post(
            "/store/orders",
            { cart_id: cartId },
            { headers: buyer.headers }
          )
        )

        expect(placed.status).toBe(400)
        expect(placed.data.message).toContain("no payment session")
      })
    })
  },
})
