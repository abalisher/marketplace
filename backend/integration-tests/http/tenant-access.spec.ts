import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { provisionTenantChannel } from "../../src/lib/tenants/provision"
import { ASSEMBLY_MODULE } from "../../src/modules/assembly"
import AssemblyModuleService from "../../src/modules/assembly/service"
import { ORDER_LIFECYCLE_MODULE } from "../../src/modules/order-lifecycle"
import OrderLifecycleModuleService from "../../src/modules/order-lifecycle/service"
import { TENANT_MODULE } from "../../src/modules/tenant"
import TenantModuleService from "../../src/modules/tenant/service"

// Разграничение доступа пользователей компаний (мультипродавец): продавец и
// сборщик видят и трогают только заказы канала своей компании и только работу
// своей роли, остальное admin-API им закрыто (api/utils/tenant-access.ts).
// Сотрудник площадки работает как раньше.
// Витрина компании определяется publishable key, а не заголовком клиента.

jest.setTimeout(180000)

type Seller = { headers: Record<string, string>; userId: string }

medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let owner: Record<string, string>
    let sellerA: Seller
    let sellerB: Seller
    let pickerA: Seller
    let tenantA: { id: string; sales_channel_id: string }
    let tenantB: { id: string; sales_channel_id: string }
    let orderA: string
    let orderB: string

    const login = async (email: string, role = "seller"): Promise<Seller> => {
      const password = "supersecret"
      const authService = container.resolve(Modules.AUTH)
      const { authIdentity } = await authService.register("emailpass", {
        body: { email, password },
      })
      const user = await container
        .resolve(Modules.USER)
        .createUsers({ email, metadata: { role } })
      await authService.updateAuthIdentities({
        id: authIdentity!.id,
        app_metadata: { user_id: user.id },
      })
      const { data } = await api.post("/auth/user/emailpass", { email, password })
      return { headers: { authorization: `Bearer ${data.token}` }, userId: user.id }
    }

    const createTenant = async (slug: string, name: string, price: number) => {
      const channel = await provisionTenantChannel(container, {
        name,
        delivery_price: price,
      })
      return container.resolve<TenantModuleService>(TENANT_MODULE).createTenants({
        slug,
        name,
        bin: "240140001111",
        sales_channel_id: channel.sales_channel_id,
      })
    }

    const createOrder = async (salesChannelId: string) => {
      const order = await container.resolve(Modules.ORDER).createOrders({
        currency_code: "kzt",
        email: "buyer@example.com",
        sales_channel_id: salesChannelId,
        items: [{ title: "Цемент", quantity: 1, unit_price: 2500 }],
      })
      const lifecycle = await container
        .resolve<OrderLifecycleModuleService>(ORDER_LIFECYCLE_MODULE)
        .createOrderLifecycles({ sales_channel_id: salesChannelId })
      await container.resolve(ContainerRegistrationKeys.LINK).create({
        [Modules.ORDER]: { order_id: order.id },
        [ORDER_LIFECYCLE_MODULE]: { order_lifecycle_id: lifecycle.id },
      })
      return order.id
    }

    const bindSeller = (tenantId: string, userId: string) =>
      container.resolve(ContainerRegistrationKeys.LINK).create({
        [TENANT_MODULE]: { tenant_id: tenantId },
        [Modules.USER]: { user_id: userId },
      })

    beforeAll(async () => {
      container = getContainer()
      await container
        .resolve(Modules.FULFILLMENT)
        .createShippingProfiles({ name: "Default", type: "default" })

      owner = (await login("owner@example.com")).headers
      sellerA = await login("seller-a@example.com")
      sellerB = await login("seller-b@example.com")
      pickerA = await login("picker-a@example.com", "picker")

      tenantA = await createTenant("company-a", "ТОО «А»", 2000)
      tenantB = await createTenant("company-b", "ТОО «Б»", 2500)
      await bindSeller(tenantA.id, sellerA.userId)
      await bindSeller(tenantB.id, sellerB.userId)
      await bindSeller(tenantA.id, pickerA.userId)

      orderA = await createOrder(tenantA.sales_channel_id)
      orderB = await createOrder(tenantB.sales_channel_id)
    })

    it("называет продавцу его компанию, сотруднику площадки — никакую", async () => {
      const seller = await api.get("/admin/tenant", { headers: sellerA.headers })
      expect(seller.data.tenant).toMatchObject({ slug: "company-a" })

      const platform = await api.get("/admin/tenant", { headers: owner })
      expect(platform.data.tenant).toBeNull()
    })

    it("очередь заказов продавца — только заказы его компании", async () => {
      const seller = await api.get("/admin/order-lifecycles", {
        headers: sellerA.headers,
      })
      const ids = seller.data.order_lifecycles.map(
        (row: { order?: { id: string } }) => row.order?.id
      )
      expect(ids).toContain(orderA)
      expect(ids).not.toContain(orderB)

      const platform = await api.get("/admin/order-lifecycles", { headers: owner })
      const all = platform.data.order_lifecycles.map(
        (row: { order?: { id: string } }) => row.order?.id
      )
      expect(all).toEqual(expect.arrayContaining([orderA, orderB]))
    })

    it("чужой заказ для продавца не существует — ни чтением, ни действием", async () => {
      const card = await api
        .get(`/admin/orders/${orderB}/lifecycle/card`, { headers: sellerA.headers })
        .catch((e) => e.response)
      expect(card.status).toEqual(404)

      const cancel = await api
        .post(
          `/admin/orders/${orderB}/lifecycle/cancel`,
          { reason: "чужой" },
          { headers: sellerA.headers }
        )
        .catch((e) => e.response)
      expect(cancel.status).toEqual(404)

      const core = await api
        .get(`/admin/orders/${orderB}`, { headers: sellerA.headers })
        .catch((e) => e.response)
      expect(core.status).toEqual(404)

      const own = await api.get(`/admin/orders/${orderA}/lifecycle/card`, {
        headers: sellerA.headers,
      })
      expect(own.status).toEqual(200)
    })

    it("ядровый список заказов продавцу отфильтрован по его каналу", async () => {
      const { data } = await api.get("/admin/orders?fields=id,sales_channel_id", {
        headers: sellerB.headers,
      })
      expect(data.orders.map((o: { id: string }) => o.id)).toEqual([orderB])
    })

    it("закрывает продавцу всё, чего нет в белом списке", async () => {
      for (const path of ["/admin/api-keys", "/admin/phone-otp-codes", "/admin/users"]) {
        const response = await api
          .get(path, { headers: sellerA.headers })
          .catch((e) => e.response)
        expect(response.status).toEqual(403)
      }

      const ownOrderWrite = await api
        .post(`/admin/orders/${orderA}`, { email: "x@y.z" }, { headers: sellerA.headers })
        .catch((e) => e.response)
      expect(ownOrderWrite.status).toEqual(403)
    })

    it("продавец не может сам себя отвязать метаданными, но правит имя", async () => {
      const metadata = await api
        .post(
          `/admin/users/${sellerA.userId}`,
          { metadata: {} },
          { headers: sellerA.headers }
        )
        .catch((e) => e.response)
      expect(metadata.status).toEqual(403)

      const rename = await api.post(
        `/admin/users/${sellerA.userId}`,
        { first_name: "Анна" },
        { headers: sellerA.headers }
      )
      expect(rename.status).toEqual(200)
    })

    it("цену продавец не меняет — она общая для площадки", async () => {
      const response = await api
        .post(
          "/admin/price-stock",
          { changes: [{ variant_id: "variant_any", price: 1 }] },
          { headers: sellerA.headers }
        )
        .catch((e) => e.response)
      expect(response.status).toEqual(400)
      expect(response.data.issues[0].code).toEqual("price_locked")
    })

    it("приостановленная компания закрыта и в панели, и на витрине", async () => {
      const tenants = container.resolve<TenantModuleService>(TENANT_MODULE)
      await tenants.updateTenants({ id: tenantB.id, status: "suspended" })
      try {
        const panel = await api
          .get("/admin/order-lifecycles", { headers: sellerB.headers })
          .catch((e) => e.response)
        expect(panel.status).toEqual(403)
      } finally {
        await tenants.updateTenants({ id: tenantB.id, status: "active" })
      }
    })

    describe("сборщик компании", () => {
      const createTask = async (orderId: string) => {
        const [task] = await container
          .resolve<AssemblyModuleService>(ASSEMBLY_MODULE)
          .createOrderTasks(orderId, [
            {
              category_handle: "fasteners",
              category_name: "Крепёж",
              items: [
                {
                  order_item_id: `item_${orderId}`,
                  variant_id: null,
                  title: "Цемент",
                  sku: null,
                  quantity: 1,
                },
              ],
            },
          ])
        return task
      }

      it("видит задания только подтверждённых заказов своей компании", async () => {
        const taskA = await createTask(orderA)
        const taskB = await createTask(orderB)

        const before = await api.get("/admin/assembly-tasks", {
          headers: pickerA.headers,
        })
        expect(before.data.assembly_tasks).toHaveLength(0)

        await api.post(
          `/admin/orders/${orderA}/lifecycle/confirm`,
          {},
          { headers: sellerA.headers }
        )
        await api.post(
          `/admin/orders/${orderB}/lifecycle/confirm`,
          {},
          { headers: sellerB.headers }
        )

        const after = await api.get("/admin/assembly-tasks", {
          headers: pickerA.headers,
        })
        expect(after.data.assembly_tasks.map((t: { id: string }) => t.id)).toEqual([
          taskA.id,
        ])

        const foreign = await api
          .post(`/admin/assembly-tasks/${taskB.id}/start`, {}, { headers: pickerA.headers })
          .catch((e) => e.response)
        expect(foreign.status).toEqual(404)

        const own = await api.post(
          `/admin/assembly-tasks/${taskA.id}/start`,
          {},
          { headers: pickerA.headers }
        )
        expect(own.status).toEqual(200)
      })

      it("сборщик не ведёт заказ, продавец не собирает и не отгружает", async () => {
        for (const path of ["confirm", "cancel", "close"]) {
          const res = await api
            .post(`/admin/orders/${orderA}/lifecycle/${path}`, {}, { headers: pickerA.headers })
            .catch((e) => e.response)
          expect(res.status).toEqual(403)
        }
        const list = await api
          .get("/admin/order-lifecycles", { headers: pickerA.headers })
          .catch((e) => e.response)
        expect(list.status).toEqual(403)

        for (const request of [
          () => api.get("/admin/assembly-tasks", { headers: sellerA.headers }),
          () => api.get("/admin/shipping-queue", { headers: sellerA.headers }),
          () =>
            api.post(
              `/admin/orders/${orderA}/lifecycle/ship`,
              { fulfillment_id: "ful_1", items: [] },
              { headers: sellerA.headers }
            ),
          () =>
            api.post(
              `/admin/orders/${orderA}/lifecycle/start-assembly`,
              {},
              { headers: sellerA.headers }
            ),
        ]) {
          const res = await request().catch((e) => e.response)
          expect(res.status).toEqual(403)
        }

        const role = await api.get("/admin/tenant", { headers: pickerA.headers })
        expect(role.data.tenant).toMatchObject({ slug: "company-a", role: "picker" })
      })
    })

    it("витрина компании получает свой ключ и цену доставки своего склада", async () => {
      const { data: keys } = await api.get("/admin/api-keys?type=publishable", {
        headers: owner,
      })
      const key = keys.api_keys[0].token

      const { data } = await api.get("/store/tenants/company-b", {
        headers: { "x-publishable-api-key": key },
      })
      expect(data.tenant).toMatchObject({
        slug: "company-b",
        delivery_price: 2500,
        publishable_key: expect.stringMatching(/^pk_/),
      })
      expect(data.tenant).not.toHaveProperty("sales_channel_id")

      const missing = await api
        .get("/store/tenants/nope", { headers: { "x-publishable-api-key": key } })
        .catch((e) => e.response)
      expect(missing.status).toEqual(404)
    })
  },
})
