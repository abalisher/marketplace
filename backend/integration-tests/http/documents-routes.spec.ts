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
import { issueOrderDocumentWorkflow } from "../../src/workflows/issue-order-document"

jest.setTimeout(180000)

// HTTP-роуты документов заказа (подзадача 3): покупатель — свои документы в ЛК
// (список + file_url для скачивания, чужой заказ 404); админ — все документы по
// заказу + экспорт исходных данных для 1С. Выпуск документа делаем детерминированно
// через workflow (счёт также выпускается подписчиком на order.placed асинхронно —
// на списки не влияет). Требует docker-postgres; временная БД — backend/.env.test.
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
      const email = `doc-buyer-${seq}@example.com`
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
              name: "Doc Region",
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
      ).run({ input: { salesChannelsData: [{ name: "Doc Channel" }] } })
      salesChannelId = channels[0].id

      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "Doc Warehouse",
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
        name: "Doc Delivery",
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
              title: "Doc Cement",
              status: ProductStatus.PUBLISHED,
              sales_channels: [{ id: salesChannelId }],
              options: [{ title: "Size", values: ["25kg"] }],
              variants: [
                {
                  title: "25kg",
                  sku: "DOCR-CEM-25",
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
        { title: "doc-test", type: "publishable", created_by: "test" },
      ])
      await link.create({
        [Modules.API_KEY]: { publishable_key_id: publishableKey.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
      })
      storeHeaders = { "x-publishable-api-key": publishableKey.token }

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

    // Оформляет заказ покупателем и детерминированно выпускает накладную.
    const placeOrderWithWaybill = async (buyer: {
      customerId: string
      email: string
      headers: Record<string, string>
    }) => {
      const cartId = await prepareCart(buyer.customerId, buyer.email)
      const { data: placed } = await api.post(
        "/store/orders",
        { cart_id: cartId },
        { headers: buyer.headers }
      )
      const orderId = placed.order.id as string
      await issueOrderDocumentWorkflow(container).run({
        input: { order_id: orderId, type: "waybill" },
      })
      return orderId
    }

    describe("GET /store/orders/:id/documents", () => {
      it("returns the buyer's own order documents with a downloadable file_url", async () => {
        const buyer = await createCustomer()
        const orderId = await placeOrderWithWaybill(buyer)

        const res = await call(
          api.get(`/store/orders/${orderId}/documents`, {
            headers: buyer.headers,
          })
        )

        expect(res.status).toEqual(200)
        expect(Array.isArray(res.data.documents)).toBe(true)
        const waybill = res.data.documents.find(
          (d: { type: string }) => d.type === "waybill"
        )
        expect(waybill).toBeDefined()
        expect(waybill.number).toMatch(/^WB-\d{4}-\d{6}$/)
        expect(waybill.file_url).toContain(".pdf")
        // Покупателю не отдаём внутренние поля.
        expect(waybill.file_id).toBeUndefined()
        expect(waybill.snapshot).toBeUndefined()
      })

      it("hides another buyer's documents (404)", async () => {
        const owner = await createCustomer()
        const orderId = await placeOrderWithWaybill(owner)

        const stranger = await createCustomer()
        const res = await call(
          api.get(`/store/orders/${orderId}/documents`, {
            headers: stranger.headers,
          })
        )
        expect(res.status).toEqual(404)
      })
    })

    describe("GET /admin/orders/:id/documents", () => {
      it("returns all documents of the order for an admin", async () => {
        const buyer = await createCustomer()
        const orderId = await placeOrderWithWaybill(buyer)

        const res = await call(
          api.get(`/admin/orders/${orderId}/documents`, {
            headers: adminHeaders,
          })
        )

        expect(res.status).toEqual(200)
        const waybill = res.data.documents.find(
          (d: { type: string }) => d.type === "waybill"
        )
        expect(waybill).toBeDefined()
        expect(waybill.is_latest).toBe(true)
        expect(waybill.file_id).toBeTruthy()
      })
    })

    describe("GET /admin/orders/:id/documents/export", () => {
      it("exports latest document snapshots for 1C", async () => {
        const buyer = await createCustomer()
        const orderId = await placeOrderWithWaybill(buyer)

        const res = await call(
          api.get(`/admin/orders/${orderId}/documents/export`, {
            headers: adminHeaders,
          })
        )

        expect(res.status).toEqual(200)
        expect(res.data.order_id).toEqual(orderId)
        const waybill = res.data.documents.find(
          (d: { type: string }) => d.type === "waybill"
        )
        expect(waybill).toBeDefined()
        // Снапшот содержит замороженные исходные данные (реквизиты + позиции).
        expect(waybill.snapshot).toBeDefined()
        expect(waybill.snapshot.seller).toBeDefined()
        expect(Array.isArray(waybill.snapshot.items)).toBe(true)
      })
    })

    describe("/admin/document-settings", () => {
      it("returns the singleton settings with defaults", async () => {
        const res = await call(
          api.get("/admin/document-settings", { headers: adminHeaders })
        )
        expect(res.status).toEqual(200)
        expect(res.data.document_settings.id).toMatch(/^docset_/)
        expect(res.data.document_settings.seller_name).toEqual("Marketplace")
      })

      it("applies a partial update and reflects it on next read", async () => {
        const update = await call(
          api.post(
            "/admin/document-settings",
            {
              seller_name: "ТОО Стройбаза",
              seller_bin: "123456789012",
              footer_note: "Не является официальным ЭСФ",
            },
            { headers: adminHeaders }
          )
        )
        expect(update.status).toEqual(200)
        expect(update.data.document_settings.seller_name).toEqual(
          "ТОО Стройбаза"
        )
        expect(update.data.document_settings.seller_bin).toEqual("123456789012")

        const read = await call(
          api.get("/admin/document-settings", { headers: adminHeaders })
        )
        expect(read.data.document_settings.footer_note).toEqual(
          "Не является официальным ЭСФ"
        )

        // Сброс необязательного поля в null.
        const cleared = await call(
          api.post(
            "/admin/document-settings",
            { seller_bin: null },
            { headers: adminHeaders }
          )
        )
        expect(cleared.data.document_settings.seller_bin).toBeNull()
        // Непереданное поле не затирается.
        expect(cleared.data.document_settings.seller_name).toEqual(
          "ТОО Стройбаза"
        )
      })

      it("rejects an invalid email (400)", async () => {
        const res = await call(
          api.post(
            "/admin/document-settings",
            { seller_email: "not-an-email" },
            { headers: adminHeaders }
          )
        )
        expect(res.status).toEqual(400)
      })
    })
  },
})
