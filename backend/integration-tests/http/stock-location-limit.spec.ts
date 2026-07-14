import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { MAX_STOCK_LOCATIONS_PER_CITY } from "../../src/api/admin/stock-locations/limit-per-city"

jest.setTimeout(120000)

// Интеграционные тесты лимита «≤5 складов на город» (middleware на
// POST /admin/stock-locations). Нужен docker-postgres; временная БД — backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
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

    const createLocation = (city: string | null) => {
      seq += 1
      const address =
        city === null
          ? { country_code: "kz", address_1: `Street ${seq}` }
          : { city, country_code: "kz", address_1: `Street ${seq}` }
      return call(
        api.post(
          "/admin/stock-locations",
          { name: `WH-${seq}`, address },
          { headers: adminHeaders }
        )
      )
    }

    beforeAll(async () => {
      container = getContainer()

      // Admin-пользователь (первый user создаётся только через CLI/invite —
      // auth identity + user через контейнер, логин по HTTP).
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

    it(`allows up to ${MAX_STOCK_LOCATIONS_PER_CITY} locations per city, rejects the next`, async () => {
      // Уникальный город для этого теста — не пересекается с другими складами БД.
      const city = "Karaganda"
      for (let i = 0; i < MAX_STOCK_LOCATIONS_PER_CITY; i++) {
        const res = await createLocation(city)
        expect(res.status).toEqual(200)
      }

      const overLimit = await createLocation(city)
      expect(overLimit.status).toEqual(400)
      expect(overLimit.data.message).toContain("maximum")
    })

    it("compares city case-insensitively", async () => {
      const res = await createLocation("shymkent")
      expect(res.status).toEqual(200)

      // Ещё 4 в том же городе другим регистром — суммарно 5, шестой отклонён.
      for (let i = 0; i < MAX_STOCK_LOCATIONS_PER_CITY - 1; i++) {
        expect((await createLocation("Shymkent")).status).toEqual(200)
      }
      const overLimit = await createLocation("SHYMKENT")
      expect(overLimit.status).toEqual(400)
    })

    it("does not limit a different city", async () => {
      const res = await createLocation("Almaty")
      expect(res.status).toEqual(200)
    })

    it("does not limit locations without a city", async () => {
      // Много складов без города создаются без ограничения.
      for (let i = 0; i < MAX_STOCK_LOCATIONS_PER_CITY + 1; i++) {
        expect((await createLocation(null)).status).toEqual(200)
      }
    })
  },
})
