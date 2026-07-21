import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import {
  createCartWorkflow,
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"

jest.setTimeout(180000)

// Интеграционные тесты POS-корзины продавца (гэпы 1–2 сверки partner-раунда,
// 2026-07-18): /admin/counter-carts — создание с pickup-опцией склада,
// позиции, оплата (наличные pp_system_default | Kaspi QR), пробитие через
// POST /admin/counter-orders; плюс поиск/фильтр очереди /admin/order-lifecycles
// (гэп 4). Store-роуты не используются вовсе — весь флоу admin-аутентификация.
// Нужен docker-postgres; временная БД — backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let adminHeaders: Record<string, string>

    let regionId: string
    let salesChannelId: string
    let locationId: string
    let bareLocationId: string
    let variantId: string

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

    beforeAll(async () => {
      container = getContainer()
      const fulfillment = container.resolve(Modules.FULFILLMENT)
      const link = container.resolve(ContainerRegistrationKeys.LINK)

      // Регион с обоими провайдерами: system_default (наличные) + Kaspi (QR).
      const { result: regions } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Kazakhstan Test",
              currency_code: "usd",
              countries: ["us"],
              payment_providers: ["pp_system_default", "pp_kaspi_kaspi"],
            },
          ],
        },
      })
      regionId = regions[0].id

      const { result: channels } = await createSalesChannelsWorkflow(
        container
      ).run({
        input: { salesChannelsData: [{ name: "POS Channel" }] },
      })
      salesChannelId = channels[0].id

      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "POS Warehouse",
              address: { city: "Astana", country_code: "us", address_1: "1" },
            },
            // Склад без pickup-набора — для теста ошибки создания корзины.
            {
              name: "Bare Warehouse",
              address: { city: "Astana", country_code: "us", address_1: "2" },
            },
          ],
        },
      })
      locationId = locations[0].id
      bareLocationId = locations[1].id
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: { id: locationId, add: [salesChannelId] },
      })
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: { id: bareLocationId, add: [salesChannelId] },
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

      // Pickup-набор склада (как «Pickup — <склад>» в seed-kz).
      const fulfillmentSet = await fulfillment.createFulfillmentSets({
        name: "Pickup — POS Warehouse",
        type: "pickup",
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

      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: "Самовывоз: POS Warehouse",
            price_type: "flat",
            provider_id: "manual_manual",
            service_zone_id: fulfillmentSet.service_zones[0].id,
            shipping_profile_id: shippingProfile.id,
            type: {
              label: "Pickup",
              description: "Самовывоз со склада",
              code: "pickup",
            },
            prices: [
              { currency_code: "usd", amount: 0 },
              { region_id: regionId, amount: 0 },
            ],
            rules: [
              { attribute: "enabled_in_store", value: "true", operator: "eq" },
              { attribute: "is_return", value: "false", operator: "eq" },
            ],
          },
        ],
      })

      const { result: products } = await createProductsWorkflow(container).run(
        {
          input: {
            products: [
              {
                title: "POS Cement",
                status: ProductStatus.PUBLISHED,
                sales_channels: [{ id: salesChannelId }],
                options: [{ title: "Size", values: ["25kg"] }],
                variants: [
                  {
                    title: "25kg",
                    sku: "POS-CEM-25",
                    manage_inventory: true,
                    options: { Size: "25kg" },
                    prices: [{ amount: 20, currency_code: "usd" }],
                  },
                ],
              },
            ],
          },
        }
      )
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

    // POS-корзина с одной позицией (2 × 20 usd) — заготовка сценариев оплаты.
    const prepareCounterCart = async () => {
      const { data: created } = await api.post(
        "/admin/counter-carts",
        { location_id: locationId },
        { headers: adminHeaders }
      )
      const cartId = created.cart.id as string
      await api.post(
        `/admin/counter-carts/${cartId}/line-items`,
        { variant_id: variantId, quantity: 2 },
        { headers: adminHeaders }
      )
      return cartId
    }

    describe("POS-корзина: создание и позиции", () => {
      it("создаёт корзину с контекстом склада и pickup-опцией", async () => {
        const { data, status } = await api.post(
          "/admin/counter-carts",
          { location_id: locationId },
          { headers: adminHeaders }
        )

        expect(status).toBe(201)
        expect(data.cart.metadata).toMatchObject({
          counter: true,
          location_id: locationId,
        })
        expect(data.cart.region_id).toBe(regionId)
        expect(data.cart.sales_channel_id).toBe(salesChannelId)
        expect(data.cart.email).toBe("pos@marketplace.local")
        expect(data.cart.shipping_methods).toHaveLength(1)
        expect(data.cart.shipping_methods[0].name).toBe(
          "Самовывоз: POS Warehouse"
        )
        expect(data.cart.items).toHaveLength(0)
        expect(data.cart.total).toBe(0)
      })

      it("склад без pickup-опции → 400 с внятной ошибкой", async () => {
        const res = await call(
          api.post(
            "/admin/counter-carts",
            { location_id: bareLocationId },
            { headers: adminHeaders }
          )
        )
        expect(res.status).toBe(400)
        expect(res.data.message).toContain("pickup")
      })

      it("наполнение: добавить, изменить количество, удалить позицию", async () => {
        const cartId = await prepareCounterCart()

        const { data: withItem } = await api.get(
          `/admin/counter-carts/${cartId}`,
          { headers: adminHeaders }
        )
        expect(withItem.cart.items).toHaveLength(1)
        expect(withItem.cart.items[0].quantity).toBe(2)
        expect(withItem.cart.items[0].unit_price).toBe(20)
        expect(withItem.cart.total).toBe(40)

        const lineId = withItem.cart.items[0].id
        const { data: updated } = await api.post(
          `/admin/counter-carts/${cartId}/line-items/${lineId}`,
          { quantity: 5 },
          { headers: adminHeaders }
        )
        expect(updated.cart.items[0].quantity).toBe(5)
        expect(updated.cart.total).toBe(100)

        const { data: emptied } = await api.delete(
          `/admin/counter-carts/${cartId}/line-items/${lineId}`,
          { headers: adminHeaders }
        )
        expect(emptied.cart.items).toHaveLength(0)
        expect(emptied.cart.total).toBe(0)
      })

      it("покупательская корзина (без metadata.counter) → 404", async () => {
        const { result: cart } = await createCartWorkflow(container).run({
          input: {
            region_id: regionId,
            sales_channel_id: salesChannelId,
            currency_code: "usd",
            email: "buyer@example.com",
          },
        })

        const res = await call(
          api.get(`/admin/counter-carts/${cart.id}`, { headers: adminHeaders })
        )
        expect(res.status).toBe(404)
      })
    })

    describe("POS-оплата: наличные и Kaspi QR", () => {
      it("наличные: сессия pp_system_default → counter-order пробивается", async () => {
        const cartId = await prepareCounterCart()

        const { data: payment } = await api.post(
          `/admin/counter-carts/${cartId}/payment/cash`,
          {},
          { headers: adminHeaders }
        )
        expect(payment.payment.payment_session_id).toBeTruthy()
        expect(payment.payment.status).toBe("pending")

        // Идемпотентность: повторный вызов возвращает ту же сессию.
        const { data: repeated } = await api.post(
          `/admin/counter-carts/${cartId}/payment/cash`,
          {},
          { headers: adminHeaders }
        )
        expect(repeated.payment.payment_session_id).toBe(
          payment.payment.payment_session_id
        )

        const { data: placed, status } = await api.post(
          "/admin/counter-orders",
          { cart_id: cartId, location_id: locationId },
          { headers: adminHeaders }
        )
        expect(status).toBe(201)
        expect(placed.lifecycle.delivery_method).toBe("counter")

        // Статус — свежим GET: в ответе counter-orders lifecycle на момент
        // создания (переход new → delivered происходит дальше в workflow).
        const { data: lifecycle } = await api.get(
          `/admin/orders/${placed.order.id}/lifecycle`,
          { headers: adminHeaders }
        )
        expect(lifecycle.status).toBe("delivered")
      })

      it("Kaspi: init → QR, оплачено → authorized → counter-order", async () => {
        const cartId = await prepareCounterCart()

        const { data: init } = await api.post(
          `/admin/counter-carts/${cartId}/payment/kaspi`,
          { scenario: "paid" },
          { headers: adminHeaders }
        )
        expect(init.payment.qr_payload).toBeTruthy()
        expect(init.payment.payment_url).toBeTruthy()

        const { data: polled } = await api.get(
          `/admin/counter-carts/${cartId}/payment/kaspi`,
          { headers: adminHeaders }
        )
        expect(polled.payment.status).toBe("authorized")

        const { status } = await api.post(
          "/admin/counter-orders",
          { cart_id: cartId, location_id: locationId },
          { headers: adminHeaders }
        )
        expect(status).toBe(201)
      })

      it("Kaspi не оплачен → counter-order 400", async () => {
        const cartId = await prepareCounterCart()

        await api.post(
          `/admin/counter-carts/${cartId}/payment/kaspi`,
          { scenario: "pending" },
          { headers: adminHeaders }
        )

        const res = await call(
          api.post(
            "/admin/counter-orders",
            { cart_id: cartId, location_id: locationId },
            { headers: adminHeaders }
          )
        )
        expect(res.status).toBe(400)
        expect(res.data.message).toContain("Kaspi")
      })

      it("смена способа оплаты: Kaspi → наличные (сессия заменяется)", async () => {
        const cartId = await prepareCounterCart()

        await api.post(
          `/admin/counter-carts/${cartId}/payment/kaspi`,
          { scenario: "pending" },
          { headers: adminHeaders }
        )
        await api.post(
          `/admin/counter-carts/${cartId}/payment/cash`,
          {},
          { headers: adminHeaders }
        )

        // Kaspi-сессии больше нет — предусловие оплаты видит только наличные.
        const { data } = await api.get(`/admin/counter-carts/${cartId}`, {
          headers: adminHeaders,
        })
        expect(data.cart.payment_sessions).toHaveLength(1)
        expect(data.cart.payment_sessions[0].provider_id).toBe(
          "pp_system_default"
        )

        const { status } = await api.post(
          "/admin/counter-orders",
          { cart_id: cartId, location_id: locationId },
          { headers: adminHeaders }
        )
        expect(status).toBe(201)
      })
    })

    describe("очередь заказов: поиск и фильтр способа получения", () => {
      // Состояние БД не переживает границу тестов (эмпирика раннера) —
      // весь сценарий очереди одним самодостаточным тестом вокруг одного
      // пробитого POS-заказа.
      it("q (номер/email) и delivery_method фильтруют очередь", async () => {
        const cartId = await prepareCounterCart()
        await api.post(
          `/admin/counter-carts/${cartId}/payment/cash`,
          {},
          { headers: adminHeaders }
        )
        const { data: placed } = await api.post(
          "/admin/counter-orders",
          { cart_id: cartId, location_id: locationId },
          { headers: adminHeaders }
        )

        const { data: counterOnly } = await api.get(
          "/admin/order-lifecycles?delivery_method=counter",
          { headers: adminHeaders }
        )
        expect(counterOnly.order_lifecycles.length).toBeGreaterThan(0)
        for (const lifecycle of counterOnly.order_lifecycles) {
          expect(lifecycle.delivery_method).toBe("counter")
        }

        const displayId = counterOnly.order_lifecycles.find(
          (l: { order: { id: string } }) => l.order.id === placed.order.id
        )!.order.display_id as number

        // Поиск по номеру заказа (в т.ч. с «#», как вводит продавец).
        for (const q of [`${displayId}`, `%23${displayId}`]) {
          const { data } = await api.get(`/admin/order-lifecycles?q=${q}`, {
            headers: adminHeaders,
          })
          expect(
            data.order_lifecycles.some(
              (l: { order: { display_id: number } }) =>
                l.order.display_id === displayId
            )
          ).toBe(true)
        }

        // Поиск по email покупателя (частичное совпадение, без регистра).
        const { data: byEmail } = await api.get(
          "/admin/order-lifecycles?q=POS@marketplace",
          { headers: adminHeaders }
        )
        expect(byEmail.order_lifecycles.length).toBeGreaterThan(0)
        for (const lifecycle of byEmail.order_lifecycles) {
          expect(lifecycle.order.email).toBe("pos@marketplace.local")
        }

        // q сочетается с фильтром статуса: POS-заказ уже delivered.
        const { data: wrongStatus } = await api.get(
          `/admin/order-lifecycles?q=${displayId}&status=new`,
          { headers: adminHeaders }
        )
        expect(wrongStatus.order_lifecycles).toHaveLength(0)

        // Без совпадений → пустая страница, а не ошибка.
        const { data: noMatch } = await api.get(
          "/admin/order-lifecycles?q=no-such-buyer@nowhere.kz",
          { headers: adminHeaders }
        )
        expect(noMatch.order_lifecycles).toHaveLength(0)
        expect(noMatch.count).toBe(0)
      })
    })

    describe("привязка покупателя по телефону (гэп 3)", () => {
      const cartCustomerId = async (cartId: string) => {
        const { data } = await query().graph({
          entity: "cart",
          fields: ["id", "customer_id"],
          filters: { id: cartId },
        })
        return (data[0] as { customer_id: string | null }).customer_id
      }

      it("заводит покупателя по телефону и переиспользует его при повторной продаже", async () => {
        const phone = "+7 701 555 33 22"

        const first = await call(
          api.post(
            "/admin/counter-carts",
            { location_id: locationId, phone },
            { headers: adminHeaders }
          )
        )
        expect(first.status).toEqual(201)
        const firstCustomer = await cartCustomerId(first.data.cart.id)
        expect(firstCustomer).toBeTruthy()

        // У покупателя проставлен телефон.
        const { data: customers } = await query().graph({
          entity: "customer",
          fields: ["id", "phone"],
          filters: { id: firstCustomer as string },
        })
        expect((customers[0] as { phone: string }).phone).toEqual(phone)

        // Повторная продажа тому же телефону → тот же покупатель (не дубль).
        const second = await call(
          api.post(
            "/admin/counter-carts",
            { location_id: locationId, phone },
            { headers: adminHeaders }
          )
        )
        expect(await cartCustomerId(second.data.cart.id)).toEqual(firstCustomer)
      })

      it("без телефона — гостевой покупатель без телефона (ядро заводит его по email)", async () => {
        // Medusa createCart сам находит/создаёт customer по email — поэтому
        // customer_id есть всегда; смысл гэпа 3 в том, что БЕЗ телефона покупатель
        // не привязан к телефону (fallback-гость), а С телефоном — привязан.
        const res = await call(
          api.post(
            "/admin/counter-carts",
            { location_id: locationId },
            { headers: adminHeaders }
          )
        )
        expect(res.status).toEqual(201)
        const customerId = await cartCustomerId(res.data.cart.id)
        if (customerId) {
          const { data: customers } = await query().graph({
            entity: "customer",
            fields: ["id", "phone"],
            filters: { id: customerId },
          })
          expect((customers[0] as { phone: string | null }).phone).toBeFalsy()
        }
      })
    })
  },
})
