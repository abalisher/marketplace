import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"

// Юрлица заморожены на MVP (T10.9): при выключенном FEATURE_COMPANIES весь
// домен отвечает 404 — и покупателю, и панели. Флаг здесь НЕ выставляем: его
// отсутствие = состояние MVP по умолчанию (см. backend/.env.example).
//
// Проверяется именно гейт, а не бизнес-логика: включённый домен покрывают
// company-routes.spec.ts и scoring-routes.spec.ts. Нужен docker-postgres.
delete process.env.FEATURE_COMPANIES

jest.setTimeout(120000)

medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let storeHeaders: Record<string, string>
    let adminHeaders: Record<string, string>

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

      // Publishable key — обязательный заголовок всех /store-роутов.
      const apiKeyService = container.resolve(Modules.API_KEY)
      const [publishableKey] = await apiKeyService.createApiKeys([
        { title: "test", type: "publishable", created_by: "test" },
      ])
      storeHeaders = { "x-publishable-api-key": publishableKey.token }

      // Admin-пользователь — идиома company-routes.spec.ts: auth identity и
      // user через контейнер, логин по HTTP.
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

    describe("замороженный домен юрлиц", () => {
      it("store-роуты компании отвечают 404, а не просят вход", async () => {
        const created = await call(
          api.post(
            "/store/companies",
            { name: "ТОО Тест", bin: "123456789012" },
            { headers: storeHeaders }
          )
        )
        expect(created.status).toEqual(404)

        const mine = await call(
          api.get("/store/companies/me", { headers: storeHeaders })
        )
        expect(mine.status).toEqual(404)
      })

      it("admin-роуты компаний и скоринга отвечают 404", async () => {
        const list = await call(
          api.get("/admin/companies", { headers: adminHeaders })
        )
        expect(list.status).toEqual(404)

        const config = await call(
          api.get("/admin/scoring-config", { headers: adminHeaders })
        )
        expect(config.status).toEqual(404)
      })

      it("панель узнаёт о выключенном домене из /admin/feature-flags", async () => {
        const response = await api.get("/admin/feature-flags", {
          headers: adminHeaders,
        })
        expect(response.status).toEqual(200)
        expect(response.data.feature_flags).toEqual({ companies: false })
      })
    })
  },
})
