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

jest.setTimeout(180000)

// Свои рейсы и ведение точек водителем-gig (T5.2b): что водитель видит в «моих
// рейсах», как ведёт рейс и точку и что происходит с заказом на выдаче. Нужна
// полная фикстура заказа (регион, канал, склад, shipping option, товар с
// остатком): точка ведётся по НАСТОЯЩЕМУ заказу — отметка «выдано» триггерит
// deliver-order и требует живого fulfillment'а и кода получения.
// Нужен docker-postgres; временная БД — backend/.env.test.
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
      return `+7702${String(5200000 + seq).padStart(7, "0")}`
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

    // Заказ до состояния «собран»: именно такой водитель берёт из пула.
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

    // Живой fulfillment заказа: его отгружает склад и по нему ядро фиксирует
    // вручение.
    const liveFulfillment = async (orderId: string) => {
      const { data } = await query().graph({
        entity: "order",
        fields: [
          "fulfillments.id",
          "fulfillments.canceled_at",
          "fulfillments.delivered_at",
        ],
        filters: { id: orderId },
      })
      const fulfillments = (
        data[0] as {
          fulfillments?: {
            id: string
            canceled_at: Date | null
            delivered_at: Date | null
          }[]
        }
      ).fulfillments!
      return fulfillments.find((f) => !f.canceled_at && !f.delivered_at)!
    }

    // Отгрузка со склада: заказ → in_delivery, покупателю выдаётся код
    // получения. В жизни это делает человек на складе, передавая груз.
    const shipOrder = async (orderId: string) => {
      const orderService = container.resolve(Modules.ORDER)
      const full = await orderService.retrieveOrder(orderId, {
        relations: ["items"],
      })
      const fulfillment = await liveFulfillment(orderId)
      await shipOrderWorkflow(container).run({
        input: {
          order_id: orderId,
          fulfillment_id: fulfillment.id,
          items: (full.items ?? []).map((item) => ({
            id: item.id,
            quantity: Number(item.quantity),
          })),
          actor_type: "seller",
        },
      })
    }

    // Номер заказа (№28) — его же водитель видит на точке. У результата
    // placeOrder его нет, поэтому читаем из заказа.
    const orderNumber = async (orderId: string) => {
      const { data } = await query().graph({
        entity: "order",
        fields: ["display_id"],
        filters: { id: orderId },
      })
      return Number((data[0] as { display_id: unknown }).display_id)
    }

    // Код получения знает покупатель; в тесте читаем его из жизненного цикла.
    const deliveryCode = async (orderId: string) => {
      const { data } = await query().graph({
        entity: "order",
        fields: ["order_lifecycle.delivery_code", "order_lifecycle.status"],
        filters: { id: orderId },
      })
      return (
        data[0] as {
          order_lifecycle?: { delivery_code: string | null; status: string }
        }
      ).order_lifecycle!
    }

    const lifecycle = async (orderId: string) => {
      const res = await call(
        api.get(`/admin/orders/${orderId}/lifecycle`, { headers: adminHeaders })
      )
      expect(res.status).toEqual(200)
      return res.data as {
        status: string
        history: {
          to_status: string
          actor_type: string
          actor_name: string | null
        }[]
      }
    }

    // --- поверхность водителя ---

    const claim = (token: string, orderId: string) =>
      call(
        api.post(
          `/driver/orders/${orderId}/claim`,
          {},
          { headers: driverHeaders(token) }
        )
      )

    const myTrips = (token: string) =>
      call(api.get("/driver/trips", { headers: driverHeaders(token) }))

    const myTrip = (token: string, tripId: string) =>
      call(
        api.get(`/driver/trips/${tripId}`, { headers: driverHeaders(token) })
      )

    const setTripStatus = (token: string, tripId: string, status: string) =>
      call(
        api.post(
          `/driver/trips/${tripId}/status`,
          { status },
          { headers: driverHeaders(token) }
        )
      )

    const setStopStatus = (
      token: string,
      tripId: string,
      stopId: string,
      body: Record<string, unknown>
    ) =>
      call(
        api.post(
          `/driver/trips/${tripId}/stops/${stopId}/status`,
          body,
          { headers: driverHeaders(token) }
        )
      )

    const ping = (
      token: string,
      tripId: string,
      body: Record<string, unknown>
    ) =>
      call(
        api.post(`/driver/trips/${tripId}/gps`, body, {
          headers: driverHeaders(token),
        })
      )

    // Водитель со взятым заказом: дальше тест ведёт именно этот рейс.
    const driverWithTrip = async (name: string) => {
      const session = await activeDriver(name)
      const order = await assembledOrder()
      const taken = await claim(session.token, order.id)
      expect(taken.status).toEqual(201)
      return {
        session,
        order,
        trip: taken.data.trip as { id: string; status: string },
        stop: taken.data.stop as { id: string; order_id: string },
      }
    }

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
      ).run({ input: { salesChannelsData: [{ name: "Driver Trip Channel" }] } })
      salesChannelId = channels[0].id

      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "Trip Warehouse",
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
        name: "Trip Delivery",
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
              title: "Trip Cement",
              status: ProductStatus.PUBLISHED,
              sales_channels: [{ id: salesChannelId }],
              options: [{ title: "Size", values: ["25kg"] }],
              variants: [
                {
                  title: "25kg",
                  sku: "TRIP-CEM-25",
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

    describe("допуск к рейсам", () => {
      it("не пускает без токена водителя", async () => {
        const res = await call(api.get("/driver/trips"))
        expect(res.status).toEqual(401)
      })

      it("не пускает водителя, чья заявка ещё на проверке", async () => {
        const session = await login(nextPhone())

        const res = await myTrips(session.token)
        expect(res.status).toEqual(403)
        expect(res.data.reason).toEqual("driver_pending")
      })
    })

    describe("GET /driver/trips — мои рейсы", () => {
      it("отдаёт взятый рейс с точкой, номером заказа и контактом получателя", async () => {
        const { session, order, trip } = await driverWithTrip("Мойрейс Водителев")

        const res = await myTrips(session.token)
        expect(res.status).toEqual(200)

        const mine = res.data.trips.find((t: { id: string }) => t.id === trip.id)
        expect(mine).toBeTruthy()
        expect(mine.status).toEqual("planned")
        expect(mine.stops).toHaveLength(1)
        expect(mine.stops[0].order_id).toEqual(order.id)
        // Номер заказа — как в панели продавца: водитель называет «двадцать
        // восьмой», а не order_01H….
        expect(mine.stops[0].display_id).toEqual(await orderNumber(order.id))
        // Контакты получателя открыты взявшему — по ним он звонит с дороги.
        expect(mine.stops[0].address).toMatchObject({
          phone: "+77015550101",
          city: "Astana",
        })
      })

      it("не показывает рейс другого водителя", async () => {
        const mine = await driverWithTrip("Свой Водителев")
        const other = await activeDriver("Чужой Водителев")

        const res = await myTrips(other.token)
        expect(res.status).toEqual(200)
        expect(res.data.trips.map((t: { id: string }) => t.id)).not.toContain(
          mine.trip.id
        )

        // И заглянуть в чужой рейс по id нельзя: для водителя его нет.
        const peek = await myTrip(other.token, mine.trip.id)
        expect(peek.status).toEqual(404)
        expect(peek.data.reason).toEqual("trip_not_found")
      })
    })

    describe("POST /driver/trips/:id/status — ведение рейса", () => {
      it("ведёт рейс от погрузки до пути и ставит время выезда", async () => {
        const { session, trip } = await driverWithTrip("Ведущий Водителев")

        const loading = await setTripStatus(session.token, trip.id, "loading")
        expect(loading.status).toEqual(200)
        expect(loading.data.trip.status).toEqual("loading")

        const enRoute = await setTripStatus(session.token, trip.id, "en_route")
        expect(enRoute.status).toEqual(200)
        expect(enRoute.data.trip.status).toEqual("en_route")
        expect(enRoute.data.trip.started_at).toBeTruthy()

        // Тот же шаг второй раз — состояние экрана устарело, а не ошибка ввода.
        const again = await setTripStatus(session.token, trip.id, "en_route")
        expect(again.status).toEqual(409)
        expect(again.data.reason).toEqual("invalid_transition")
      })

      it("не даёт завершить рейс с необслуженной точкой", async () => {
        const { session, trip } = await driverWithTrip("Спешащий Водителев")
        await setTripStatus(session.token, trip.id, "en_route")

        const res = await setTripStatus(session.token, trip.id, "completed")
        expect(res.status).toEqual(409)
        expect(res.data.reason).toEqual("stops_open")
      })

      it("не даёт водителю отменить рейс — это решение продавца", async () => {
        const { session, trip } = await driverWithTrip("Отказной Водителев")

        const res = await setTripStatus(session.token, trip.id, "canceled")
        expect(res.status).toEqual(400)
      })
    })

    describe("POST /driver/trips/:id/stops/:stop_id/status — выдача", () => {
      it("выдаёт заказ по коду покупателя и переводит его в delivered", async () => {
        const { session, order, trip, stop } =
          await driverWithTrip("Выдающий Водителев")
        await shipOrder(order.id)
        const { delivery_code } = await deliveryCode(order.id)

        await setTripStatus(session.token, trip.id, "en_route")
        const arrived = await setStopStatus(session.token, trip.id, stop.id, {
          status: "arrived",
        })
        expect(arrived.status).toEqual(200)
        expect(arrived.data.stop.status).toEqual("arrived")

        const done = await setStopStatus(session.token, trip.id, stop.id, {
          status: "done",
          delivery_code,
          proof: { photos: ["https://files.local/proof-1.jpg"] },
        })
        expect(done.status).toEqual(200)
        expect(done.data.stop.status).toEqual("done")
        expect(done.data.stop.proof).toMatchObject({
          photos: ["https://files.local/proof-1.jpg"],
        })

        // Отдельной кнопки «вручить» у водителя нет: заказ закрывает отметка
        // на точке.
        const detail = await lifecycle(order.id)
        expect(detail.status).toEqual("delivered")
        const delivered = detail.history.find(
          (event) => event.to_status === "delivered"
        )
        // В логе стоит водитель с именем, а не «администратор» без имени.
        expect(delivered?.actor_type).toEqual("driver")
        expect(delivered?.actor_name).toEqual("Выдающий Водителев")

        // Рейс с закрытой точкой завершается.
        const completed = await setTripStatus(
          session.token,
          trip.id,
          "completed"
        )
        expect(completed.status).toEqual(200)
        expect(completed.data.trip.finished_at).toBeTruthy()
      })

      it("не даёт выдать заказ, который ещё не отгрузили со склада", async () => {
        const { session, trip, stop } = await driverWithTrip("Ранний Выдавальщик")
        await setStopStatus(session.token, trip.id, stop.id, {
          status: "arrived",
        })

        const res = await setStopStatus(session.token, trip.id, stop.id, {
          status: "done",
          delivery_code: "123456",
          proof: { signature: "data:image/png;base64,AAA" },
        })
        expect(res.status).toEqual(409)
        expect(res.data.reason).toEqual("order_not_shipped")
      })

      it("отбивает неверный код получения и оставляет заказ в доставке", async () => {
        const { session, order, trip, stop } =
          await driverWithTrip("Ошибающийся Водителев")
        await shipOrder(order.id)
        const { delivery_code } = await deliveryCode(order.id)
        await setStopStatus(session.token, trip.id, stop.id, {
          status: "arrived",
        })

        const wrong = await setStopStatus(session.token, trip.id, stop.id, {
          status: "done",
          delivery_code: delivery_code === "000000" ? "111111" : "000000",
          proof: { photos: ["https://files.local/proof-2.jpg"] },
        })
        expect(wrong.status).toEqual(400)
        expect(wrong.data.reason).toEqual("invalid_delivery_code")

        // Точка осталась открытой, заказ — в доставке.
        const detail = await lifecycle(order.id)
        expect(detail.status).toEqual("in_delivery")
        const tripAfter = await myTrip(session.token, trip.id)
        expect(tripAfter.data.trip.stops[0].status).toEqual("arrived")
      })

      it("требует код и доказательство выдачи, а на провал — причину", async () => {
        const { session, order, trip, stop } =
          await driverWithTrip("Пустой Водителев")
        await shipOrder(order.id)
        const { delivery_code } = await deliveryCode(order.id)
        await setStopStatus(session.token, trip.id, stop.id, {
          status: "arrived",
        })

        const noCode = await setStopStatus(session.token, trip.id, stop.id, {
          status: "done",
          proof: { photos: ["https://files.local/proof-3.jpg"] },
        })
        expect(noCode.status).toEqual(400)

        const noProof = await setStopStatus(session.token, trip.id, stop.id, {
          status: "done",
          delivery_code,
        })
        expect(noProof.status).toEqual(400)

        const noReason = await setStopStatus(session.token, trip.id, stop.id, {
          status: "failed",
        })
        expect(noReason.status).toEqual(400)
      })

      it("закрывает точку как проваленную с причиной для продавца", async () => {
        const { session, order, trip, stop } =
          await driverWithTrip("Невезучий Водителев")
        await shipOrder(order.id)
        await setStopStatus(session.token, trip.id, stop.id, {
          status: "arrived",
        })

        const failed = await setStopStatus(session.token, trip.id, stop.id, {
          status: "failed",
          note: "Покупателя нет на объекте, телефон не отвечает",
        })
        expect(failed.status).toEqual(200)
        expect(failed.data.stop.status).toEqual("failed")
        expect(failed.data.stop.note).toMatch(/нет на объекте/)

        // Заказ не выдан: он остаётся в доставке и ждёт решения продавца.
        const detail = await lifecycle(order.id)
        expect(detail.status).toEqual("in_delivery")

        // Рейс с закрытой (пусть и проваленной) точкой завершается.
        await setTripStatus(session.token, trip.id, "en_route")
        const completed = await setTripStatus(
          session.token,
          trip.id,
          "completed"
        )
        expect(completed.status).toEqual(200)
      })

      it("не даёт вести точку чужого рейса своим токеном", async () => {
        const mine = await driverWithTrip("Хозяин Рейса")
        const other = await activeDriver("Захожий Водителев")

        const res = await setStopStatus(other.token, mine.trip.id, mine.stop.id, {
          status: "arrived",
        })
        expect(res.status).toEqual(404)
        expect(res.data.reason).toEqual("trip_not_found")
      })
    })

    describe("POST /driver/trips/:id/gps — пинги", () => {
      it("принимает пинг по своему рейсу и отдаёт позицию диспетчеру", async () => {
        const { session, trip } = await driverWithTrip("Пингующий Водителев")

        const res = await ping(session.token, trip.id, {
          lat: 51.128,
          lng: 71.43,
        })
        expect(res.status).toEqual(201)
        expect(res.data.ping.recorded_at).toBeTruthy()

        const position = await call(
          api.get(`/admin/logistics/trips/${trip.id}/gps`, {
            headers: adminHeaders,
          })
        )
        expect(position.status).toEqual(200)
        expect(position.data.position).toMatchObject({
          lat: 51.128,
          lng: 71.43,
          driver_id: session.driver.id,
        })
      })

      it("не принимает пинг по чужому рейсу", async () => {
        const mine = await driverWithTrip("Свой Пингер")
        const other = await activeDriver("Чужой Пингер")

        const res = await ping(other.token, mine.trip.id, {
          lat: 51.1,
          lng: 71.4,
        })
        expect(res.status).toEqual(404)
      })
    })
  },
})
