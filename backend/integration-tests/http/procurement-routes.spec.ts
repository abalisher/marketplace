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
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"

jest.setTimeout(120000)

// HTTP-роуты admin API закупа (procurement подзадача 1b): поставщики (CRUD +
// мягкая деактивация), приходы (черновик/список/детали) и проводка через
// workflow post-receipt — увеличение остатка ЯДРА + порождение партий, с
// компенсацией. Продавец работает из admin (seller-first). Стейт-машина и FIFO
// самого модуля покрыты в src/modules/procurement/__tests__. Требует
// docker-postgres.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let adminHeaders: Record<string, string>
    let locationId: string
    let variantId: string

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

    // Текущий остаток варианта на складе (по location_levels ядра). Без
    // аргумента — на складе фикстуры; с аргументом — на любом другом (проверка
    // приёмки на склад, где у позиции ещё нет учёта).
    const stockedQuantityAt = async (locId: string): Promise<number> => {
      const { data } = await query().graph({
        entity: "variant",
        fields: [
          "id",
          "inventory_items.inventory.location_levels.location_id",
          "inventory_items.inventory.location_levels.stocked_quantity",
        ],
        filters: { id: variantId },
      })
      const levels =
        data[0]?.inventory_items?.[0]?.inventory?.location_levels ?? []
      const level = levels.find(
        (l): l is NonNullable<typeof l> => l?.location_id === locId
      )
      return Number(level?.stocked_quantity ?? 0)
    }

    const stockedQuantity = async (): Promise<number> => {
      const { data } = await query().graph({
        entity: "variant",
        fields: [
          "id",
          "inventory_items.inventory.location_levels.location_id",
          "inventory_items.inventory.location_levels.stocked_quantity",
        ],
        filters: { id: variantId },
      })
      const levels =
        data[0]?.inventory_items?.[0]?.inventory?.location_levels ?? []
      const level = levels.find(
        (l): l is NonNullable<typeof l> => l?.location_id === locationId
      )
      return Number(level?.stocked_quantity ?? 0)
    }

    beforeAll(async () => {
      container = getContainer()

      // Admin-пользователь + Bearer (идиома logistics-routes.spec).
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

      // Минимальная фикстура склад+товар+остаток (подмножество bonus-accrual.spec).
      const { result: channels } = await createSalesChannelsWorkflow(
        container
      ).run({ input: { salesChannelsData: [{ name: "Test Channel" }] } })
      const salesChannelId = channels[0].id

      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "Test Warehouse",
              address: { city: "Astana", country_code: "kz", address_1: "1" },
            },
          ],
        },
      })
      locationId = locations[0].id
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: { id: locationId, add: [salesChannelId] },
      })

      // Дефолтный shipping profile нужен createProductsWorkflow (создаём, если нет).
      const fulfillment = container.resolve(Modules.FULFILLMENT)
      const [existingProfile] = await fulfillment.listShippingProfiles(
        { type: "default" },
        { take: 1 }
      )
      if (!existingProfile) {
        await fulfillment.createShippingProfiles({
          name: "Default",
          type: "default",
        })
      }

      const { result: products } = await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: "Cement M400",
              status: ProductStatus.PUBLISHED,
              sales_channels: [{ id: salesChannelId }],
              options: [{ title: "Size", values: ["50kg"] }],
              variants: [
                {
                  title: "50kg",
                  sku: "CEM-400-50",
                  manage_inventory: true,
                  options: { Size: "50kg" },
                  prices: [{ amount: 5000, currency_code: "kzt" }],
                },
              ],
            },
          ],
        },
      })
      const product = products[0]

      const { data: withInventory } = await query().graph({
        entity: "product",
        fields: ["variants.id", "variants.inventory_items.inventory.id"],
        filters: { id: product.id },
      })
      variantId = withInventory[0]?.variants?.[0]?.id as string
      const inventoryItemId = withInventory[0]?.variants?.[0]
        ?.inventory_items?.[0]?.inventory?.id as string

      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: [
            {
              inventory_item_id: inventoryItemId,
              location_id: locationId,
              stocked_quantity: 0,
            },
          ],
        },
      })
    })

    it("creates, lists, and deactivates a supplier", async () => {
      const created = await call(
        api.post(
          "/admin/procurement/suppliers",
          { name: "СтройБаза", bin: "123456789012", contact_phone: "+7700" },
          { headers: adminHeaders }
        )
      )
      expect(created.status).toEqual(201)
      expect(created.data.supplier.name).toEqual("СтройБаза")
      expect(created.data.supplier.active).toBe(true)
      const supplierId = created.data.supplier.id

      const list = await call(
        api.get("/admin/procurement/suppliers", { headers: adminHeaders })
      )
      expect(list.status).toEqual(200)
      expect(
        list.data.suppliers.some((s: { id: string }) => s.id === supplierId)
      ).toBe(true)

      // Деактивация = мягкое «удаление».
      const deactivated = await call(
        api.post(
          `/admin/procurement/suppliers/${supplierId}`,
          { active: false },
          { headers: adminHeaders }
        )
      )
      expect(deactivated.status).toEqual(200)
      expect(deactivated.data.supplier.active).toBe(false)

      const activeOnly = await call(
        api.get("/admin/procurement/suppliers?active=true", {
          headers: adminHeaders,
        })
      )
      expect(
        activeOnly.data.suppliers.some((s: { id: string }) => s.id === supplierId)
      ).toBe(false)
    })

    it("creates a draft receipt with computed costs and reads it back", async () => {
      const created = await call(
        api.post(
          "/admin/procurement/receipts",
          {
            location_id: locationId,
            reference: "TTN-001",
            lines: [
              { variant_id: variantId, quantity: 30, unit: "bag", unit_cost: 200 },
            ],
          },
          { headers: adminHeaders }
        )
      )
      expect(created.status).toEqual(201)
      expect(created.data.receipt.status).toEqual("draft")
      // 30 × 200 = 6000 (минорные единицы).
      expect(created.data.receipt.total_cost).toEqual(6000)
      expect(created.data.receipt.lines).toHaveLength(1)
      expect(created.data.receipt.lines[0].line_cost).toEqual(6000)
      const receiptId = created.data.receipt.id

      const list = await call(
        api.get("/admin/procurement/receipts", { headers: adminHeaders })
      )
      expect(list.status).toEqual(200)
      expect(list.data.receipts[0].id).toEqual(receiptId)

      const detail = await call(
        api.get(`/admin/procurement/receipts/${receiptId}`, {
          headers: adminHeaders,
        })
      )
      expect(detail.status).toEqual(200)
      expect(detail.data.receipt.lines[0].variant_id).toEqual(variantId)
      expect(detail.data.receipt.batches).toHaveLength(0)
    })

    it("posts a receipt: increases core stock, creates a batch, blocks re-post", async () => {
      const before = await stockedQuantity()

      const { data: draft } = await call(
        api.post(
          "/admin/procurement/receipts",
          {
            location_id: locationId,
            lines: [
              {
                variant_id: variantId,
                quantity: 40,
                unit: "bag",
                unit_cost: 250,
              },
            ],
          },
          { headers: adminHeaders }
        )
      )
      const receiptId = draft.receipt.id

      const posted = await call(
        api.post(`/admin/procurement/receipts/${receiptId}/post`, undefined, {
          headers: adminHeaders,
        })
      )
      expect(posted.status).toEqual(200)
      expect(posted.data.receipt.status).toEqual("posted")
      expect(posted.data.receipt.batches).toHaveLength(1)
      expect(posted.data.receipt.batches[0].quantity_remaining).toEqual(40)

      // Остаток ядра вырос ровно на принятое количество.
      expect(await stockedQuantity()).toEqual(before + 40)

      // Повторная проводка запрещена стейт-машиной → 400 (остаток не двоится).
      const rePost = await call(
        api.post(`/admin/procurement/receipts/${receiptId}/post`, undefined, {
          headers: adminHeaders,
        })
      )
      expect(rePost.status).toEqual(400)
      expect(await stockedQuantity()).toEqual(before + 40)
    })

    // T4.7: приёмка на склад, где у позиции ещё НЕ было учёта. Раньше ядровая
    // корректировка падала «Inventory level … not found», и закупщик не мог
    // провести ни один приход (Ф-прогон T4.6).
    it("posts a receipt into a location without an inventory level for the item", async () => {
      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "Second Warehouse",
              address: { city: "Astana", country_code: "kz", address_1: "2" },
            },
          ],
        },
      })
      const secondLocationId = locations[0].id
      expect(await stockedQuantityAt(secondLocationId)).toEqual(0)

      const { data: draft } = await call(
        api.post(
          "/admin/procurement/receipts",
          {
            location_id: secondLocationId,
            lines: [
              {
                variant_id: variantId,
                quantity: 12,
                unit: "bag",
                unit_cost: 300,
              },
            ],
          },
          { headers: adminHeaders }
        )
      )

      const posted = await call(
        api.post(
          `/admin/procurement/receipts/${draft.receipt.id}/post`,
          undefined,
          { headers: adminHeaders }
        )
      )
      expect(posted.status).toEqual(200)
      expect(posted.data.receipt.status).toEqual("posted")
      expect(await stockedQuantityAt(secondLocationId)).toEqual(12)
    })

    it("deletes a draft receipt but refuses to delete a posted one", async () => {
      const { data: draft } = await call(
        api.post(
          "/admin/procurement/receipts",
          {
            location_id: locationId,
            lines: [
              {
                variant_id: variantId,
                quantity: 7,
                unit: "bag",
                unit_cost: 100,
              },
            ],
          },
          { headers: adminHeaders }
        )
      )
      const draftId = draft.receipt.id

      const deleted = await call(
        api.delete(`/admin/procurement/receipts/${draftId}`, {
          headers: adminHeaders,
        })
      )
      expect(deleted.status).toEqual(200)
      expect(deleted.data.deleted).toBe(true)

      const gone = await call(
        api.get(`/admin/procurement/receipts/${draftId}`, {
          headers: adminHeaders,
        })
      )
      expect(gone.status).toEqual(404)

      // Проведённый приход удалить нельзя: он уже изменил остаток и себестоимость.
      const { data: second } = await call(
        api.post(
          "/admin/procurement/receipts",
          {
            location_id: locationId,
            lines: [
              {
                variant_id: variantId,
                quantity: 3,
                unit: "bag",
                unit_cost: 100,
              },
            ],
          },
          { headers: adminHeaders }
        )
      )
      await call(
        api.post(
          `/admin/procurement/receipts/${second.receipt.id}/post`,
          undefined,
          { headers: adminHeaders }
        )
      )
      const refused = await call(
        api.delete(`/admin/procurement/receipts/${second.receipt.id}`, {
          headers: adminHeaders,
        })
      )
      expect(refused.status).toEqual(400)
      const still = await call(
        api.get(`/admin/procurement/receipts/${second.receipt.id}`, {
          headers: adminHeaders,
        })
      )
      expect(still.data.receipt.status).toEqual("posted")
    })

    it("blocks posting a receipt with an unmapped line and leaves stock intact", async () => {
      const before = await stockedQuantity()

      const { data: draft } = await call(
        api.post(
          "/admin/procurement/receipts",
          {
            location_id: locationId,
            lines: [
              {
                recognized_title: "Неизвестный мешок",
                quantity: 10,
                unit: "bag",
                unit_cost: 100,
              },
            ],
          },
          { headers: adminHeaders }
        )
      )
      expect(draft.receipt.lines[0].variant_id).toBeNull()

      const posted = await call(
        api.post(
          `/admin/procurement/receipts/${draft.receipt.id}/post`,
          undefined,
          { headers: adminHeaders }
        )
      )
      expect(posted.status).toEqual(400)
      expect(await stockedQuantity()).toEqual(before)
    })

    it("rejects an empty receipt and a negative unit cost (400)", async () => {
      const noLines = await call(
        api.post(
          "/admin/procurement/receipts",
          { location_id: locationId, lines: [] },
          { headers: adminHeaders }
        )
      )
      expect(noLines.status).toEqual(400)

      const negative = await call(
        api.post(
          "/admin/procurement/receipts",
          {
            location_id: locationId,
            lines: [
              { variant_id: variantId, quantity: 1, unit: "bag", unit_cost: -1 },
            ],
          },
          { headers: adminHeaders }
        )
      )
      expect(negative.status).toEqual(400)
    })

    it("rejects invalid parse-invoice payloads (bad mime type, empty data) — 400", async () => {
      // Тип не из allow-list форматов Gemini → zod-валидатор 400 (до вызова ИИ).
      const badMime = await call(
        api.post(
          "/admin/procurement/parse-invoice",
          { mime_type: "text/plain", data: "abc" },
          { headers: adminHeaders }
        )
      )
      expect(badMime.status).toEqual(400)

      // Пустое тело файла → 400. (Распознавание реальной накладной — live-smoke,
      // не в CI: требует ключа Gemini и сети.)
      const emptyData = await call(
        api.post(
          "/admin/procurement/parse-invoice",
          { mime_type: "application/pdf", data: "" },
          { headers: adminHeaders }
        )
      )
      expect(emptyData.status).toEqual(400)
    })

    // T4.9a: себестоимость и наценка для карточки товара. Своя позиция внутри
    // теста — не общая фикстура: цифры свода должны быть точными, а приходы
    // соседних тестов уже двигали себестоимость общего варианта.
    it("reports cost, markup and receipt history for a product card", async () => {
      const { result: products } = await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: "Gypsum board 9.5",
              status: ProductStatus.PUBLISHED,
              options: [{ title: "Size", values: ["1200x2500"] }],
              variants: [
                {
                  title: "1200x2500",
                  sku: "GKL-95",
                  manage_inventory: true,
                  options: { Size: "1200x2500" },
                  prices: [{ amount: 6000, currency_code: "kzt" }],
                },
              ],
            },
          ],
        },
      })
      const productId = products[0].id
      const { data: withVariant } = await query().graph({
        entity: "product",
        fields: ["variants.id"],
        filters: { id: productId },
      })
      const gklVariantId = withVariant[0]?.variants?.[0]?.id as string

      const { data: supplier } = await call(
        api.post(
          "/admin/procurement/suppliers",
          { name: "ГипсТрейд" },
          { headers: adminHeaders }
        )
      )

      // Два проведённых прихода по разной цене + черновик, который в
      // себестоимость входить НЕ должен.
      const receipt = async (
        quantity: number,
        unitCost: number,
        receivedAt: string
      ) => {
        const { data } = await call(
          api.post(
            "/admin/procurement/receipts",
            {
              location_id: locationId,
              supplier_id: supplier.supplier.id,
              reference: `INV-${receivedAt.slice(0, 10)}`,
              received_at: receivedAt,
              lines: [
                {
                  variant_id: gklVariantId,
                  quantity,
                  unit: "sheet",
                  unit_cost: unitCost,
                },
              ],
            },
            { headers: adminHeaders }
          )
        )
        return data.receipt.id as string
      }

      const first = await receipt(10, 2000, "2026-08-01T00:00:00.000Z")
      const second = await receipt(6, 3000, "2026-08-20T00:00:00.000Z")
      await receipt(5, 5000, "2026-08-25T00:00:00.000Z")
      for (const id of [first, second]) {
        const posted = await call(
          api.post(`/admin/procurement/receipts/${id}/post`, undefined, {
            headers: adminHeaders,
          })
        )
        expect(posted.status).toEqual(200)
      }

      const costs = await call(
        api.get(
          `/admin/procurement/product-costs?product_id=${productId}`,
          { headers: adminHeaders }
        )
      )
      expect(costs.status).toEqual(200)
      expect(costs.data.variants).toHaveLength(1)
      const row = costs.data.variants[0]
      expect(row.variant_id).toEqual(gklVariantId)
      // Последний закуп — по дате прихода, а не по порядку создания записей.
      expect(row.last_cost).toEqual(3000)
      // Средняя по остатку: (10 × 2 000 + 6 × 3 000) / 16.
      expect(row.average_cost).toEqual(2375)
      expect(row.average_basis).toEqual("stock")
      expect(row.batch_quantity).toEqual(16)
      expect(row.batch_cost_value).toEqual(38000)
      expect(row.price).toEqual(6000)
      expect(row.margin).toEqual(3625)
      expect(row.markup_percent).toEqual(152.6)

      // История — новые сверху, черновик виден и помечен статусом.
      expect(row.receipts_count).toEqual(3)
      expect(row.receipts[0].status).toEqual("draft")
      expect(row.receipts[0].unit_cost).toEqual(5000)
      expect(row.receipts[0].supplier_name).toEqual("ГипсТрейд")
      expect(row.receipts.map((r: { unit_cost: number }) => r.unit_cost)).toEqual([
        5000, 3000, 2000,
      ])
    })

    it("product-costs: 400 without a product and 404 for an unknown one", async () => {
      const noProduct = await call(
        api.get("/admin/procurement/product-costs", { headers: adminHeaders })
      )
      expect(noProduct.status).toEqual(400)

      const unknown = await call(
        api.get("/admin/procurement/product-costs?product_id=prod_missing", {
          headers: adminHeaders,
        })
      )
      expect(unknown.status).toEqual(404)
    })
  },
})
