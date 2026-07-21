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
import { confirmOrderWorkflow } from "../../src/workflows/confirm-order"
import { startOrderAssemblyWorkflow } from "../../src/workflows/start-order-assembly"
import { completeOrderAssemblyWorkflow } from "../../src/workflows/complete-order-assembly"
import { shipOrderWorkflow } from "../../src/workflows/ship-order"
import { deliverOrderWorkflow } from "../../src/workflows/deliver-order"
import { ORDER_LIFECYCLE_MODULE } from "../../src/modules/order-lifecycle"
import OrderLifecycleModuleService from "../../src/modules/order-lifecycle/service"

jest.setTimeout(180000)

// HTTP-роуты отзывов/диспутов (подзадача 2a, store): покупатель оставляет отзыв
// (гейт — свой доставленный заказ; delivery-отзыв только для delivery) и
// открывает диспут; читает свои. Заказ проводится до delivered через lifecycle-
// workflows. Требует docker-postgres.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let storeHeaders: Record<string, string>
    let adminHeaders: Record<string, string>

    let regionId: string
    let salesChannelId: string
    let shippingOptionId: string
    let variantId: string
    let locationId: string
    let seq = 0

    const query = () => container.resolve(ContainerRegistrationKeys.QUERY)
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

    const createCustomer = async () => {
      seq += 1
      const email = `rev-buyer-${seq}@example.com`
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
        headers: { authorization: `Bearer ${login.token}`, ...storeHeaders },
      }
    }

    beforeAll(async () => {
      container = getContainer()
      const fulfillment = container.resolve(Modules.FULFILLMENT)
      const link = container.resolve(ContainerRegistrationKeys.LINK)

      const { result: regions } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Rev Region",
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
      ).run({ input: { salesChannelsData: [{ name: "Rev Channel" }] } })
      salesChannelId = channels[0].id
      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "Rev Warehouse",
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
        name: "Rev Delivery",
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
            type: { label: "Standard", description: "Standard", code: "standard" },
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
              title: "Rev Cement",
              status: ProductStatus.PUBLISHED,
              sales_channels: [{ id: salesChannelId }],
              options: [{ title: "Size", values: ["25kg"] }],
              variants: [
                {
                  title: "25kg",
                  sku: "REV-CEM-25",
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

      const apiKeyService = container.resolve(Modules.API_KEY)
      const [publishableKey] = await apiKeyService.createApiKeys([
        { title: "rev-test", type: "publishable", created_by: "test" },
      ])
      await link.create({
        [Modules.API_KEY]: { publishable_key_id: publishableKey.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
      })
      storeHeaders = { "x-publishable-api-key": publishableKey.token }

      // Admin-пользователь (первый user только через контейнер), логин по HTTP.
      const adminEmail = "admin@example.com"
      const adminPassword = "supersecret"
      const authService = container.resolve(Modules.AUTH)
      const { authIdentity } = await authService.register("emailpass", {
        body: { email: adminEmail, password: adminPassword },
      })
      const user = await container
        .resolve(Modules.USER)
        .createUsers({ email: adminEmail })
      await authService.updateAuthIdentities({
        id: authIdentity!.id,
        app_metadata: { user_id: user.id },
      })
      const { data: adminLogin } = await api.post("/auth/user/emailpass", {
        email: adminEmail,
        password: adminPassword,
      })
      adminHeaders = { authorization: `Bearer ${adminLogin.token}` }
    })

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
      const orderService = container.resolve(Modules.ORDER)
      const order = await orderService.retrieveOrder(orderId, {
        relations: ["items"],
      })
      return (order.items ?? []).map((i) => ({
        id: i.id,
        quantity: Number(i.quantity),
      }))
    }
    const fulfillmentId = async (orderId: string) => {
      const { data: orders } = await query().graph({
        entity: "order",
        fields: ["id", "fulfillments.id"],
        filters: { id: orderId },
      })
      return (orders[0] as { fulfillments: { id: string }[] }).fulfillments[0]
        .id
    }
    const deliveryCode = async (orderId: string) => {
      const { data: orders } = await query().graph({
        entity: "order",
        fields: ["id", "order_lifecycle.delivery_code"],
        filters: { id: orderId },
      })
      return (
        orders[0] as { order_lifecycle?: { delivery_code: string | null } }
      ).order_lifecycle?.delivery_code as string
    }

    // Оформляет заказ покупателем через HTTP и проводит его до delivered.
    const placeDelivered = async (
      buyer: { customerId: string; email: string; headers: Record<string, string> },
      method: "delivery" | "pickup"
    ) => {
      const cartId = await prepareCart(buyer.customerId, buyer.email)
      const { data: placed } = await api.post(
        "/store/orders",
        { cart_id: cartId, delivery_method: method },
        { headers: buyer.headers }
      )
      const orderId = placed.order.id as string

      await confirmOrderWorkflow(container).run({
        input: { order_id: orderId, actor_type: "seller" },
      })
      await startOrderAssemblyWorkflow(container).run({
        input: { order_id: orderId, actor_type: "seller" },
      })
      const items = await orderItems(orderId)
      await completeOrderAssemblyWorkflow(container).run({
        input: { order_id: orderId, items, actor_type: "seller" },
      })
      const fid = await fulfillmentId(orderId)
      if (method === "delivery") {
        await shipOrderWorkflow(container).run({
          input: {
            order_id: orderId,
            fulfillment_id: fid,
            items,
            actor_type: "seller",
          },
        })
        const code = await deliveryCode(orderId)
        await deliverOrderWorkflow(container).run({
          input: {
            order_id: orderId,
            fulfillment_id: fid,
            delivery_code: code,
            actor_type: "system",
          },
        })
      } else {
        // pickup: выдача у окна без отгрузки и без кода.
        await deliverOrderWorkflow(container).run({
          input: { order_id: orderId, fulfillment_id: fid, actor_type: "seller" },
        })
      }
      // Подтверждаем, что заказ доставлен.
      const service =
        container.resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
      const { data: rows } = await query().graph({
        entity: "order",
        fields: ["id", "order_lifecycle.id"],
        filters: { id: orderId },
      })
      const lcId = (rows[0] as { order_lifecycle: { id: string } })
        .order_lifecycle.id
      const lc = await service.retrieveOrderLifecycle(lcId)
      expect(lc.status).toEqual("delivered")
      return orderId
    }

    describe("POST /store/orders/:id/reviews", () => {
      it("rejects a review on an order that is not yet delivered (400)", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: buyer.headers }
        )
        const res = await call(
          api.post(
            `/store/orders/${placed.order.id}/reviews`,
            { target: "supplier", rating: 5 },
            { headers: buyer.headers }
          )
        )
        expect(res.status).toEqual(400)
      })

      it("accepts supplier + delivery reviews on a delivered delivery order, blocks duplicates", async () => {
        const buyer = await createCustomer()
        const orderId = await placeDelivered(buyer, "delivery")

        const supplier = await call(
          api.post(
            `/store/orders/${orderId}/reviews`,
            { target: "supplier", rating: 5, comment: "Отличный цемент" },
            { headers: buyer.headers }
          )
        )
        expect(supplier.status).toEqual(201)
        expect(supplier.data.review.target).toEqual("supplier")

        const delivery = await call(
          api.post(
            `/store/orders/${orderId}/reviews`,
            { target: "delivery", rating: 4 },
            { headers: buyer.headers }
          )
        )
        expect(delivery.status).toEqual(201)

        // Повтор того же объекта — 400.
        const dup = await call(
          api.post(
            `/store/orders/${orderId}/reviews`,
            { target: "supplier", rating: 1 },
            { headers: buyer.headers }
          )
        )
        expect(dup.status).toEqual(400)

        // Оба отзыва читаются покупателем.
        const list = await call(
          api.get(`/store/orders/${orderId}/reviews`, {
            headers: buyer.headers,
          })
        )
        expect(list.data.reviews).toHaveLength(2)
      })

      it("rejects a delivery review for a pickup order (400)", async () => {
        const buyer = await createCustomer()
        const orderId = await placeDelivered(buyer, "pickup")
        // Отзыв о поставщике для самовывоза — можно.
        const supplier = await call(
          api.post(
            `/store/orders/${orderId}/reviews`,
            { target: "supplier", rating: 5 },
            { headers: buyer.headers }
          )
        )
        expect(supplier.status).toEqual(201)
        // Отзыв о доставке для самовывоза — нечего оценивать, 400.
        const delivery = await call(
          api.post(
            `/store/orders/${orderId}/reviews`,
            { target: "delivery", rating: 5 },
            { headers: buyer.headers }
          )
        )
        expect(delivery.status).toEqual(400)
      })

      it("hides another buyer's order from reviewing (404)", async () => {
        const owner = await createCustomer()
        const orderId = await placeDelivered(owner, "delivery")
        const stranger = await createCustomer()
        const res = await call(
          api.post(
            `/store/orders/${orderId}/reviews`,
            { target: "supplier", rating: 5 },
            { headers: stranger.headers }
          )
        )
        expect(res.status).toEqual(404)
      })
    })

    describe("POST /store/orders/:id/disputes", () => {
      it("opens a dispute and blocks a second active one; lists own disputes", async () => {
        const buyer = await createCustomer()
        // Диспут можно открыть на любой свой заказ (в т.ч. до доставки).
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: buyer.headers }
        )
        const orderId = placed.order.id as string

        const opened = await call(
          api.post(
            `/store/orders/${orderId}/disputes`,
            { category: "not_delivered", description: "Заказ не приехал" },
            { headers: buyer.headers }
          )
        )
        expect(opened.status).toEqual(201)
        expect(opened.data.dispute.status).toEqual("open")

        const second = await call(
          api.post(
            `/store/orders/${orderId}/disputes`,
            { category: "other", description: "ещё" },
            { headers: buyer.headers }
          )
        )
        expect(second.status).toEqual(400)

        const list = await call(
          api.get(`/store/orders/${orderId}/disputes`, {
            headers: buyer.headers,
          })
        )
        expect(list.data.disputes).toHaveLength(1)
      })

      it("hides another buyer's order from disputing (404)", async () => {
        const owner = await createCustomer()
        const cartId = await prepareCart(owner.customerId, owner.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: owner.headers }
        )
        const stranger = await createCustomer()
        const res = await call(
          api.post(
            `/store/orders/${placed.order.id}/disputes`,
            { category: "other", description: "чужой" },
            { headers: stranger.headers }
          )
        )
        expect(res.status).toEqual(404)
      })
    })

    describe("admin reviews (list, moderate, summary)", () => {
      it("lists order reviews, moderates visibility, and reflects it in the summary", async () => {
        const buyer = await createCustomer()
        const orderId = await placeDelivered(buyer, "delivery")
        const { data: created } = await api.post(
          `/store/orders/${orderId}/reviews`,
          { target: "supplier", rating: 5 },
          { headers: buyer.headers }
        )
        const reviewId = created.review.id

        const list = await call(
          api.get(`/admin/orders/${orderId}/reviews`, {
            headers: adminHeaders,
          })
        )
        expect(list.status).toEqual(200)
        expect(list.data.reviews.some((r: { id: string }) => r.id === reviewId)).toBe(true)

        // Сводка учитывает опубликованный отзыв.
        const before = await call(
          api.get("/admin/reviews/summary", { headers: adminHeaders })
        )
        const supplierBefore = before.data.summaries.find(
          (s: { target: string }) => s.target === "supplier"
        )
        expect(supplierBefore.count).toBeGreaterThanOrEqual(1)

        // Скрываем отзыв — из сводки исчезает.
        const hidden = await call(
          api.post(
            `/admin/reviews/${reviewId}/moderate`,
            { status: "hidden" },
            { headers: adminHeaders }
          )
        )
        expect(hidden.status).toEqual(200)
        expect(hidden.data.review.status).toEqual("hidden")

        const after = await call(
          api.get("/admin/reviews/summary", { headers: adminHeaders })
        )
        const supplierAfter = after.data.summaries.find(
          (s: { target: string }) => s.target === "supplier"
        )
        expect(supplierAfter.count).toEqual(supplierBefore.count - 1)
      })
    })

    describe("admin disputes (queue + transition)", () => {
      it("shows the dispute in the queue and walks its state machine", async () => {
        const buyer = await createCustomer()
        const cartId = await prepareCart(buyer.customerId, buyer.email)
        const { data: placed } = await api.post(
          "/store/orders",
          { cart_id: cartId },
          { headers: buyer.headers }
        )
        const orderId = placed.order.id as string
        const { data: opened } = await api.post(
          `/store/orders/${orderId}/disputes`,
          { category: "damaged", description: "Повреждён" },
          { headers: buyer.headers }
        )
        const disputeId = opened.dispute.id

        // Очередь (дефолт — активные) содержит открытый диспут.
        const queue = await call(
          api.get("/admin/disputes", { headers: adminHeaders })
        )
        expect(queue.status).toEqual(200)
        expect(
          queue.data.disputes.some((d: { id: string }) => d.id === disputeId)
        ).toBe(true)

        const inReview = await call(
          api.post(
            `/admin/disputes/${disputeId}/transition`,
            { to: "in_review" },
            { headers: adminHeaders }
          )
        )
        expect(inReview.data.dispute.status).toEqual("in_review")

        const resolved = await call(
          api.post(
            `/admin/disputes/${disputeId}/transition`,
            { to: "resolved", resolution: "Компенсация выдана" },
            { headers: adminHeaders }
          )
        )
        expect(resolved.data.dispute.status).toEqual("resolved")
        expect(resolved.data.dispute.resolution).toContain("Компенсация")

        // Переход из терминального resolved запрещён — 400.
        const illegal = await call(
          api.post(
            `/admin/disputes/${disputeId}/transition`,
            { to: "in_review" },
            { headers: adminHeaders }
          )
        )
        expect(illegal.status).toEqual(400)
      })
    })
  },
})
