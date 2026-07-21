import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  createSalesChannelsWorkflow,
  createStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows"
import { CATALOG_MODULE } from "../../src/modules/catalog"
import CatalogModuleService from "../../src/modules/catalog/service"
import { ESTIMATOR_MODULE } from "../../src/modules/estimator"
import EstimatorModuleService from "../../src/modules/estimator/service"

jest.setTimeout(180000)

// HTTP-роуты estimator (подзадача 2a): расчёт материалов по ручным параметрам +
// подборка товаров по сегментам из категории норматива. Фикстура строит
// категорию, два published-товара (economy/comfort) с ценами kzt и остатком,
// норматив с category_id. Требует docker-postgres.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let storeHeaders: Record<string, string>

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

    beforeAll(async () => {
      container = getContainer()
      const link = container.resolve(ContainerRegistrationKeys.LINK)
      const productService = container.resolve(Modules.PRODUCT)
      const catalog =
        container.resolve<CatalogModuleService>(CATALOG_MODULE)
      const estimator =
        container.resolve<EstimatorModuleService>(ESTIMATOR_MODULE)

      // Канал + склад (для остатков) + publishable key.
      const { result: channels } = await createSalesChannelsWorkflow(
        container
      ).run({ input: { salesChannelsData: [{ name: "Est Channel" }] } })
      const salesChannelId = channels[0].id
      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            { name: "Est WH", address: { city: "Astana", country_code: "kz", address_1: "1" } },
          ],
        },
      })
      const locationId = locations[0].id

      // Категория каталога.
      const [category] = await productService.createProductCategories([
        { name: "Цемент и смеси" },
      ])

      // Два товара категории: economy и comfort, цены в kzt, склад.
      const { result: products } = await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: "Цемент эконом",
              status: ProductStatus.PUBLISHED,
              category_ids: [category.id],
              sales_channels: [{ id: salesChannelId }],
              options: [{ title: "Fmt", values: ["bag"] }],
              variants: [
                {
                  title: "bag",
                  sku: "EST-CEM-ECO",
                  manage_inventory: true,
                  options: { Fmt: "bag" },
                  prices: [{ amount: 1500, currency_code: "kzt" }],
                },
              ],
            },
            {
              title: "Цемент комфорт",
              status: ProductStatus.PUBLISHED,
              category_ids: [category.id],
              sales_channels: [{ id: salesChannelId }],
              options: [{ title: "Fmt", values: ["bag"] }],
              variants: [
                {
                  title: "bag",
                  sku: "EST-CEM-COM",
                  manage_inventory: true,
                  options: { Fmt: "bag" },
                  prices: [{ amount: 2200, currency_code: "kzt" }],
                },
              ],
            },
          ],
        },
      })

      // Карточки каталога с сегментами + link к товарам.
      const segments: ("economy" | "comfort")[] = ["economy", "comfort"]
      for (let i = 0; i < products.length; i++) {
        const card = await catalog.createProductCards({
          segment: segments[i],
          unit: "bag",
        })
        await link.create({
          [Modules.PRODUCT]: { product_id: products[i].id },
          [CATALOG_MODULE]: { product_card_id: card.id },
        })
      }

      // Остатки по обоим товарам.
      for (const product of products) {
        const { data: withInv } = await query().graph({
          entity: "product",
          fields: ["variants.inventory_items.inventory.id"],
          filters: { id: product.id },
        })
        const invId = withInv[0]?.variants?.[0]?.inventory_items?.[0]?.inventory
          ?.id as string
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: [
              {
                inventory_item_id: invId,
                location_id: locationId,
                stocked_quantity: 500,
              },
            ],
          },
        })
      }

      // Норматив с категорией: цемент, база area, расход 10 кг/м².
      await estimator.createMaterialNorms([
        {
          code: "EST-CEM",
          name: "Цемент на стяжку",
          work_type: "screed",
          material_kind: "cement",
          base: "area",
          consumption_per_unit: 10,
          unit: "kg",
          category_id: category.id,
        },
      ])

      const apiKeyService = container.resolve(Modules.API_KEY)
      const [pk] = await apiKeyService.createApiKeys([
        { title: "est", type: "publishable", created_by: "test" },
      ])
      await link.create({
        [Modules.API_KEY]: { publishable_key_id: pk.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
      })
      storeHeaders = { "x-publishable-api-key": pk.token }
    })

    it("creates a manual estimate with computed quantities", async () => {
      const res = await call(
        api.post(
          "/store/estimates",
          { params: { area: 100 }, norm_codes: ["EST-CEM"] },
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(201)
      expect(res.data.estimate.status).toEqual("calculated")
      expect(res.data.estimate.lines).toHaveLength(1)
      // 10 кг/м² × 100 м² = 1000.
      expect(res.data.estimate.lines[0].quantity).toEqual(1000)
      expect(res.data.estimate.lines[0].material_kind).toEqual("cement")
    })

    it("returns per-segment suggestions with prices, totals and stock", async () => {
      const { data: created } = await api.post(
        "/store/estimates",
        { params: { area: 100 }, norm_codes: ["EST-CEM"] },
        { headers: storeHeaders }
      )
      const estimateId = created.estimate.id

      const res = await call(
        api.get(
          `/store/estimates/${estimateId}/suggestions?currency_code=kzt`,
          { headers: storeHeaders }
        )
      )
      expect(res.status).toEqual(200)
      expect(res.data.suggestions).toHaveLength(1)
      const options = res.data.suggestions[0].options
      const bySegment = Object.fromEntries(
        options.map((o: { segment: string }) => [o.segment, o])
      )
      // Эконом: цена 1500, итог 1000×1500, в наличии.
      expect(bySegment.economy.unit_price).toEqual(1500)
      expect(bySegment.economy.total).toEqual(1_500_000)
      expect(bySegment.economy.in_stock).toBe(true)
      // Комфорт: цена 2200.
      expect(bySegment.comfort.unit_price).toEqual(2200)
      expect(bySegment.comfort.total).toEqual(2_200_000)
    })

    it("returns 404 for an unknown estimate", async () => {
      const res = await call(
        api.get("/store/estimates/est_missing/suggestions", {
          headers: storeHeaders,
        })
      )
      expect(res.status).toEqual(404)
    })
  },
})
