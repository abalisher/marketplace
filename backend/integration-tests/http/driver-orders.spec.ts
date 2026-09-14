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

jest.setTimeout(180000)

// Пул заказов водителя-gig и «взять заказ» (T5.2a): что водитель видит
// свободным, кого туда не пускают и что происходит, когда за один заказ берутся
// двое. Нужна полная фикстура заказа (регион, канал, склад, shipping option,
// товар с остатком) — пул читает НАСТОЯЩИЙ собранный заказ с fulfillment'ом, а
// не выдуманный order_id. Нужен docker-postgres; временная БД — backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let adminHeaders: Record<string, string>

    let regionId: string
    let salesChannelId: string
    let locationId: string
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

    // --- водитель: вход, профиль, допуск ---

    const nextPhone = () => {
      seq += 1
      return `+7702${String(5100000 + seq).padStart(7, "0")}`
    }

    const driverHeaders = (token: string) => ({
      authorization: `Bearer ${token}`,
    })

    // Сбрасывает паузу «выслать снова» (состояние кода общее на номер).
    const resetResendPause = async (phone: string) => {
      const authService = container.resolve(Modules.AUTH)
      const [identity] = await authService.listProviderIdentities({
        provider: "phone",
        entity_id: phone,
      })
      if (!identity) {
        return
      }
      const metadata = (identity.provider_metadata ?? {}) as Record<
        string,
        unknown
      >
      await authService.updateProviderIdentities([
        {
          id: identity.id,
          provider_metadata: {
            ...metadata,
            code_requested_at: new Date(Date.now() - 3600_000).toISOString(),
          },
        },
      ])
    }

    const login = async (phone: string) => {
      await resetResendPause(phone)
      const { data: sent } = await call(
        api.post("/driver/auth/phone/otp", { phone })
      )
      const res = await call(
        api.post("/driver/auth/phone/verify", { phone, code: sent.dev_code })
      )
      expect(res.status).toEqual(200)
      return res.data as { token: string; driver: { id: string } }
    }

    // Водитель «под ключ»: вход, заполненный профиль, допуск продавцом.
    const activeDriver = async (name: string) => {
      const session = await login(nextPhone())
      await call(
        api.post(
          "/driver/me",
          {
            full_name: name,
            vehicle_model: "ГАЗель Next",
            vehicle_plate: `${seq}23 abc 02`,
            capacity_kg: 1500,
          },
          { headers: driverHeaders(session.token) }
        )
      )
      const approved = await call(
        api.post(
          `/admin/drivers/${session.driver.id}/status`,
          { status: "active" },
          { headers: adminHeaders }
        )
      )
      expect(approved.status).toEqual(200)
      return session
    }

    // --- заказ: оформление и доведение до «собран» ---

    const placeTestOrder = async () => {
      seq += 1
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          currency_code: "usd",
          email: `buyer${seq}@example.com`,
          shipping_address: {
            first_name: "Ерлан",
            last_name: "Покупателев",
            phone: "+77015550101",
            address_1: `ул. Тестовая, ${seq}`,
            address_2: "кв. 7",
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
      await createPaymentSessionsWorkflow(container).run({
        input: {
          payment_collection_id: (
            carts[0] as { payment_collection?: { id: string } }
          ).payment_collection!.id,
          provider_id: "pp_system_default",
        },
      })

      const { result } = await placeOrderWorkflow(container).run({
        input: { cart_id: cart.id },
      })
      return result.order as unknown as { id: string; display_id: number }
    }

    // Заказ до состояния «собран»: именно такой попадает в пул водителя.
    const assembledOrder = async () => {
      const order = await placeTestOrder()
      await confirmOrderWorkflow(container).run({
        input: { order_id: order.id, actor_type: "seller" },
      })
      await startOrderAssemblyWorkflow(container).run({
        input: { order_id: order.id, actor_type: "seller" },
      })

      const orderService = container.resolve(Modules.ORDER)
      const full = await orderService.retrieveOrder(order.id, {
        relations: ["items"],
      })
      await completeOrderAssemblyWorkflow(container).run({
        input: {
          order_id: order.id,
          items: (full.items ?? []).map((item) => ({
            id: item.id,
            quantity: Number(item.quantity),
          })),
          location_id: locationId,
          actor_type: "seller",
        },
      })
      return order
    }

    const pool = (token: string) =>
      call(api.get("/driver/orders", { headers: driverHeaders(token) }))

    const claim = (token: string, orderId: string) =>
      call(
        api.post(
          `/driver/orders/${orderId}/claim`,
          {},
          { headers: driverHeaders(token) }
        )
      )

    beforeAll(async () => {
      container = getContainer()
      const fulfillment = container.resolve(Modules.FULFILLMENT)
      const link = container.resolve(ContainerRegistrationKeys.LINK)

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
      const { data: adminLogin } = await api.post("/auth/user/emailpass", {
        email,
        password,
      })
      adminHeaders = { authorization: `Bearer ${adminLogin.token}` }

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
      ).run({ input: { salesChannelsData: [{ name: "Driver Pool Channel" }] } })
      salesChannelId = channels[0].id

      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "Pool Warehouse",
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
        name: "Pool Delivery",
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
              title: "Pool Cement",
              status: ProductStatus.PUBLISHED,
              sales_channels: [{ id: salesChannelId }],
              options: [{ title: "Size", values: ["25kg"] }],
              variants: [
                {
                  title: "25kg",
                  sku: "POOL-CEM-25",
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
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: [
            {
              inventory_item_id: withInventory[0]?.variants?.[0]
                ?.inventory_items?.[0]?.inventory?.id as string,
              location_id: locationId,
              stocked_quantity: 1000,
            },
          ],
        },
      })
    })

    describe("допуск к работе", () => {
      it("не пускает к пулу без токена водителя", async () => {
        const res = await call(api.get("/driver/orders"))
        expect(res.status).toEqual(401)
      })

      it("не пускает к пулу водителя, чья заявка ещё на проверке", async () => {
        const session = await login(nextPhone())

        const res = await pool(session.token)
        expect(res.status).toEqual(403)
        expect(res.data.reason).toEqual("driver_pending")
        expect(res.data.message).toMatch(/проверк/i)
      })

      it("не пускает заблокированного и показывает причину продавца", async () => {
        const session = await activeDriver("Заблокированный Водителев")
        const blocked = await call(
          api.post(
            `/admin/drivers/${session.driver.id}/status`,
            { status: "blocked", note: "Не вышел на два заказа" },
            { headers: adminHeaders }
          )
        )
        expect(blocked.status).toEqual(200)

        const res = await pool(session.token)
        expect(res.status).toEqual(403)
        expect(res.data.reason).toEqual("driver_blocked")
        expect(res.data.message).toEqual("Не вышел на два заказа")
      })
    })

    describe("GET /driver/orders — пул", () => {
      it("показывает собранный заказ и не показывает только что оформленный", async () => {
        const session = await activeDriver("Бауыржан Сатыбалдиев")
        const fresh = await placeTestOrder()
        const ready = await assembledOrder()

        const res = await pool(session.token)
        expect(res.status).toEqual(200)

        const ids = res.data.orders.map((o: { order_id: string }) => o.order_id)
        expect(ids).toContain(ready.id)
        // Заказ в статусе new везти нечего: он ещё не собран.
        expect(ids).not.toContain(fresh.id)
      })

      it("отдаёт адрес и объём груза, но не контакты получателя", async () => {
        const session = await activeDriver("Данияр Пуловский")
        const ready = await assembledOrder()

        const res = await pool(session.token)
        const row = res.data.orders.find(
          (o: { order_id: string }) => o.order_id === ready.id
        )

        expect(row).toBeTruthy()
        expect(row.address).toContain("ул. Тестовая")
        expect(row.city).toEqual("Astana")
        expect(row.items_count).toEqual(1)
        expect(row.total_quantity).toEqual(2)
        // Имя и телефон получателя в пуле не светятся: он открыт всем
        // допущенным водителям, а контакты нужны только тому, кто заказ взял.
        expect(JSON.stringify(row)).not.toContain("77015550101")
        expect(JSON.stringify(row)).not.toContain("Покупателев")
      })
    })

    describe("POST /driver/orders/:id/claim — взять заказ", () => {
      it("заводит рейс с точкой выдачи и убирает заказ из пула", async () => {
        const session = await activeDriver("Первый Взявший")
        const ready = await assembledOrder()

        const res = await claim(session.token, ready.id)
        expect(res.status).toEqual(201)
        expect(res.data.trip.status).toEqual("planned")
        // Склад загрузки берётся из fulfillment'а заказа, а не выбирается наугад.
        expect(res.data.trip.location_id).toEqual(locationId)
        expect(res.data.stop.order_id).toEqual(ready.id)
        expect(res.data.stop.type).toEqual("delivery")
        expect(res.data.stop.status).toEqual("pending")
        // Взявшему контакты получателя нужны — они в снапшоте точки.
        expect(res.data.stop.address).toMatchObject({
          phone: "+77015550101",
          last_name: "Покупателев",
          city: "Astana",
        })

        // Рейс завёлся на того, кто взял.
        const { data: trips } = await call(
          api.get("/admin/logistics/trips", { headers: adminHeaders })
        )
        const trip = trips.trips.find(
          (t: { id: string }) => t.id === res.data.trip.id
        )
        expect(trip.driver_id).toEqual(session.driver.id)

        const after = await pool(session.token)
        expect(
          after.data.orders.map((o: { order_id: string }) => o.order_id)
        ).not.toContain(ready.id)
      })

      it("второму водителю отвечает 409: заказ уже взят", async () => {
        const first = await activeDriver("Быстрый Водителев")
        const second = await activeDriver("Опоздавший Водителев")
        const ready = await assembledOrder()

        expect((await claim(first.token, ready.id)).status).toEqual(201)

        const late = await claim(second.token, ready.id)
        expect(late.status).toEqual(409)
        expect(late.data.reason).toEqual("already_taken")
      })

      it("не даёт взять несобранный заказ и несуществующий", async () => {
        const session = await activeDriver("Ранний Водителев")
        const fresh = await placeTestOrder()

        const early = await claim(session.token, fresh.id)
        expect(early.status).toEqual(409)
        expect(early.data.reason).toEqual("not_ready")

        const missing = await claim(session.token, "order_does_not_exist")
        expect(missing.status).toEqual(404)
        expect(missing.data.reason).toEqual("not_found")
      })
    })
  },
})
