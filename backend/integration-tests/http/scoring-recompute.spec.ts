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
import { deliverOrderWorkflow } from "../../src/workflows/deliver-order"
import { closeOrderWorkflow } from "../../src/workflows/close-order"
import { cancelOrderWorkflow } from "../../src/workflows/cancel-order"
import { recomputeCompanyScoringWorkflow } from "../../src/workflows/recompute-company-scoring"
import { COMPANY_MODULE } from "../../src/modules/company"
import CompanyModuleService from "../../src/modules/company/service"
import { SCORING_MODULE } from "../../src/modules/scoring"
import ScoringModuleService from "../../src/modules/scoring/service"

jest.setTimeout(180000)

// Пересчёт рейтинга компании из истории заказов (scoring подзадача 2b): фикстура
// строит инфраструктуру заказа, тесты создают компанию, оформляют/проводят заказы,
// линкуют их к компании и запускают recompute-company-scoring, проверяя балл.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    let container: MedusaContainer
    let regionId: string
    let salesChannelId: string
    let shippingOptionId: string
    let variantId: string
    let seq = 0

    const query = () => container.resolve(ContainerRegistrationKeys.QUERY)
    const scoring = () =>
      container.resolve<ScoringModuleService>(SCORING_MODULE)

    beforeAll(async () => {
      container = getContainer()
      const fulfillment = container.resolve(Modules.FULFILLMENT)
      const link = container.resolve(ContainerRegistrationKeys.LINK)

      const { result: regions } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Score Region",
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
      ).run({ input: { salesChannelsData: [{ name: "Score Channel" }] } })
      salesChannelId = channels[0].id
      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "Score WH",
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
        name: "Score Delivery",
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
              title: "Score Cement",
              status: ProductStatus.PUBLISHED,
              sales_channels: [{ id: salesChannelId }],
              options: [{ title: "Size", values: ["25kg"] }],
              variants: [
                {
                  title: "25kg",
                  sku: "SCORE-CEM-25",
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
              stocked_quantity: 1000,
            },
          ],
        },
      })
    })

    const createCompany = async () => {
      seq += 1
      const companyService =
        container.resolve<CompanyModuleService>(COMPANY_MODULE)
      const company = await companyService.createCompanies({
        name: `Score Co ${seq}`,
        bin: `${100000000000 + seq}`,
        status: "approved",
      })
      return company.id as string
    }

    const placeOrder = async (companyId: string) => {
      seq += 1
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          currency_code: "usd",
          email: `score${seq}@example.com`,
          shipping_address: {
            first_name: "T",
            last_name: "B",
            address_1: "1 St",
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
      const pcId = (carts[0] as { payment_collection?: { id: string } })
        .payment_collection!.id
      await createPaymentSessionsWorkflow(container).run({
        input: { payment_collection_id: pcId, provider_id: "pp_system_default" },
      })
      const { result } = await placeOrderWorkflow(container).run({
        input: { cart_id: cart.id },
      })
      // Привязываем заказ к компании (в place-order это делает resolveOrderCompany
      // для сотрудника; здесь линкуем напрямую — фикстуре сотрудник не нужен).
      const link = container.resolve(ContainerRegistrationKeys.LINK)
      await link.create({
        [COMPANY_MODULE]: { company_id: companyId },
        [Modules.ORDER]: { order_id: result.order.id },
      })
      return result.order.id as string
    }

    const walkToClosed = async (orderId: string) => {
      const orderService = container.resolve(Modules.ORDER)
      const items = (
        await orderService.retrieveOrder(orderId, { relations: ["items"] })
      ).items!.map((i) => ({ id: i.id, quantity: Number(i.quantity) }))

      await confirmOrderWorkflow(container).run({
        input: { order_id: orderId, actor_type: "seller" },
      })
      await startOrderAssemblyWorkflow(container).run({
        input: { order_id: orderId, actor_type: "seller" },
      })
      await completeOrderAssemblyWorkflow(container).run({
        input: { order_id: orderId, items, actor_type: "seller" },
      })
      const { data: o } = await query().graph({
        entity: "order",
        fields: ["id", "fulfillments.id"],
        filters: { id: orderId },
      })
      const fid = (o[0] as { fulfillments: { id: string }[] }).fulfillments[0].id
      await shipOrderWorkflow(container).run({
        input: { order_id: orderId, fulfillment_id: fid, items, actor_type: "seller" },
      })
      // Код получения выдаётся во время ship — читаем ПОСЛЕ отгрузки.
      const { data: shipped } = await query().graph({
        entity: "order",
        fields: ["id", "order_lifecycle.delivery_code"],
        filters: { id: orderId },
      })
      const code = (
        shipped[0] as { order_lifecycle: { delivery_code: string } }
      ).order_lifecycle.delivery_code
      await deliverOrderWorkflow(container).run({
        input: {
          order_id: orderId,
          fulfillment_id: fid,
          delivery_code: code,
          actor_type: "system",
        },
      })
      await closeOrderWorkflow(container).run({
        input: { order_id: orderId, actor_type: "system" },
      })
    }

    describe("recomputeCompanyScoringWorkflow", () => {
      it("computes a score card from one completed order", async () => {
        const companyId = await createCompany()
        const orderId = await placeOrder(companyId)
        await walkToClosed(orderId)

        const { result } = await recomputeCompanyScoringWorkflow(container).run({
          input: { company_id: companyId },
        })

        // 1 завершённый заказ → orders-компонент 5; объём $40 и tenure≈0 дают 0;
        // балл 5 (ниже порога 30 → лимит 0).
        expect(result.score).toEqual(5)
        expect((result.components as { orders: number }).orders).toEqual(5)
        expect(Number(result.credit_limit)).toEqual(0)

        // Свободный лимит — 0 (нет ручного, вычисленный 0).
        expect(await scoring().availableCredit(companyId)).toEqual(0)
      })

      it("penalises canceled orders and counts only completed ones", async () => {
        const companyId = await createCompany()
        const closed = await placeOrder(companyId)
        await walkToClosed(closed)

        // Второй заказ той же компании — отменён (штраф, в completed не входит).
        const canceled = await placeOrder(companyId)
        await cancelOrderWorkflow(container).run({
          input: { order_id: canceled, actor_type: "buyer", reason: "cancel" },
        })

        const { result } = await recomputeCompanyScoringWorkflow(container).run({
          input: { company_id: companyId },
        })

        // orders 5 (1 завершённый) − penalty 10 (1 отмена) → clamp 0.
        expect(result.score).toEqual(0)
      })
    })
  },
})
