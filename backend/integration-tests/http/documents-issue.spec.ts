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
import { issueOrderDocumentWorkflow } from "../../src/workflows/issue-order-document"
import { renderDocumentPdf } from "../../src/workflows/utils/render-document-pdf"
import issueOrderInvoice from "../../src/subscribers/order-invoice"
import issueOrderWaybill from "../../src/subscribers/order-waybill"
import { DOCUMENTS_MODULE } from "../../src/modules/documents"
import DocumentsModuleService from "../../src/modules/documents/service"

jest.setTimeout(180000)

// Сквозные тесты выпуска документов (подзадача 2): рендер PDF (pdfkit +
// встроенный кириллический шрифт), workflow issue-order-document (снапшот →
// строка с номером/версией → PDF в File Module → событие) и подписчики
// (счёт на order.placed, накладная на переход статуса). Подписчики вызываются
// напрямую (детерминированно, без ожидания шины). Требует docker-postgres.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    let container: MedusaContainer

    let regionId: string
    let salesChannelId: string
    let shippingOptionId: string
    let variantId: string
    let seq = 0

    const query = () => container.resolve(ContainerRegistrationKeys.QUERY)
    const docs = () =>
      container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)

    beforeAll(async () => {
      container = getContainer()
      const fulfillment = container.resolve(Modules.FULFILLMENT)
      const link = container.resolve(ContainerRegistrationKeys.LINK)

      const { result: regions } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Docs Region",
              currency_code: "kzt",
              countries: ["kz"],
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      })
      regionId = regions[0].id

      const { result: channels } = await createSalesChannelsWorkflow(
        container
      ).run({ input: { salesChannelsData: [{ name: "Docs Channel" }] } })
      salesChannelId = channels[0].id

      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "Docs Warehouse",
              address: { city: "Astana", country_code: "kz", address_1: "1" },
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
        name: "Docs Delivery",
        type: "shipping",
        service_zones: [
          { name: "KZ", geo_zones: [{ country_code: "kz", type: "country" }] },
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
              { currency_code: "kzt", amount: 2000 },
              { region_id: regionId, amount: 2000 },
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
              title: "Цемент М500",
              status: ProductStatus.PUBLISHED,
              sales_channels: [{ id: salesChannelId }],
              options: [{ title: "Вес", values: ["25кг"] }],
              variants: [
                {
                  title: "25кг",
                  sku: "DOC-CEM-25",
                  manage_inventory: true,
                  options: { Вес: "25кг" },
                  prices: [{ amount: 6000, currency_code: "kzt" }],
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

      // Реквизиты продавца обязательны для выпуска (T4.9): с дефолтными
      // (пустой БИН, «Marketplace») workflow и подписчики документ не выпустят.
      const settings = await docs().getOrCreateSettings()
      await docs().updateDocumentSettings({
        id: settings.id,
        seller_name: "ТОО «СтройМаркет»",
        seller_bin: "180540021764",
        seller_address: "г. Астана, ул. Кабанбай батыра, 53",
        seller_bank_name: "АО «Kaspi Bank»",
        seller_bank_bik: "CASPKZKA",
        seller_iban: "KZ12 3456 7890 1234 5678",
      })
    })

    const placeTestOrder = async () => {
      seq += 1
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          currency_code: "kzt",
          email: `buyer${seq}@example.com`,
          shipping_address: {
            first_name: "Тест",
            last_name: "Покупатель",
            address_1: "ул. Тестовая, 1",
            city: "Astana",
            country_code: "kz",
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

      const { result } = await placeOrderWorkflow(container).run({
        input: { cart_id: cart.id },
      })
      return result
    }

    describe("renderDocumentPdf", () => {
      it("renders a valid PDF with the embedded Cyrillic font", async () => {
        const buffer = await renderDocumentPdf({
          type: "invoice",
          number: "INV-2026-000001",
          version: 1,
          snapshot: {
            issued_at: "2026-07-19T00:00:00.000Z",
            seller: { name: "Маркетплейс", bin: "123456789012" },
            footer_note: "Не является официальным ЭСФ",
            buyer: { email: "buyer@example.com" },
            order: { display_id: 42, currency_code: "kzt" },
            items: [
              { title: "Цемент М500", quantity: 2, unit_price: 6000, total: 12000 },
            ],
            totals: { money: 10000, bonus: 2000, currency_code: "kzt" },
          },
        })

        // Магические байты PDF — %PDF; непустой файл.
        expect(buffer.subarray(0, 4).toString("latin1")).toEqual("%PDF")
        expect(buffer.length).toBeGreaterThan(1000)
      })
    })

    describe("issueOrderDocumentWorkflow", () => {
      it("issues a first waybill with a fresh number and an attached PDF file", async () => {
        const { order } = await placeTestOrder()

        const { result } = await issueOrderDocumentWorkflow(container).run({
          input: { order_id: order.id, type: "waybill" },
        })

        expect(result.document.version).toEqual(1)
        expect(result.document.number).toMatch(/^WB-\d{4}-\d{6}$/)
        expect(result.file.file_id).toBeTruthy()
        expect(result.file.file_url).toContain(".pdf")

        // Строка документа привязана к файлу и помечена текущей.
        const [doc] = await docs().listDocuments(
          { order_id: order.id, type: "waybill", is_latest: true },
          { take: 1 }
        )
        expect(doc.file_id).toEqual(result.file.file_id)
        expect(Number(doc.total_money)).toBeGreaterThan(0)
      })

      it("re-issuing a waybill supersedes the previous version and keeps the number", async () => {
        const { order } = await placeTestOrder()

        const first = await issueOrderDocumentWorkflow(container).run({
          input: { order_id: order.id, type: "waybill" },
        })
        const second = await issueOrderDocumentWorkflow(container).run({
          input: { order_id: order.id, type: "waybill" },
        })

        expect(second.result.document.version).toEqual(2)
        expect(second.result.document.number).toEqual(
          first.result.document.number
        )

        const all = await docs().listDocuments({
          order_id: order.id,
          type: "waybill",
        })
        const latest = all.filter((d) => d.is_latest)
        expect(latest).toHaveLength(1)
        expect(latest[0].version).toEqual(2)
      })

      it("issues an internal AVR with its own AVR number", async () => {
        const { order } = await placeTestOrder()

        const { result } = await issueOrderDocumentWorkflow(container).run({
          input: { order_id: order.id, type: "internal_avr" },
        })

        expect(result.document.version).toEqual(1)
        expect(result.document.number).toMatch(/^AVR-\d{4}-\d{6}$/)
        expect(result.file.file_id).toBeTruthy()
      })

      // T4.9: счёт с пустым БИН бухгалтерия покупателя не примет, поэтому
      // документ не выпускается вовсе — ни строки, ни PDF.
      it("refuses to issue a document while the seller requisites are incomplete", async () => {
        const { order } = await placeTestOrder()
        const settings = await docs().getOrCreateSettings()
        await docs().updateDocumentSettings({ id: settings.id, seller_bin: null })

        try {
          // Ошибку читаем из errors, а не через rejects: раннер выполняет
          // workflow локально и собирает отказ шага в errors, не пробрасывая
          // его наружу (в HTTP-роуте тот же отказ становится 400 not_allowed).
          const run = await issueOrderDocumentWorkflow(container).run({
            input: { order_id: order.id, type: "waybill" },
            throwOnError: false,
          })

          expect(run.errors?.[0]?.error?.message).toMatch(/Реквизиты продавца/)

          const [doc] = await docs().listDocuments(
            { order_id: order.id, type: "waybill" },
            { take: 1 }
          )
          expect(doc).toBeUndefined()
        } finally {
          await docs().updateDocumentSettings({
            id: settings.id,
            seller_bin: "180540021764",
          })
        }
      })

      // Итог документа обязан совпадать с итогом заказа: доставка — отдельная
      // строка, иначе счёт занижен на её стоимость (найдено на стенде T4.9).
      it("includes the delivery line so the document total matches the order", async () => {
        const { order } = await placeTestOrder()

        const { result } = await issueOrderDocumentWorkflow(container).run({
          input: { order_id: order.id, type: "invoice" },
        })

        const [doc] = await docs().listDocuments(
          { order_id: order.id, type: "invoice", is_latest: true },
          { take: 1 }
        )
        const snapshot = doc.snapshot as unknown as {
          items: { title: string; total: number }[]
        }
        const itemsSum = snapshot.items.reduce((sum, i) => sum + i.total, 0)
        // Итог заказа берём выборкой сервиса — ядро считает total при выборке
        // (тот же дефект, что чинили в T4.2a).
        const [orderRow] = await container
          .resolve(Modules.ORDER)
          .listOrders({ id: order.id }, { select: ["id", "total"] })

        expect(result.document.version).toBeGreaterThanOrEqual(1)
        expect(Number(doc.total_money)).toEqual(Number(orderRow.total))
        expect(itemsSum).toEqual(Number(doc.total_money))
        expect(snapshot.items.length).toBeGreaterThan(1)
      })
    })

    // Ждём выполнения асинхронного подписчика (локальная шина событий
    // диспетчеризует подписчиков не дожидаясь workflow-инициатора).
    const waitFor = async <T>(
      fn: () => Promise<T | null | undefined>,
      timeout = 20000
    ): Promise<T | null> => {
      const start = Date.now()
      while (Date.now() - start < timeout) {
        const result = await fn()
        if (result) {
          return result
        }
        await new Promise((resolve) => setTimeout(resolve, 250))
      }
      return null
    }

    describe("invoice subscriber (order.placed)", () => {
      it("issues an invoice automatically when the order is placed", async () => {
        // order.placed эмитит ядровый completeCart один раз → подписчик
        // отрабатывает и выпускает счёт (реальная событийная проводка).
        const { order } = await placeTestOrder()

        const invoice = await waitFor(async () => {
          const [doc] = await docs().listDocuments(
            { order_id: order.id, type: "invoice", is_latest: true },
            { take: 1 }
          )
          return doc?.file_id ? doc : null
        })

        expect(invoice).not.toBeNull()
        expect(invoice!.number).toMatch(/^INV-\d{4}-\d{6}$/)
        expect(invoice!.file_url).toContain(".pdf")
        expect(Number(invoice!.total_money)).toBeGreaterThan(0)
      })

      it("is idempotent: skips issuance when a latest invoice already exists", async () => {
        // Изолированно от шины: фейковый order_id, счёт засеян синхронно через
        // сервис. Хендлер видит текущую версию → пропускает выпуск (и заказ
        // юрлицом не является → внутренний АВР тоже не выпускается).
        const fakeOrderId = "order_docs_idempotency_probe"
        await docs().issueDocument({
          order_id: fakeOrderId,
          type: "invoice",
          snapshot: { seeded: true },
          total_money: 5000,
        })

        await issueOrderInvoice({
          event: { data: { id: fakeOrderId } },
          container,
        } as never)
        await issueOrderInvoice({
          event: { data: { id: fakeOrderId } },
          container,
        } as never)

        const invoices = await docs().listDocuments({
          order_id: fakeOrderId,
          type: "invoice",
        })
        expect(invoices).toHaveLength(1)
        expect(invoices[0].version).toEqual(1)
      })
    })

    describe("waybill subscriber (status change)", () => {
      it("issues a waybill for a delivery order entering in_delivery, once", async () => {
        const { order, lifecycle } = await placeTestOrder()

        const payload = {
          order_id: order.id,
          order_lifecycle_id: lifecycle.id,
          from: "assembled",
          to: "in_delivery",
          actor_type: "seller",
        }
        await issueOrderWaybill({ event: { data: payload }, container } as never)
        // Повторный переход не выпускает вторую накладную (идемпотентность MVP).
        await issueOrderWaybill({ event: { data: payload }, container } as never)

        const waybills = await docs().listDocuments({
          order_id: order.id,
          type: "waybill",
        })
        expect(waybills).toHaveLength(1)
        expect(waybills[0].is_latest).toEqual(true)
      })

      it("does not issue a waybill for an unrelated transition", async () => {
        const { order, lifecycle } = await placeTestOrder()

        await issueOrderWaybill({
          event: {
            data: {
              order_id: order.id,
              order_lifecycle_id: lifecycle.id,
              from: "new",
              to: "confirmed",
              actor_type: "seller",
            },
          },
          container,
        } as never)

        const waybills = await docs().listDocuments({
          order_id: order.id,
          type: "waybill",
        })
        expect(waybills).toHaveLength(0)
      })
    })
  },
})
