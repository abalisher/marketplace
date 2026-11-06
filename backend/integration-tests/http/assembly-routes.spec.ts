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
import { splitOrderAssemblyWorkflow } from "../../src/workflows/split-order-assembly"
import { ensureCatalogCategories } from "../../src/lib/catalog/ensure-catalog-categories"
import {
  ASSEMBLY_GROUP_KEY,
  PICKER_ROLE,
  SHELL_ROLE_KEY,
} from "../../src/modules/assembly/roles"

jest.setTimeout(300000)

// Сборка заказа по категориям (T10.11) и очередь экрана отгрузки (T10.13):
// распад оплаченного заказа на задания, работа сборщика через admin-роуты,
// агрегат «заказ собран» и рабочий стол отгрузки вплоть до передачи водителю.
// Инварианты и арифметика покрыты юнитами; здесь — сквозной путь на живом
// стенде. Очередь отгрузки живёт в этом же файле, а не в своём: ей нужна ровно
// эта фикстура (оплаченные заказы из разных категорий + сборщики), и второй её
// экземпляр стоил бы ещё одного подъёма стенда.
// Требует полную инфраструктуру доставки; фикстура строит её один раз.
// Нужен docker-postgres; временная БД — backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let adminHeaders: Record<string, string>
    let pickerHeaders: Record<string, string>

    let regionId: string
    let salesChannelId: string
    let shippingOptionId: string
    let seq = 0

    // variant по handle категории — заказ собираем из товаров разных категорий.
    const variants: Record<string, string> = {}

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
      ).run({ input: { salesChannelsData: [{ name: "Test Channel" }] } })
      salesChannelId = channels[0].id

      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "Test Warehouse",
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
        name: "Test Delivery",
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

      // Четыре категории каталога — общая точка заведения (T10.10).
      const categoryIds = await ensureCatalogCategories(container)

      // По товару на категорию: отделка, электрика, метизы.
      const catalog: { handle: keyof typeof categoryIds; title: string }[] = [
        { handle: "finishing", title: "Гипсокартон 12.5 мм" },
        { handle: "electrical", title: "Кабель ВВГнг 3x2.5" },
        { handle: "fasteners", title: "Саморез по гипсокартону" },
      ]

      for (const item of catalog) {
        const { result: products } = await createProductsWorkflow(
          container
        ).run({
          input: {
            products: [
              {
                title: item.title,
                status: ProductStatus.PUBLISHED,
                sales_channels: [{ id: salesChannelId }],
                category_ids: [categoryIds[item.handle]],
                options: [{ title: "Size", values: ["one"] }],
                variants: [
                  {
                    title: "one",
                    sku: `TEST-${item.handle}`,
                    manage_inventory: true,
                    options: { Size: "one" },
                    prices: [{ amount: 20, currency_code: "usd" }],
                  },
                ],
              },
            ],
          },
        })
        variants[item.handle] = products[0].variants[0].id

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
      }

      // Admin-пользователь (полный доступ к очереди) и сборщик группы
      // «электрика» — роль и группа живут в user.metadata (T10.11).
      const authService = container.resolve(Modules.AUTH)
      const userService = container.resolve(Modules.USER)

      const makeUser = async (
        email: string,
        metadata?: Record<string, unknown>
      ) => {
        const password = "supersecret"
        const { authIdentity } = await authService.register("emailpass", {
          body: { email, password },
        })
        const user = await userService.createUsers({ email, metadata })
        await authService.updateAuthIdentities({
          id: authIdentity!.id,
          app_metadata: { user_id: user.id },
        })
        const { data: login } = await api.post("/auth/user/emailpass", {
          email,
          password,
        })
        return { authorization: `Bearer ${login.token}` }
      }

      adminHeaders = await makeUser("admin@example.com")
      pickerHeaders = await makeUser("picker.electrical@example.com", {
        [SHELL_ROLE_KEY]: PICKER_ROLE,
        [ASSEMBLY_GROUP_KEY]: "electrical",
      })
    })

    // Оформляет оплаченный заказ из перечисленных категорий и раскладывает его
    // на задания сборки (в бою распад делает подписчик на order.placed).
    const placeOrderWithCategories = async (
      handles: string[],
      { confirm = true }: { confirm?: boolean } = {}
    ) => {
      seq += 1
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          currency_code: "usd",
          email: `buyer${seq}@example.com`,
          shipping_address: {
            first_name: "Test",
            last_name: "Buyer",
            address_1: "1 Test St",
            city: "Astana",
            country_code: "us",
            postal_code: "010000",
          },
          items: handles.map((handle) => ({
            variant_id: variants[handle],
            quantity: 4,
          })),
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
      // Распад делает подписчик на order.placed — событие доставляется после
      // завершения workflow, поэтому ждём появления заданий.
      await waitForTasks(result.order.id, handles.length)
      // Сборщик берёт задания только подтверждённого продавцом заказа.
      if (confirm) {
        await api.post(
          `/admin/orders/${result.order.id}/lifecycle/confirm`,
          {},
          { headers: adminHeaders }
        )
      }
      return result.order.id
    }

    // Ждёт, пока подписчик разложит заказ на ожидаемое число заданий.
    const waitForTasks = async (orderId: string, expected: number) => {
      for (let attempt = 0; attempt < 60; attempt++) {
        const data = await tasksOfOrder(orderId)
        if (data.count >= expected) {
          return data
        }
        await new Promise((resolve) => setTimeout(resolve, 250))
      }
      throw new Error(
        `Заказ ${orderId} не разложен на ${expected} задание(й) сборки`
      )
    }

    const lifecycleStatus = async (orderId: string) => {
      const { data: orders } = await query().graph({
        entity: "order",
        fields: ["id", "order_lifecycle.status"],
        filters: { id: orderId },
      })
      return (orders[0] as { order_lifecycle?: { status: string } })
        .order_lifecycle?.status
    }

    const tasksOfOrder = async (orderId: string) => {
      const { data } = await api.get(
        `/admin/assembly-tasks?order_id=${orderId}`,
        { headers: adminHeaders }
      )
      return data
    }

    // Проходит задание целиком: взять → отметить каждую позицию → закрыть.
    const workTask = async (
      taskId: string,
      mark: (item: any) => Record<string, unknown> = () => ({
        status: "picked",
      })
    ) => {
      const { data: started } = await api.post(
        `/admin/assembly-tasks/${taskId}/start`,
        {},
        { headers: adminHeaders }
      )
      for (const item of started.assembly_task.items) {
        await api.post(
          `/admin/assembly-tasks/${taskId}/items/${item.id}`,
          mark(item),
          { headers: adminHeaders }
        )
      }
      const { data } = await api.post(
        `/admin/assembly-tasks/${taskId}/complete`,
        {},
        { headers: adminHeaders }
      )
      return data
    }

    describe("распад оплаченного заказа", () => {
      it("заказ из трёх категорий даёт три задания с своими позициями", async () => {
        const orderId = await placeOrderWithCategories([
          "finishing",
          "electrical",
          "fasteners",
        ])

        const data = await tasksOfOrder(orderId)

        expect(data.count).toEqual(3)
        expect(data.assembly_tasks.map((t: any) => t.category_handle)).toEqual([
          "finishing",
          "electrical",
          "fasteners",
        ])
        for (const task of data.assembly_tasks) {
          expect(task.status).toEqual("pending")
          expect(task.items_total).toEqual(1)
          expect(task.items[0].quantity).toEqual(4)
          expect(task.items[0].status).toEqual("pending")
          expect(task.order_display_id).toBeGreaterThan(0)
        }
        expect(data.counts.by_status.pending).toEqual(3)
      })

      it("повторный распад заданий не удваивает", async () => {
        const orderId = await placeOrderWithCategories([
          "electrical",
          "fasteners",
        ])
        await splitOrderAssemblyWorkflow(container).run({
          input: { order_id: orderId },
        })

        expect((await tasksOfOrder(orderId)).count).toEqual(2)
      })

      it("сборщик видит только задания своей группы", async () => {
        const orderId = await placeOrderWithCategories([
          "finishing",
          "electrical",
        ])

        const { data } = await api.get(
          `/admin/assembly-tasks?order_id=${orderId}`,
          { headers: pickerHeaders }
        )

        expect(data.group).toEqual("electrical")
        expect(data.assembly_tasks).toHaveLength(1)
        expect(data.assembly_tasks[0].category_handle).toEqual("electrical")
      })
    })

    describe("работа сборщика и агрегат статуса", () => {
      it("неподтверждённый заказ сборщик не видит и взять не может", async () => {
        const orderId = await placeOrderWithCategories(["electrical"], {
          confirm: false,
        })

        const { data } = await api.get(
          `/admin/assembly-tasks?order_id=${orderId}`,
          { headers: pickerHeaders }
        )
        expect(data.assembly_tasks).toHaveLength(0)

        const [task] = (await tasksOfOrder(orderId)).assembly_tasks
        const res = await api
          .post(`/admin/assembly-tasks/${task.id}/start`, {}, { headers: adminHeaders })
          .catch((e) => e.response)
        expect(res.status).toEqual(400)
        expect(await lifecycleStatus(orderId)).toEqual("new")
      })

      it("первое взятое задание переводит заказ в «Собирается»", async () => {
        const orderId = await placeOrderWithCategories(["finishing", "electrical"])
        expect(await lifecycleStatus(orderId)).toEqual("confirmed")

        const [first, second] = (await tasksOfOrder(orderId)).assembly_tasks
        await api.post(`/admin/assembly-tasks/${first.id}/start`, {}, { headers: adminHeaders })
        expect(await lifecycleStatus(orderId)).toEqual("assembling")

        // Второе задание статус заказа уже не трогает.
        await api.post(`/admin/assembly-tasks/${second.id}/start`, {}, { headers: adminHeaders })
        expect(await lifecycleStatus(orderId)).toEqual("assembling")
      })

      it("заказ собран, когда закрыто последнее задание", async () => {
        const orderId = await placeOrderWithCategories([
          "finishing",
          "electrical",
        ])
        const tasks = (await tasksOfOrder(orderId)).assembly_tasks

        const first = await workTask(tasks[0].id)
        expect(first.assembly_task.status).toEqual("assembled")
        // Заказ ещё в сборке: второе задание не закрыто.
        expect(first.order_assembly.is_finished).toBe(false)
        expect(await lifecycleStatus(orderId)).toEqual("assembling")

        const second = await workTask(tasks[1].id)
        expect(second.order_assembly.is_finished).toBe(true)
        expect(second.order_assembly.is_assembled).toBe(true)
        expect(second.order_assembly.has_shortage).toBe(false)

        // Жизненный цикл догнал факт сборки, ядро создало fulfillment.
        expect(await lifecycleStatus(orderId)).toEqual("assembled")
        const { data: orders } = await query().graph({
          entity: "order",
          fields: ["id", "fulfillments.id", "fulfillments.items.quantity"],
          filters: { id: orderId },
        })
        const fulfillments = (orders[0] as { fulfillments: any[] }).fulfillments
        expect(fulfillments).toHaveLength(1)
        expect(
          fulfillments[0].items.reduce(
            (sum: number, i: any) => sum + Number(i.quantity),
            0
          )
        ).toEqual(8)
      })

      it("нехватка не блокирует заказ: собранное уходит в отгрузку с флагом", async () => {
        const orderId = await placeOrderWithCategories([
          "finishing",
          "electrical",
        ])
        const tasks = (await tasksOfOrder(orderId)).assembly_tasks

        await workTask(tasks[0].id)
        const last = await workTask(tasks[1].id, () => ({
          status: "partial",
          picked_quantity: 1,
          note: "На складе только один",
        }))

        expect(last.assembly_task.status).toEqual("shortage")
        expect(last.order_assembly.is_finished).toBe(true)
        expect(last.order_assembly.is_assembled).toBe(false)
        expect(last.order_assembly.has_shortage).toBe(true)

        // Собрано 4 + 1 из 8 — заказ частично собран, а не заблокирован.
        expect(await lifecycleStatus(orderId)).toEqual("partially_assembled")

        const { data } = await api.get(`/admin/orders/${orderId}/assembly`, {
          headers: adminHeaders,
        })
        expect(data.summary.has_shortage).toBe(true)
        expect(data.summary.tasks_shortage).toEqual(1)
        expect(
          data.assembly_tasks.find((t: any) => t.status === "shortage")
            .items_missing
        ).toEqual(1)
      })

      it("задание нельзя закрыть с неотмеченными позициями", async () => {
        const orderId = await placeOrderWithCategories([
          "electrical",
          "fasteners",
        ])
        const tasks = (await tasksOfOrder(orderId)).assembly_tasks

        await api.post(
          `/admin/assembly-tasks/${tasks[0].id}/start`,
          {},
          { headers: adminHeaders }
        )
        const res = await call(
          api.post(
            `/admin/assembly-tasks/${tasks[0].id}/complete`,
            {},
            { headers: adminHeaders }
          )
        )

        expect(res.status).toBeGreaterThanOrEqual(400)
      })

      it("отмечать позиции у невзятого задания нельзя", async () => {
        const orderId = await placeOrderWithCategories(["electrical"])
        const task = (await tasksOfOrder(orderId)).assembly_tasks[0]

        const res = await call(
          api.post(
            `/admin/assembly-tasks/${task.id}/items/${task.items[0].id}`,
            { status: "picked" },
            { headers: adminHeaders }
          )
        )

        expect(res.status).toBeGreaterThanOrEqual(400)
      })
    })

    describe("очередь экрана отгрузки", () => {
      // Строка очереди по конкретному заказу. Заказов в тестовой БД много —
      // берём страницу целиком и ищем свой.
      const shippingRow = async (
        orderId: string,
        params = ""
      ) => {
        const { data } = await api.get(
          `/admin/shipping-queue?limit=100${params}`,
          { headers: adminHeaders }
        )
        return {
          data,
          row: data.shipping_orders.find((r: any) => r.order_id === orderId),
        }
      }

      it("заказ в сборке виден со стадией «собирается» и плитками категорий", async () => {
        const orderId = await placeOrderWithCategories([
          "finishing",
          "electrical",
        ])

        const { data, row } = await shippingRow(orderId)

        expect(row).toBeDefined()
        expect(row.stage).toEqual("assembling")
        expect(row.can_ship).toBe(false)
        expect(row.ship_target).toBeNull()
        // Плитки — по категории заказа, в каноническом порядке.
        expect(row.categories.map((c: any) => c.category_handle)).toEqual([
          "finishing",
          "electrical",
        ])
        // Списка позиций в плитке нет — только сводка по ним.
        expect(row.categories[0].items).toBeUndefined()
        expect(row.categories[0].items_total).toEqual(1)
        expect(row.categories[0].items_marked).toEqual(0)
        // Строка заказа собрана бэкендом: экран ничего не досчитывает.
        expect(row.order.display_id).toBeGreaterThan(0)
        expect(row.order.item_count).toEqual(2)
        // Заказ фикстуры — гостевой (покупателя-сущности нет), поэтому в строке
        // стоит почта: та же идиома имени, что в очереди заказов.
        expect(row.order.customer_name).toEqual(row.order.email)
        // Получателя из адреса доставки несёт плитка (loadOrderRefs).
        expect(row.categories[0].customer_name).toEqual("Test Buyer")
        expect(data.counts.by_stage.assembling).toBeGreaterThanOrEqual(1)
        expect(data.counts.total).toEqual(
          data.counts.by_stage.assembling +
            data.counts.by_stage.ready +
            data.counts.by_stage.shortage
        )
      })

      it("плитка называет сборщика по имени, а не по id", async () => {
        const orderId = await placeOrderWithCategories(["electrical"])
        const task = (await tasksOfOrder(orderId)).assembly_tasks[0]
        await api.post(
          `/admin/assembly-tasks/${task.id}/start`,
          {},
          { headers: pickerHeaders }
        )

        const { row } = await shippingRow(orderId)

        expect(row.categories[0].status).toEqual("picking")
        // Учётка сборщика без имени подписывается ЛОГИНОМ, а не полной почтой
        // (правило actorLabel, T10.14e): домен в графе «кто» ничего не несёт.
        // Ожидание отставало от правила — поправлено при T4.12, когда правило
        // переехало в общий помощник api/admin/user-names.ts.
        expect(row.categories[0].assignee_name).toEqual("picker.electrical")
      })

      it("собранный заказ — стадия «готов», отгрузка доступна", async () => {
        const orderId = await placeOrderWithCategories([
          "finishing",
          "electrical",
        ])
        const tasks = (await tasksOfOrder(orderId)).assembly_tasks
        await workTask(tasks[0].id)
        await workTask(tasks[1].id)

        const { row } = await shippingRow(orderId)

        expect(row.stage).toEqual("ready")
        expect(row.summary.is_assembled).toBe(true)
        expect(row.can_ship).toBe(true)
        expect(row.ship_target.fulfillment_id).toBeTruthy()
        // Отгружаем ровно набранное — 4 + 4.
        expect(
          row.ship_target.items.reduce(
            (sum: number, i: any) => sum + i.quantity,
            0
          )
        ).toEqual(8)
      })

      it("нехватка — своя стадия, но отгрузку не блокирует", async () => {
        const orderId = await placeOrderWithCategories([
          "finishing",
          "electrical",
        ])
        const tasks = (await tasksOfOrder(orderId)).assembly_tasks
        await workTask(tasks[0].id)
        await workTask(tasks[1].id, () => ({
          status: "partial",
          picked_quantity: 1,
        }))

        const { row } = await shippingRow(orderId)

        expect(row.stage).toEqual("shortage")
        expect(row.can_ship).toBe(true)
        // В цель отгрузки уходит только набранное — 4 + 1.
        expect(
          row.ship_target.items.reduce(
            (sum: number, i: any) => sum + i.quantity,
            0
          )
        ).toEqual(5)
        expect(
          row.categories.find((c: any) => c.status === "shortage").items_missing
        ).toEqual(1)
      })

      it("фильтр стадии отдаёт только заказы этой стадии", async () => {
        const orderId = await placeOrderWithCategories(["fasteners"])

        const { data, row } = await shippingRow(orderId, "&stage=assembling")

        expect(row).toBeDefined()
        expect(
          data.shipping_orders.every((r: any) => r.stage === "assembling")
        ).toBe(true)
        expect(data.count).toEqual(data.counts.by_stage.assembling)
      })

      it("переданный водителю заказ уходит из очереди", async () => {
        const orderId = await placeOrderWithCategories(["electrical"])
        const tasks = (await tasksOfOrder(orderId)).assembly_tasks
        await workTask(tasks[0].id)

        const { row } = await shippingRow(orderId)
        // Цель перехода приходит готовой — экран передаёт её обратно как есть.
        await api.post(
          `/admin/orders/${orderId}/lifecycle/ship`,
          row.ship_target,
          { headers: adminHeaders }
        )

        expect(await lifecycleStatus(orderId)).toEqual("in_delivery")
        expect((await shippingRow(orderId)).row).toBeUndefined()
      })
    })

  },
})
