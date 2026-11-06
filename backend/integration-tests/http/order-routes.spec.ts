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

// Интеграционные тесты HTTP-роутов заказа: store-оформление + свой статус +
// отмена; admin-очередь + переходы жизненного цикла. Тонкие роуты поверх
// workflow из подзадачи 2 (сами workflow покрыты order-lifecycle-workflows.spec).
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
      const email = `buyer-${seq}@example.com`
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
                  sku: "ORD-CEM-25",
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

    describe("POST /store/orders", () => {
      it("places an order from the buyer's cart and creates lifecycle 'new'", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        const res = await call(
          api.post(
            "/store/orders",
            { cart_id: cartId },
            { headers: buyer.headers }
          )
        )

        expect(res.status).toEqual(201)
        expect(res.data.order.id).toMatch(/^order_/)
        expect(res.data.lifecycle.status).toEqual("new")
      })

      it("rejects a request without cart_id (400)", async () => {
        const buyer = await createCustomer()
        const res = await call(
          api.post("/store/orders", {}, { headers: buyer.headers })
        )
        expect(res.status).toEqual(400)
      })

      it("rejects an unauthenticated request (401)", async () => {
        const res = await call(
          api.post(
            "/store/orders",
            { cart_id: "cart_x" },
            { headers: storeHeaders }
          )
        )
        expect(res.status).toEqual(401)
      })
    })

    describe("GET /store/orders/:id/lifecycle", () => {
      it("returns the buyer's own order status and history", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: buyer.headers }
        )

        const res = await call(
          api.get(`/store/orders/${placed.order.id}/lifecycle`, {
            headers: buyer.headers,
          })
        )

        expect(res.status).toEqual(200)
        expect(res.data.status).toEqual("new")
        expect(Array.isArray(res.data.history)).toBe(true)
      })

      it("hides another buyer's order (404)", async () => {
        const owner = await createCustomer()
        const cartId = await prepareCart(owner.customerId, owner.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: owner.headers }
        )

        const stranger = await createCustomer()
        const res = await call(
          api.get(`/store/orders/${placed.order.id}/lifecycle`, {
            headers: stranger.headers,
          })
        )
        expect(res.status).toEqual(404)
      })
    })

    describe("GET /store/carts/me", () => {
      it("finds the buyer's unfinished cart and forgets it once the order is placed", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)

        const before = await call(
          api.get("/store/carts/me", { headers: buyer.headers })
        )
        expect(before.status).toEqual(200)
        expect(before.data.cart_id).toEqual(cartId)

        await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: buyer.headers }
        )

        const after = await call(
          api.get("/store/carts/me", { headers: buyer.headers })
        )
        expect(after.status).toEqual(200)
        expect(after.data.cart_id).toBeNull()
      })

      it("does not hand out another buyer's cart", async () => {
        const owner = await createCustomer()
        await prepareCart(owner.customerId, owner.email)

        const stranger = await createCustomer()
        const res = await call(
          api.get("/store/carts/me", { headers: stranger.headers })
        )

        expect(res.status).toEqual(200)
        expect(res.data.cart_id).toBeNull()
      })

      it("rejects an unauthenticated request (401)", async () => {
        const res = await call(
          api.get("/store/carts/me", { headers: storeHeaders })
        )
        expect(res.status).toEqual(401)
      })
    })

    describe("GET /store/order-lifecycles", () => {
      it("returns the stages of all buyer orders in one request", async () => {
        const buyer = await createCustomer()
        const firstCartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: first } = await api.post(
          "/store/orders",
          { cart_id: firstCartId },
          { headers: buyer.headers }
        )
        const secondCartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: second } = await api.post(
          "/store/orders",
          { cart_id: secondCartId },
          { headers: buyer.headers }
        )

        const res = await call(
          api.get("/store/order-lifecycles", { headers: buyer.headers })
        )

        expect(res.status).toEqual(200)
        const byOrder = new Map<
          string,
          { status: string; delivery_method: string }
        >(
          res.data.lifecycles.map(
            (l: {
              order_id: string
              status: string
              delivery_method: string
            }) => [l.order_id, l]
          )
        )
        expect(byOrder.get(first.order.id)?.status).toEqual("new")
        expect(byOrder.get(second.order.id)?.status).toEqual("new")
        expect(byOrder.get(second.order.id)?.delivery_method).toEqual(
          "delivery"
        )
      })

      it("does not leak another buyer's orders", async () => {
        const owner = await createCustomer()
        const cartId = await prepareCart(owner.customerId, owner.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: owner.headers }
        )

        const stranger = await createCustomer()
        const res = await call(
          api.get("/store/order-lifecycles", { headers: stranger.headers })
        )

        expect(res.status).toEqual(200)
        expect(
          res.data.lifecycles.some(
            (l: { order_id: string }) => l.order_id === placed.order.id
          )
        ).toBe(false)
      })

      it("rejects an unauthenticated request (401)", async () => {
        const res = await call(
          api.get("/store/order-lifecycles", { headers: storeHeaders })
        )
        expect(res.status).toEqual(401)
      })
    })

    describe("POST /store/orders/:id/cancel", () => {
      it("lets the buyer cancel their new order with a reason", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: buyer.headers }
        )

        const res = await call(
          api.post(
            `/store/orders/${placed.order.id}/cancel`,
            { reason: "changed my mind" },
            { headers: buyer.headers }
          )
        )

        expect(res.status).toEqual(200)
        expect(res.data.status).toEqual("canceled")
      })
    })

    describe("admin lifecycle queue + transitions", () => {
      it("walks confirm → start-assembly → complete-assembly → ship → deliver → close via HTTP", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: buyer.headers }
        )
        const orderId = placed.order.id as string

        // Очередь: заказ виден в статусе new.
        const queue = await call(
          api.get("/admin/order-lifecycles?status=new", {
            headers: adminHeaders,
          })
        )
        expect(queue.status).toEqual(200)
        const queued = queue.data.order_lifecycles.find(
          (l: { order?: { id?: string } }) => l.order?.id === orderId
        )
        expect(queued).toBeTruthy()
        // Строка очереди приходит готовой к отрисовке (экран ничего не считает):
        // плательщик, число позиций, итог с валютой, оплата, адрес.
        expect(queued.order).toMatchObject({
          id: orderId,
          display_id: expect.any(Number),
          customer_name: expect.any(String),
          is_company: false,
          item_count: expect.any(Number),
          currency_code: expect.any(String),
        })
        expect(queued.order.item_count).toBeGreaterThan(0)
        expect(queued.order.total).toBeGreaterThan(0)
        // Время и ответственный (T4.12): свежий заказ стоит в «Новом» нулевые
        // часы, срок стадии у него есть, просрочки нет, и из сотрудников его
        // никто не взял.
        expect(queued).toMatchObject({
          age_hours: 0,
          status_hours: 0,
          sla_hours: expect.any(Number),
          overdue: false,
          assignee: null,
        })

        // Счётчики для чипов-фильтров: наш заказ попал в «новые».
        expect(queue.data.counts.total).toBeGreaterThan(0)
        expect(queue.data.counts.by_status.new).toBeGreaterThan(0)
        // Счётчик просрочки — в том же ответе, что и чипы: шапка экрана
        // говорит числом, сколько заказов вышли за срок стадии.
        expect(typeof queue.data.counts.overdue).toEqual("number")

        // Фильтр статуса принимает список (чип «Сборка» = два статуса).
        const multi = await call(
          api.get("/admin/order-lifecycles?status=new,confirmed", {
            headers: adminHeaders,
          })
        )
        expect(multi.status).toEqual(200)
        expect(
          multi.data.order_lifecycles.every((l: { status: string }) =>
            ["new", "confirmed"].includes(l.status)
          )
        ).toBe(true)

        const confirm = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/confirm`,
            {},
            { headers: adminHeaders }
          )
        )
        expect(confirm.status).toEqual(200)
        expect(confirm.data.status).toEqual("confirmed")

        // После перехода ответственным стал тот, кто его сделал: строка очереди
        // отвечает на «с кого спросить» (T4.12).
        const afterConfirm = await call(
          api.get("/admin/order-lifecycles?status=confirmed", {
            headers: adminHeaders,
          })
        )
        const confirmed = afterConfirm.data.order_lifecycles.find(
          (l: { order?: { id?: string } }) => l.order?.id === orderId
        )
        expect(confirmed.assignee).toMatchObject({
          name: expect.any(String),
          role: "operator",
        })

        await api.post(
          `/admin/orders/${orderId}/lifecycle/start-assembly`,
          {},
          { headers: adminHeaders }
        )

        const items = await orderItems(orderId)
        const assembled = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/complete-assembly`,
            { items },
            { headers: adminHeaders }
          )
        )
        expect(assembled.status).toEqual(200)

        const fulfillmentId = await orderFulfillmentId(orderId)
        const shipped = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/ship`,
            { fulfillment_id: fulfillmentId, items },
            { headers: adminHeaders }
          )
        )
        expect(shipped.data.status).toEqual("in_delivery")

        // При отгрузке выдан код получения: покупатель видит его в своём
        // lifecycle, админский ответ кода не содержит (секрет покупателя).
        const buyerLifecycle = await call(
          api.get(`/store/orders/${orderId}/lifecycle`, {
            headers: buyer.headers,
          })
        )
        const deliveryCode = buyerLifecycle.data.delivery_code as string
        expect(deliveryCode).toMatch(/^\d{6}$/)
        expect(buyerLifecycle.data.delivery_method).toEqual("delivery")

        const adminLifecycle = await call(
          api.get(`/admin/orders/${orderId}/lifecycle`, {
            headers: adminHeaders,
          })
        )
        expect(adminLifecycle.data.delivery_code).toBeUndefined()

        // Вручение без кода / с неверным кодом отклоняется, статус не сдвигается.
        const noCode = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/deliver`,
            { fulfillment_id: fulfillmentId },
            { headers: adminHeaders }
          )
        )
        expect(noCode.status).toEqual(400)
        const wrongCode = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/deliver`,
            {
              fulfillment_id: fulfillmentId,
              // Гарантированно не совпадает с выданным кодом.
              delivery_code: deliveryCode === "000000" ? "111111" : "000000",
            },
            { headers: adminHeaders }
          )
        )
        expect(wrongCode.status).toEqual(400)

        const delivered = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/deliver`,
            { fulfillment_id: fulfillmentId, delivery_code: deliveryCode },
            { headers: adminHeaders }
          )
        )
        expect(delivered.data.status).toEqual("delivered")

        const closed = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/close`,
            {},
            { headers: adminHeaders }
          )
        )
        expect(closed.data.status).toEqual("closed")

        // История переходов доступна админу (6 переходов).
        const lifecycle = await call(
          api.get(`/admin/orders/${orderId}/lifecycle`, {
            headers: adminHeaders,
          })
        )
        expect(lifecycle.data.status).toEqual("closed")
        expect(lifecycle.data.history).toHaveLength(6)
        // Автор перехода — человек, а не одна роль «администратор» (T4.12):
        // переходы покупателя подписаны его именем, переходы панели — учёткой.
        const closedEvent = lifecycle.data.history.at(-1)
        expect(closedEvent.actor_type).toEqual("admin")
        expect(typeof closedEvent.actor_name).toEqual("string")
        expect(closedEvent.actor_name.length).toBeGreaterThan(0)
      })

      it("rejects an illegal transition (start-assembly on a new order) with 400", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: buyer.headers }
        )

        const res = await call(
          api.post(
            `/admin/orders/${placed.order.id}/lifecycle/start-assembly`,
            {},
            { headers: adminHeaders }
          )
        )
        expect(res.status).toEqual(400)
        expect(res.data.message).toContain("Нельзя перевести")
      })
    })

    // Карточка заказа для drawer'а очереди (T4.2c): бэкенд отдаёт ОДНИМ ответом
    // всё, что рисует карточка, — экран ничего не считает и не выбирает
    // fulfillment сам.
    // Перенос доставки из панели (T5.6b): продавец двигает окно по звонку
    // покупателя. Роут отдельный от переходов — статус заказа не меняется.
    describe("admin reschedule delivery", () => {
      it("отдаёт доступные окна и переносит доставку с записью в лог", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: buyer.headers }
        )
        const orderId = placed.order.id as string

        const options = await call(
          api.get(`/admin/orders/${orderId}/lifecycle/reschedule`, {
            headers: adminHeaders,
          })
        )
        expect(options.status).toEqual(200)
        expect(options.data).toMatchObject({
          order_id: orderId,
          status: "new",
          can_reschedule: true,
        })
        // Окна приходят КОДАМИ — подпись собирает панель на своём языке.
        expect(options.data.slots.length).toBeGreaterThan(0)
        expect(options.data.slots[0]).toEqual({
          date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          window: expect.stringMatching(/^(morning|day|evening)$/),
        })

        // Берём не первое окно, а последнее: первое может наступить сегодня.
        const target = options.data.slots[options.data.slots.length - 1]
        const moved = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/reschedule`,
            {
              slot_date: target.date,
              slot_window: target.window,
              reason: "покупатель просит другой день",
            },
            { headers: adminHeaders }
          )
        )
        expect(moved.status).toEqual(200)
        expect(moved.data).toEqual({
          order_id: orderId,
          delivery_date: target.date,
          delivery_window: target.window,
        })

        // Карточка заказа показывает новое окно, а статус остался прежним.
        const card = await call(
          api.get(`/admin/orders/${orderId}/lifecycle/card`, {
            headers: adminHeaders,
          })
        )
        expect(card.data.order_card.status).toEqual("new")
        expect(card.data.order_card.delivery).toMatchObject({
          slot_date: target.date,
          slot_window: target.window,
        })

        // Запись лога отвечает на «кто и почему подвинул».
        const slotEvents = card.data.order_card.history.filter(
          (event: { kind: string }) => event.kind === "slot"
        )
        expect(slotEvents).toHaveLength(1)
        expect(slotEvents[0]).toMatchObject({
          actor_type: "admin",
          reason: "покупатель просит другой день",
          to_slot_date: target.date,
          to_slot_window: target.window,
        })
        // Имя сотрудника, а не одна роль (T4.12) — лог заказа ведут ради этого.
        expect(slotEvents[0].actor_name).toEqual(expect.any(String))
      })

      it("не переносит доставку без причины (400)", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: buyer.headers }
        )
        const orderId = placed.order.id as string

        const options = await call(
          api.get(`/admin/orders/${orderId}/lifecycle/reschedule`, {
            headers: adminHeaders,
          })
        )
        const target = options.data.slots[options.data.slots.length - 1]

        const res = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/reschedule`,
            { slot_date: target.date, slot_window: target.window },
            { headers: adminHeaders }
          )
        )
        expect(res.status).toEqual(400)
      })

      it("отклоняет окно вне горизонта выбора (400)", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: buyer.headers }
        )
        const orderId = placed.order.id as string

        // Через месяц — за горизонтом недели: правило доступности одно на чат
        // покупателя и на панель продавца.
        const far = new Date(Date.now() + 30 * 24 * 3600_000)
          .toISOString()
          .slice(0, 10)
        const res = await call(
          api.post(
            `/admin/orders/${orderId}/lifecycle/reschedule`,
            { slot_date: far, slot_window: "morning", reason: "по звонку" },
            { headers: adminHeaders }
          )
        )
        expect(res.status).toEqual(400)
      })
    })

    describe("GET /admin/orders/:id/lifecycle/card", () => {
      it("returns a ready-to-render card: buyer, items, adding-up totals, delivery", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: buyer.headers }
        )
        const orderId = placed.order.id as string

        const res = await call(
          api.get(`/admin/orders/${orderId}/lifecycle/card`, {
            headers: adminHeaders,
          })
        )

        expect(res.status).toEqual(200)
        const card = res.data.order_card
        expect(card).toMatchObject({
          order_id: orderId,
          display_id: expect.any(Number),
          status: "new",
          delivery_method: "delivery",
        })
        expect(card.customer).toMatchObject({
          name: expect.any(String),
          email: buyer.email,
          is_company: false,
          company_id: null,
        })
        // Заказ физлица: лимита отсрочки нет вовсе.
        expect(card.credit).toBeNull()

        expect(card.items).toHaveLength(1)
        expect(card.items[0]).toMatchObject({
          id: expect.stringMatching(/^ordli_/),
          quantity: 2,
          unit_price: expect.any(Number),
          total: expect.any(Number),
        })

        // Деньги ДОЛЖНЫ сходиться: «Товары» + «Доставка» = «Итого».
        expect(card.totals.item_total).toBeGreaterThan(0)
        expect(card.totals.total).toEqual(
          card.totals.item_total + card.totals.shipping_total
        )
        expect(card.totals.currency_code).toEqual("usd")

        expect(card.delivery).toMatchObject({
          recipient: "Test Buyer",
          address: "1 Test St",
          city: "Astana",
        })

        // Позиции к сборке готовы, fulfillment'ов ещё нет.
        expect(card.transition_targets.items).toEqual([
          { id: card.items[0].id, quantity: 2 },
        ])
        expect(card.transition_targets.ship_fulfillment_id).toBeNull()
        expect(card.transition_targets.deliver_fulfillment_id).toBeNull()
      })

      it("fills the timeline and picks the fulfillment for ship and deliver", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: buyer.headers }
        )
        const orderId = placed.order.id as string

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
        await api.post(
          `/admin/orders/${orderId}/lifecycle/complete-assembly`,
          { items: await orderItems(orderId) },
          { headers: adminHeaders }
        )

        const assembled = await call(
          api.get(`/admin/orders/${orderId}/lifecycle/card`, {
            headers: adminHeaders,
          })
        )
        const fulfillmentId = await orderFulfillmentId(orderId)
        // Собран, но не отгружен: цель отгрузки — этот fulfillment.
        expect(assembled.data.order_card.status).toEqual("assembled")
        expect(
          assembled.data.order_card.transition_targets.ship_fulfillment_id
        ).toEqual(fulfillmentId)

        // Лог переходов приходит в форме контракта: служебных полей модели
        // (order_lifecycle_id, updated_at, deleted_at) в нём нет.
        expect(assembled.data.order_card.history).toHaveLength(3)
        expect(
          Object.keys(assembled.data.order_card.history[0]).sort()
        ).toEqual([
          "actor_id",
          // Имя автора перехода (T4.12) — часть контракта: экран подписывает
          // переход человеком, а не одной ролью.
          "actor_name",
          // Роль сотрудника по учётке — подпись «в каком качестве».
          "actor_role",
          "actor_type",
          "created_at",
          "from_slot_date",
          "from_slot_window",
          "from_status",
          "id",
          // Род записи и слот до/после (T5.6b): тем же логом ведётся перенос
          // доставки, и панель обязана различать его от перехода статуса.
          "kind",
          "reason",
          "to_slot_date",
          "to_slot_window",
          "to_status",
        ])

        await api.post(
          `/admin/orders/${orderId}/lifecycle/ship`,
          { fulfillment_id: fulfillmentId, items: await orderItems(orderId) },
          { headers: adminHeaders }
        )

        const shipped = await call(
          api.get(`/admin/orders/${orderId}/lifecycle/card`, {
            headers: adminHeaders,
          })
        )
        // Отгружен, но не вручён: цель вручения — тот же fulfillment.
        expect(shipped.data.order_card.status).toEqual("in_delivery")
        expect(
          shipped.data.order_card.transition_targets.deliver_fulfillment_id
        ).toEqual(fulfillmentId)
        // Код получения в карточке НЕ приходит — он секрет покупателя.
        expect(JSON.stringify(shipped.data.order_card)).not.toContain(
          "delivery_code"
        )
      })

      it("returns 404 for an unknown order", async () => {
        const res = await call(
          api.get("/admin/orders/order_missing/lifecycle/card", {
            headers: adminHeaders,
          })
        )
        expect(res.status).toEqual(404)
      })
    })
  },
})
