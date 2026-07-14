import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules, ProductStatus } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { createProductCardWorkflow } from "../../src/workflows/create-product-card"
import { ProductSegment } from "../../src/modules/catalog/models/product-card"

jest.setTimeout(120000)

// Интеграционные тесты HTTP-роутов каталога: фильтр витрины по сегменту,
// остатки в разрезе город/склад, подбор альтернатив, admin-модерация карточек.
// Нужен docker-postgres; временная БД — см. backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let storeHeaders: Record<string, string>
    let adminHeaders: Record<string, string>
    let salesChannelId: string
    let seq = 0

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

    // Товар ядра с вариантом + карточка каталога + привязка к sales channel
    // (иначе ядровый /store/products его не отдаст).
    const createCatalogProduct = async (
      overrides: {
        title?: string
        status?: ProductStatus
        segment?: ProductSegment
        withCard?: boolean
        categoryIds?: string[]
        certificates?: { name: string; url: string }[]
      } = {}
    ) => {
      seq += 1
      const {
        title = `Cement M400 #${seq}`,
        status = ProductStatus.PUBLISHED,
        segment = "economy",
        withCard = true,
        categoryIds = [],
        certificates = [{ name: "ГОСТ 31108-2020", url: "/files/cert.pdf" }],
      } = overrides

      const productService = container.resolve(Modules.PRODUCT)
      const product = await productService.createProducts({
        title,
        status,
        category_ids: categoryIds,
        options: [{ title: "Packing", values: ["25kg"] }],
        variants: [
          { title: "25kg", sku: `SKU-${seq}`, options: { Packing: "25kg" } },
        ],
      })

      if (withCard) {
        await createProductCardWorkflow(container).run({
          input: {
            product_id: product.id,
            segment,
            unit: "мешок 25 кг",
            certificates,
          },
        })
      }

      const link = container.resolve("link")
      await link.create([
        {
          [Modules.PRODUCT]: { product_id: product.id },
          [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
        },
      ])

      return product
    }

    const createCategory = async (name: string) => {
      const productService = container.resolve(Modules.PRODUCT)
      return await productService.createProductCategories({
        name: `${name} #${++seq}`,
        is_active: true,
      })
    }

    beforeAll(async () => {
      container = getContainer()

      // Publishable key + sales channel: ключ обязан быть привязан к каналу,
      // товары — состоять в нём, иначе ядровый /store/products вернёт ошибку/пусто.
      const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
      const salesChannel = await salesChannelService.createSalesChannels({
        name: "Test channel",
      })
      salesChannelId = salesChannel.id

      const apiKeyService = container.resolve(Modules.API_KEY)
      const [publishableKey] = await apiKeyService.createApiKeys([
        { title: "test", type: "publishable", created_by: "test" },
      ])
      const link = container.resolve("link")
      await link.create([
        {
          [Modules.API_KEY]: { publishable_key_id: publishableKey.id },
          [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
        },
      ])
      storeHeaders = { "x-publishable-api-key": publishableKey.token }

      // Admin-пользователь: HTTP-флоу закрыт (первый user создаётся только
      // через CLI/invite) — auth identity + user через контейнер, логин по HTTP.
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

    describe("GET /store/products?segment=", () => {
      it("returns only published products of the requested segment", async () => {
        const economy = await createCatalogProduct({ segment: "economy" })
        const business = await createCatalogProduct({ segment: "business" })

        const res = await call(
          api.get("/store/products?segment=economy", {
            headers: storeHeaders,
          })
        )

        expect(res.status).toEqual(200)
        const ids = res.data.products.map((p: { id: string }) => p.id)
        expect(ids).toContain(economy.id)
        expect(ids).not.toContain(business.id)
      })

      it("combines segment with core filters and pagination", async () => {
        const target = await createCatalogProduct({ segment: "business" })
        await createCatalogProduct({ segment: "business" })

        const res = await call(
          api.get(`/store/products?segment=business&id[]=${target.id}`, {
            headers: storeHeaders,
          })
        )

        expect(res.status).toEqual(200)
        expect(res.data.products).toHaveLength(1)
        expect(res.data.products[0].id).toEqual(target.id)
      })

      it("returns an empty page when nothing matches the segment", async () => {
        // comfort нигде в тестах не публикуется.
        const res = await call(
          api.get("/store/products?segment=comfort", { headers: storeHeaders })
        )

        expect(res.status).toEqual(200)
        expect(res.data.products).toEqual([])
        expect(res.data.count).toEqual(0)
      })

      it("rejects an unknown segment value", async () => {
        const res = await call(
          api.get("/store/products?segment=luxury", { headers: storeHeaders })
        )

        expect(res.status).toEqual(400)
        expect(res.data.message).toContain("Invalid segment")
      })
    })

    describe("GET /store/products/:id/availability", () => {
      it("groups availability by city and warehouse, net of reservations", async () => {
        const product = await createCatalogProduct()

        // Два склада в Астане + один в Караганде.
        const stockLocationService = container.resolve(Modules.STOCK_LOCATION)
        const [astana1, astana2, karaganda] =
          await stockLocationService.createStockLocations([
            {
              name: "Astana WH-1",
              address: { city: "Astana", country_code: "KZ", address_1: "-" },
            },
            {
              name: "Astana WH-2",
              address: { city: "Astana", country_code: "KZ", address_1: "-" },
            },
            {
              name: "Karaganda WH-1",
              address: {
                city: "Karaganda",
                country_code: "KZ",
                address_1: "-",
              },
            },
          ])

        // Inventory item варианта + уровни остатков + резерв 10 на WH-1.
        const inventoryService = container.resolve(Modules.INVENTORY)
        const [inventoryItem] = await inventoryService.createInventoryItems([
          { sku: `INV-${product.id}` },
        ])
        const productService = container.resolve(Modules.PRODUCT)
        const [variant] = await productService.listProductVariants({
          product_id: product.id,
        })
        const link = container.resolve("link")
        await link.create([
          {
            [Modules.PRODUCT]: { variant_id: variant.id },
            [Modules.INVENTORY]: { inventory_item_id: inventoryItem.id },
          },
        ])
        await inventoryService.createInventoryLevels([
          {
            inventory_item_id: inventoryItem.id,
            location_id: astana1.id,
            stocked_quantity: 60,
          },
          {
            inventory_item_id: inventoryItem.id,
            location_id: astana2.id,
            stocked_quantity: 40,
          },
          {
            inventory_item_id: inventoryItem.id,
            location_id: karaganda.id,
            stocked_quantity: 30,
          },
        ])
        await inventoryService.createReservationItems([
          {
            inventory_item_id: inventoryItem.id,
            location_id: astana1.id,
            quantity: 10,
          },
        ])

        const res = await call(
          api.get(`/store/products/${product.id}/availability`, {
            headers: storeHeaders,
          })
        )

        expect(res.status).toEqual(200)
        expect(res.data.product_id).toEqual(product.id)
        expect(res.data.variants).toHaveLength(1)

        const cities = res.data.variants[0].cities
        const astana = cities.find(
          (c: { city: string | null }) => c.city === "Astana"
        )
        const karagandaCity = cities.find(
          (c: { city: string | null }) => c.city === "Karaganda"
        )

        expect(astana.available).toEqual(90) // 60 - 10 + 40
        expect(astana.stock_locations).toHaveLength(2)
        expect(
          astana.stock_locations.find(
            (l: { id: string }) => l.id === astana1.id
          ).available
        ).toEqual(50)
        expect(karagandaCity.available).toEqual(30)
        expect(karagandaCity.stock_locations).toHaveLength(1)
      })

      it("hides non-published products", async () => {
        const draft = await createCatalogProduct({
          status: ProductStatus.DRAFT,
        })

        const res = await call(
          api.get(`/store/products/${draft.id}/availability`, {
            headers: storeHeaders,
          })
        )

        expect(res.status).toEqual(404)
      })
    })

    describe("GET /store/products/:id/alternatives", () => {
      it("returns published products of the same category and segment", async () => {
        const category = await createCategory("Cement")
        const otherCategory = await createCategory("Bricks")

        const target = await createCatalogProduct({
          segment: "economy",
          categoryIds: [category.id],
        })
        const match = await createCatalogProduct({
          segment: "economy",
          categoryIds: [category.id],
        })
        const otherSegment = await createCatalogProduct({
          segment: "business",
          categoryIds: [category.id],
        })
        const otherCat = await createCatalogProduct({
          segment: "economy",
          categoryIds: [otherCategory.id],
        })
        const draft = await createCatalogProduct({
          segment: "economy",
          categoryIds: [category.id],
          status: ProductStatus.DRAFT,
        })

        const res = await call(
          api.get(`/store/products/${target.id}/alternatives`, {
            headers: storeHeaders,
          })
        )

        expect(res.status).toEqual(200)
        const ids = res.data.alternatives.map((p: { id: string }) => p.id)
        expect(ids).toContain(match.id)
        expect(ids).not.toContain(target.id)
        expect(ids).not.toContain(otherSegment.id)
        expect(ids).not.toContain(otherCat.id)
        expect(ids).not.toContain(draft.id)
        expect(res.data.alternatives[0].product_card.segment).toEqual(
          "economy"
        )
      })

      it("respects the limit parameter", async () => {
        const category = await createCategory("Concrete")
        const target = await createCatalogProduct({
          segment: "business",
          categoryIds: [category.id],
        })
        await createCatalogProduct({
          segment: "business",
          categoryIds: [category.id],
        })
        await createCatalogProduct({
          segment: "business",
          categoryIds: [category.id],
        })

        const res = await call(
          api.get(`/store/products/${target.id}/alternatives?limit=1`, {
            headers: storeHeaders,
          })
        )

        expect(res.status).toEqual(200)
        expect(res.data.alternatives).toHaveLength(1)
      })

      it("returns 404 for an unknown product", async () => {
        const res = await call(
          api.get("/store/products/prod_does_not_exist/alternatives", {
            headers: storeHeaders,
          })
        )

        expect(res.status).toEqual(404)
      })
    })

    describe("admin moderation routes", () => {
      const submitProduct = async (productId: string) =>
        await call(
          api.post(
            `/admin/products/${productId}/moderation/submit`,
            {},
            { headers: adminHeaders }
          )
        )

      it("submits a draft product with a card to moderation", async () => {
        const product = await createCatalogProduct({
          status: ProductStatus.DRAFT,
        })

        const res = await submitProduct(product.id)

        expect(res.status).toEqual(200)
        expect(res.data.product.status).toEqual("proposed")
      })

      it("exposes the moderation queue via the core products route with card fields", async () => {
        const product = await createCatalogProduct({
          status: ProductStatus.DRAFT,
          title: `Queue marker cement #${++seq}`,
          segment: "business",
        })
        await submitProduct(product.id)

        const res = await call(
          api.get(
            "/admin/products?status[]=proposed&order=updated_at&q=queue+marker&fields=id,title,status,*product_card",
            { headers: adminHeaders }
          )
        )

        expect(res.status).toEqual(200)
        const found = res.data.products.find(
          (p: { id: string }) => p.id === product.id
        )
        expect(found).toBeDefined()
        expect(found.product_card.segment).toEqual("business")
      })

      it("approves a proposed product", async () => {
        const product = await createCatalogProduct({
          status: ProductStatus.DRAFT,
        })
        await submitProduct(product.id)

        const res = await call(
          api.post(
            `/admin/products/${product.id}/moderation/approve`,
            {},
            { headers: adminHeaders }
          )
        )

        expect(res.status).toEqual(200)
        expect(res.data.product.status).toEqual("published")
      })

      it("rejects a proposed product with a mandatory reason", async () => {
        const product = await createCatalogProduct({
          status: ProductStatus.DRAFT,
        })
        await submitProduct(product.id)

        const noReason = await call(
          api.post(
            `/admin/products/${product.id}/moderation/reject`,
            {},
            { headers: adminHeaders }
          )
        )
        expect(noReason.status).toEqual(400)

        const res = await call(
          api.post(
            `/admin/products/${product.id}/moderation/reject`,
            { reason: "certificates are expired" },
            { headers: adminHeaders }
          )
        )

        expect(res.status).toEqual(200)
        expect(res.data.product.status).toEqual("rejected")

        // Комментарий отклонения виден через ядровый роут с полями карточки.
        const detail = await call(
          api.get(
            `/admin/products/${product.id}?fields=id,status,*product_card`,
            { headers: adminHeaders }
          )
        )
        expect(detail.data.product.product_card.rejection_reason).toEqual(
          "certificates are expired"
        )
      })

      it("refuses to approve a product that is not proposed", async () => {
        const product = await createCatalogProduct({
          status: ProductStatus.DRAFT,
        })

        const res = await call(
          api.post(
            `/admin/products/${product.id}/moderation/approve`,
            {},
            { headers: adminHeaders }
          )
        )

        expect(res.status).toEqual(400)
      })
    })

    describe("POST /admin/products/:id/product-card (upsert)", () => {
      const upsertCard = async (productId: string, body: object) =>
        await call(
          api.post(`/admin/products/${productId}/product-card`, body, {
            headers: adminHeaders,
          })
        )

      const getProductWithCard = async (productId: string) =>
        await call(
          api.get(
            `/admin/products/${productId}?fields=id,status,*product_card`,
            { headers: adminHeaders }
          )
        )

      it("creates a card for a product without one", async () => {
        const product = await createCatalogProduct({
          status: ProductStatus.DRAFT,
          withCard: false,
        })

        const res = await upsertCard(product.id, {
          segment: "comfort",
          unit: "тонна",
          certificates: [{ name: "ГОСТ", url: "/files/gost.pdf" }],
        })

        expect(res.status).toEqual(200)
        expect(res.data.product_card.segment).toEqual("comfort")

        const detail = await getProductWithCard(product.id)
        expect(detail.data.product.product_card.unit).toEqual("тонна")
      })

      it("updates the existing card of a draft product without touching its status", async () => {
        const product = await createCatalogProduct({
          status: ProductStatus.DRAFT,
          segment: "economy",
        })

        const res = await upsertCard(product.id, {
          segment: "business",
          unit: "м³",
        })

        expect(res.status).toEqual(200)
        expect(res.data.product_card.segment).toEqual("business")

        const detail = await getProductWithCard(product.id)
        expect(detail.data.product.status).toEqual("draft")
        expect(detail.data.product.product_card.segment).toEqual("business")
        // Сертификаты не передавались — прежние сохраняются.
        expect(detail.data.product.product_card.certificates).toHaveLength(1)
      })

      it("returns a published product to moderation when its card is edited", async () => {
        const product = await createCatalogProduct({
          status: ProductStatus.PUBLISHED,
          segment: "economy",
        })

        const res = await upsertCard(product.id, {
          segment: "economy",
          unit: "мешок 50 кг",
        })

        expect(res.status).toEqual(200)

        const detail = await getProductWithCard(product.id)
        expect(detail.data.product.status).toEqual("proposed")
        expect(detail.data.product.product_card.unit).toEqual("мешок 50 кг")
      })

      it("rejects an invalid payload", async () => {
        const product = await createCatalogProduct({
          status: ProductStatus.DRAFT,
          withCard: false,
        })

        const badSegment = await upsertCard(product.id, {
          segment: "luxury",
          unit: "шт",
        })
        expect(badSegment.status).toEqual(400)

        const noUnit = await upsertCard(product.id, { segment: "economy" })
        expect(noUnit.status).toEqual(400)
      })

      it("returns 404 for an unknown product", async () => {
        const res = await upsertCard("prod_does_not_exist", {
          segment: "economy",
          unit: "шт",
        })

        expect(res.status).toEqual(404)
      })
    })
  },
})
