import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"

jest.setTimeout(120000)

// Интеграционные тесты HTTP-роутов модуля company: аутентификация,
// права (админ компании vs сотрудник), валидация, статусы ошибок.
// Нужен docker-postgres; временная БД — см. backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let storeHeaders: Record<string, string>
    let adminHeaders: Record<string, string>
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

    // Регистрирует customer через публичный auth-флоу и возвращает
    // headers с его JWT (+ publishable key) и id.
    const createCustomer = async () => {
      seq += 1
      const email = `customer-${seq}@example.com`
      const password = "supersecret"

      const { data: reg } = await api.post(
        "/auth/customer/emailpass/register",
        { email, password }
      )
      const { data: created } = await api.post(
        "/store/customers",
        { email },
        {
          headers: {
            authorization: `Bearer ${reg.token}`,
            ...storeHeaders,
          },
        }
      )
      // Свежий логин: в register-токене ещё нет actor_id.
      const { data: login } = await api.post("/auth/customer/emailpass", {
        email,
        password,
      })

      return {
        customerId: created.customer.id as string,
        headers: {
          authorization: `Bearer ${login.token}`,
          ...storeHeaders,
        },
      }
    }

    const registerCompany = async (
      headers: Record<string, string>,
      body: Record<string, unknown> = {}
    ) => {
      seq += 1
      return await call(
        api.post(
          "/store/companies",
          {
            name: `TOO Stroyka ${seq}`,
            bin: String(200000000000 + seq),
            ...body,
          },
          { headers }
        )
      )
    }

    beforeAll(async () => {
      container = getContainer()

      // Publishable key — обязательный заголовок всех /store-роутов.
      const apiKeyService = container.resolve(Modules.API_KEY)
      const [publishableKey] = await apiKeyService.createApiKeys([
        { title: "test", type: "publishable", created_by: "test" },
      ])
      storeHeaders = { "x-publishable-api-key": publishableKey.token }

      // Admin-пользователь: HTTP-флоу закрыт (первый user создаётся только
      // через CLI/invite), поэтому auth identity + user — через контейнер,
      // логин — по HTTP.
      const email = "admin@example.com"
      const password = "supersecret"
      const authService = container.resolve(Modules.AUTH)
      const { authIdentity } = await authService.register("emailpass", {
        body: { email, password },
      })
      const user = await container
        .resolve(Modules.USER)
        .createUsers({ email })
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

    describe("POST /store/companies", () => {
      it("requires an authenticated customer", async () => {
        const res = await call(
          api.post(
            "/store/companies",
            { name: "NoAuth", bin: "123456789012" },
            { headers: storeHeaders }
          )
        )
        expect(res.status).toEqual(401)
      })

      it("registers a pending company with the caller as admin", async () => {
        const { headers } = await createCustomer()

        const res = await registerCompany(headers, {
          documents: [{ name: "charter.pdf", url: "https://files/charter" }],
        })

        expect(res.status).toEqual(201)
        expect(res.data.company.status).toEqual("pending")
        expect(res.data.company.documents).toHaveLength(1)
        expect(res.data.employee.role).toEqual("admin")
      })

      it("rejects a malformed BIN with 400", async () => {
        const { headers } = await createCustomer()

        const res = await registerCompany(headers, { bin: "12345" })

        expect(res.status).toEqual(400)
        expect(res.data.message).toContain("12 digits")
      })
    })

    describe("GET /store/companies/me", () => {
      it("returns the caller's company and employee record", async () => {
        const { headers } = await createCustomer()
        const created = await registerCompany(headers)

        const res = await call(
          api.get("/store/companies/me", { headers })
        )

        expect(res.status).toEqual(200)
        expect(res.data.company.id).toEqual(created.data.company.id)
        expect(res.data.employee.role).toEqual("admin")
        expect(res.data.employee.company).toBeUndefined()
      })

      it("returns 404 for a customer without a company", async () => {
        const { headers } = await createCustomer()

        const res = await call(
          api.get("/store/companies/me", { headers })
        )

        expect(res.status).toEqual(404)
      })
    })

    describe("employee management", () => {
      it("admin adds and lists employees; member is denied", async () => {
        const admin = await createCustomer()
        await registerCompany(admin.headers)
        const member = await createCustomer()

        const added = await call(
          api.post(
            "/store/companies/me/employees",
            { customer_id: member.customerId },
            { headers: admin.headers }
          )
        )
        expect(added.status).toEqual(201)
        expect(added.data.employee.role).toEqual("member")

        const list = await call(
          api.get("/store/companies/me/employees", { headers: admin.headers })
        )
        expect(list.status).toEqual(200)
        expect(list.data.employees).toHaveLength(2)
        const listedMember = list.data.employees.find(
          (e: { id: string }) => e.id === added.data.employee.id
        )
        expect(listedMember.customer.id).toEqual(member.customerId)

        // Сотрудник-member управлять компанией не может.
        const denied = await call(
          api.get("/store/companies/me/employees", { headers: member.headers })
        )
        expect(denied.status).toEqual(400)
        expect(denied.data.message).toContain("admin")
      })

      it("admin removes an employee but not themselves", async () => {
        const admin = await createCustomer()
        const created = await registerCompany(admin.headers)
        const member = await createCustomer()
        const added = await call(
          api.post(
            "/store/companies/me/employees",
            { customer_id: member.customerId },
            { headers: admin.headers }
          )
        )

        const selfDelete = await call(
          api.delete(
            `/store/companies/me/employees/${created.data.employee.id}`,
            { headers: admin.headers }
          )
        )
        expect(selfDelete.status).toEqual(400)
        expect(selfDelete.data.message).toContain("themselves")

        const removed = await call(
          api.delete(
            `/store/companies/me/employees/${added.data.employee.id}`,
            { headers: admin.headers }
          )
        )
        expect(removed.status).toEqual(200)
        expect(removed.data.deleted).toEqual(true)

        // Уволенный customer больше не состоит в компании.
        const gone = await call(
          api.get("/store/companies/me", { headers: member.headers })
        )
        expect(gone.status).toEqual(404)
      })

      it("cannot remove an employee of another company", async () => {
        const adminA = await createCustomer()
        await registerCompany(adminA.headers)
        const adminB = await createCustomer()
        const createdB = await registerCompany(adminB.headers)

        const res = await call(
          api.delete(
            `/store/companies/me/employees/${createdB.data.employee.id}`,
            { headers: adminA.headers }
          )
        )
        expect(res.status).toEqual(404)
      })
    })

    describe("spend limits", () => {
      const setupEmployee = async () => {
        const admin = await createCustomer()
        await registerCompany(admin.headers)
        const member = await createCustomer()
        const added = await call(
          api.post(
            "/store/companies/me/employees",
            { customer_id: member.customerId },
            { headers: admin.headers }
          )
        )
        return { admin, employeeId: added.data.employee.id as string }
      }

      it("admin sets and removes a limit", async () => {
        const { admin, employeeId } = await setupEmployee()

        const created = await call(
          api.post(
            `/store/companies/me/employees/${employeeId}/spend-limits`,
            { amount: 500000, period: "month" },
            { headers: admin.headers }
          )
        )
        expect(created.status).toEqual(201)
        expect(created.data.spend_limit.currency_code).toEqual("kzt")

        const removed = await call(
          api.delete(
            `/store/companies/me/employees/${employeeId}/spend-limits/${created.data.spend_limit.id}`,
            { headers: admin.headers }
          )
        )
        expect(removed.status).toEqual(200)
        expect(removed.data.deleted).toEqual(true)
      })

      it("rejects a non-positive amount with 400", async () => {
        const { admin, employeeId } = await setupEmployee()

        const res = await call(
          api.post(
            `/store/companies/me/employees/${employeeId}/spend-limits`,
            { amount: 0, period: "order" },
            { headers: admin.headers }
          )
        )
        expect(res.status).toEqual(400)
      })
    })

    describe("/admin/companies moderation", () => {
      it("requires admin authentication", async () => {
        const res = await call(api.get("/admin/companies"))
        expect(res.status).toEqual(401)
      })

      it("lists companies filtered by status", async () => {
        const { headers } = await createCustomer()
        const created = await registerCompany(headers)

        const res = await call(
          api.get("/admin/companies?status=pending&limit=100", {
            headers: adminHeaders,
          })
        )

        expect(res.status).toEqual(200)
        expect(res.data.count).toBeGreaterThan(0)
        const ids = res.data.companies.map((c: { id: string }) => c.id)
        expect(ids).toContain(created.data.company.id)
        for (const company of res.data.companies) {
          expect(company.status).toEqual("pending")
        }
      })

      it("returns company details with employees", async () => {
        const { headers, customerId } = await createCustomer()
        const created = await registerCompany(headers)

        const res = await call(
          api.get(`/admin/companies/${created.data.company.id}`, {
            headers: adminHeaders,
          })
        )

        expect(res.status).toEqual(200)
        expect(res.data.company.employees).toHaveLength(1)
        expect(res.data.company.employees[0].customer.id).toEqual(customerId)
      })

      it("returns 404 for an unknown company", async () => {
        const res = await call(
          api.get("/admin/companies/comp_does_not_exist", {
            headers: adminHeaders,
          })
        )
        expect(res.status).toEqual(404)
      })

      it("approves a company", async () => {
        const { headers } = await createCustomer()
        const created = await registerCompany(headers)

        const res = await call(
          api.post(
            `/admin/companies/${created.data.company.id}/approve`,
            {},
            { headers: adminHeaders }
          )
        )

        expect(res.status).toEqual(200)
        expect(res.data.company.status).toEqual("approved")
      })

      it("rejects a company with a reason; empty reason is 400", async () => {
        const { headers } = await createCustomer()
        const created = await registerCompany(headers)

        const noReason = await call(
          api.post(
            `/admin/companies/${created.data.company.id}/reject`,
            { reason: "  " },
            { headers: adminHeaders }
          )
        )
        expect(noReason.status).toEqual(400)

        const res = await call(
          api.post(
            `/admin/companies/${created.data.company.id}/reject`,
            { reason: "no documents" },
            { headers: adminHeaders }
          )
        )
        expect(res.status).toEqual(200)
        expect(res.data.company.status).toEqual("rejected")
        expect(res.data.company.rejection_reason).toEqual("no documents")
      })
    })
  },
})
