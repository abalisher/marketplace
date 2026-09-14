import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { createSalesChannelsWorkflow } from "@medusajs/medusa/core-flows"

jest.setTimeout(180000)

// HTTP-путь водителя-gig (T5.1): вход по номеру телефона = самрегистрация,
// свой actor_type `driver`, профиль о себе, допуск к работе решением продавца.
// Проверяем ещё и границы actor-типов: токен водителя не открывает ни витрину,
// ни панель, а токен покупателя не открывает `/driver/*`.
// Нужен docker-postgres; временная БД — backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let adminHeaders: Record<string, string>
    // Ключ витрины нужен одному тесту — про то, что тот же номер входит ещё и
    // покупателем: роуты /store/* без publishable-ключа не отвечают.
    let storeHeaders: Record<string, string>
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

    // Уникальный мобильный номер на каждый тест (номер = ключ учётки).
    const nextPhone = () => {
      seq += 1
      return `+7702${String(4000000 + seq).padStart(7, "0")}`
    }

    const requestCode = (phone: string) =>
      call(api.post("/driver/auth/phone/otp", { phone }))

    const verifyCode = (phone: string, code: string) =>
      call(api.post("/driver/auth/phone/verify", { phone, code }))

    const decodeJwt = (token: string) =>
      JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString("utf-8")
      )

    const driverHeaders = (token: string) => ({
      authorization: `Bearer ${token}`,
    })

    // Сбрасывает паузу «выслать снова», чтобы тест не ждал минуту.
    const resetResendPause = async (phone: string) => {
      const authService = container.resolve(Modules.AUTH)
      const [identity] = await authService.listProviderIdentities({
        provider: "phone",
        entity_id: phone,
      })
      if (!identity) {
        return
      }
      const metadata = (identity.provider_metadata ?? {}) as Record<
        string,
        unknown
      >
      await authService.updateProviderIdentities([
        {
          id: identity.id,
          provider_metadata: {
            ...metadata,
            code_requested_at: new Date(Date.now() - 3600_000).toISOString(),
          },
        },
      ])
    }

    // Вход «под ключ»: код → сессия. Возвращает токен и профиль водителя.
    const login = async (phone: string) => {
      await resetResendPause(phone)
      const { data: sent } = await requestCode(phone)
      const res = await verifyCode(phone, sent.dev_code)
      expect(res.status).toEqual(200)
      return res.data as { token: string; driver: any; created: boolean }
    }

    // Заполненный профиль — условие допуска к работе.
    const fillProfile = (token: string) =>
      call(
        api.post(
          "/driver/me",
          {
            full_name: "Бауыржан Сатыбалдиев",
            vehicle_model: "ГАЗель Next",
            vehicle_plate: "123 abc 02",
            capacity_kg: 1500,
          },
          { headers: driverHeaders(token) }
        )
      )

    beforeAll(async () => {
      container = getContainer()
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
      const { data: adminLogin } = await api.post("/auth/user/emailpass", {
        email,
        password,
      })
      adminHeaders = { authorization: `Bearer ${adminLogin.token}` }

      const { result: channels } = await createSalesChannelsWorkflow(
        container
      ).run({ input: { salesChannelsData: [{ name: "Driver Auth Channel" }] } })
      const [publishableKey] = await container
        .resolve(Modules.API_KEY)
        .createApiKeys([
          { title: "driver-auth", type: "publishable", created_by: "test" },
        ])
      await container.resolve(ContainerRegistrationKeys.LINK).create({
        [Modules.API_KEY]: { publishable_key_id: publishableKey.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: channels[0].id },
      })
      storeHeaders = { "x-publishable-api-key": publishableKey.token }
    })

    describe("POST /driver/auth/phone/otp", () => {
      it("выдаёт код на номер в любой записи и отвечает каноном", async () => {
        const phone = nextPhone()
        const national = phone.slice(2)
        const res = await requestCode(
          `8 ${national.slice(0, 3)} ${national.slice(3)}`
        )

        expect(res.status).toEqual(200)
        expect(res.data.phone).toEqual(phone)
        expect(res.data.dev_code).toMatch(/^\d{6}$/)
        expect(res.data.expires_in).toBeGreaterThan(0)
      })

      it("отклоняет немобильный номер", async () => {
        const res = await requestCode("+77172123456")
        expect(res.status).toEqual(400)
        expect(res.data.reason).toEqual("invalid_phone")
      })

      it("держит паузу перед повторной отправкой", async () => {
        const phone = nextPhone()
        expect((await requestCode(phone)).status).toEqual(200)

        const again = await requestCode(phone)
        expect(again.status).toEqual(429)
        expect(again.data.retry_after).toBeGreaterThan(0)
      })
    })

    describe("POST /driver/auth/phone/verify", () => {
      it("регистрирует водителя и выдаёт сессию actor_type=driver", async () => {
        const phone = nextPhone()
        const session = await login(phone)

        expect(session.created).toBe(true)
        expect(session.driver.phone).toEqual(phone)
        // Заявка ждёт проверки продавцом — сам себя водитель не допускает.
        expect(session.driver.status).toEqual("pending")
        expect(session.driver.profile_complete).toBe(false)

        const payload = decodeJwt(session.token)
        expect(payload).toMatchObject({
          actor_id: session.driver.id,
          actor_type: "driver",
          app_metadata: { driver_id: session.driver.id },
        })
      })

      it("второй вход по тому же номеру ведёт в тот же профиль", async () => {
        const phone = nextPhone()
        const first = await login(phone)
        const second = await login(phone)

        expect(second.created).toBe(false)
        expect(second.driver.id).toEqual(first.driver.id)
      })

      it("не пускает по неверному коду и не заводит заявку", async () => {
        const phone = nextPhone()
        const { data: sent } = await requestCode(phone)
        const wrong = sent.dev_code === "000000" ? "111111" : "000000"

        const res = await verifyCode(phone, wrong)
        expect(res.status).toEqual(401)
        expect(res.data.reason).toEqual("invalid_code")

        const list = await call(
          api.get(`/admin/drivers?q=${encodeURIComponent(phone)}`, {
            headers: adminHeaders,
          })
        )
        expect(list.data.drivers).toHaveLength(0)
      })

      it("проверяет формат номера и кода", async () => {
        expect((await verifyCode("+77172123456", "123456")).status).toEqual(400)
        expect(
          (
            await call(
              api.post("/driver/auth/phone/verify", {
                phone: nextPhone(),
                code: "abc",
              })
            )
          ).status
        ).toEqual(400)
      })
    })

    describe("/driver/me", () => {
      it("отдаёт свой профиль по токену водителя", async () => {
        const session = await login(nextPhone())
        const me = await call(
          api.get("/driver/me", { headers: driverHeaders(session.token) })
        )

        expect(me.status).toEqual(200)
        expect(me.data.driver.id).toEqual(session.driver.id)
      })

      it("водитель заполняет профиль о себе сам", async () => {
        const session = await login(nextPhone())
        const saved = await fillProfile(session.token)

        expect(saved.status).toEqual(200)
        expect(saved.data.driver.full_name).toEqual("Бауыржан Сатыбалдиев")
        // Госномер приводится к одному виду — его сверяют глазами.
        expect(saved.data.driver.vehicle_plate).toEqual("123 ABC 02")
        expect(saved.data.driver.capacity_kg).toEqual(1500)
        expect(saved.data.driver.profile_complete).toBe(true)
        // Допуск профилем не меняется.
        expect(saved.data.driver.status).toEqual("pending")
      })

      it("не пускает без токена, с токеном покупателя и с админским", async () => {
        expect((await call(api.get("/driver/me"))).status).toEqual(401)

        const customerEmail = `driver-cross-${Date.now()}@example.com`
        const { data: reg } = await api.post(
          "/auth/customer/emailpass/register",
          { email: customerEmail, password: "supersecret" }
        )
        expect(
          (
            await call(
              api.get("/driver/me", { headers: driverHeaders(reg.token) })
            )
          ).status
        ).toEqual(401)

        expect(
          (await call(api.get("/driver/me", { headers: adminHeaders }))).status
        ).toEqual(401)
      })

      it("отклоняет пустое тело и мусор в полях", async () => {
        const session = await login(nextPhone())

        expect(
          (
            await call(
              api.post(
                "/driver/me",
                {},
                { headers: driverHeaders(session.token) }
              )
            )
          ).status
        ).toEqual(400)
        expect(
          (
            await call(
              api.post(
                "/driver/me",
                { capacity_kg: 0 },
                { headers: driverHeaders(session.token) }
              )
            )
          ).status
        ).toEqual(400)
      })
    })

    describe("токен водителя не открывает чужие поверхности", () => {
      it("не годится ни для витрины, ни для панели", async () => {
        const session = await login(nextPhone())

        const store = await call(
          api.get("/store/customers/me", {
            headers: driverHeaders(session.token),
          })
        )
        expect(store.status).toBeGreaterThanOrEqual(400)

        const admin = await call(
          api.get("/admin/drivers", { headers: driverHeaders(session.token) })
        )
        expect(admin.status).toEqual(401)
      })
    })

    describe("/admin/drivers", () => {
      it("показывает заявки продавцу и ищет по номеру", async () => {
        const phone = nextPhone()
        const session = await login(phone)

        const list = await call(
          api.get("/admin/drivers?status=pending", { headers: adminHeaders })
        )
        expect(list.status).toEqual(200)
        expect(list.data.drivers.map((d: any) => d.id)).toContain(
          session.driver.id
        )

        const found = await call(
          api.get(`/admin/drivers?q=${encodeURIComponent(phone)}`, {
            headers: adminHeaders,
          })
        )
        expect(found.data.count).toEqual(1)
        expect(found.data.drivers[0].id).toEqual(session.driver.id)

        const card = await call(
          api.get(`/admin/drivers/${session.driver.id}`, {
            headers: adminHeaders,
          })
        )
        expect(card.data.driver.phone).toEqual(phone)
      })

      it("требует аутентификации", async () => {
        expect((await call(api.get("/admin/drivers"))).status).toEqual(401)
      })

      it("допускает к работе только заполненный профиль", async () => {
        const session = await login(nextPhone())

        const early = await call(
          api.post(
            `/admin/drivers/${session.driver.id}/status`,
            { status: "active" },
            { headers: adminHeaders }
          )
        )
        expect(early.status).toBeGreaterThanOrEqual(400)

        await fillProfile(session.token)
        const approved = await call(
          api.post(
            `/admin/drivers/${session.driver.id}/status`,
            { status: "active" },
            { headers: adminHeaders }
          )
        )
        expect(approved.status).toEqual(200)
        expect(approved.data.driver.status).toEqual("active")
        expect(approved.data.driver.status_changed_at).toBeTruthy()
      })

      it("подписывает решение именем сотрудника, а не id учётки", async () => {
        const session = await login(nextPhone())
        await fillProfile(session.token)
        await call(
          api.post(
            `/admin/drivers/${session.driver.id}/status`,
            { status: "active" },
            { headers: adminHeaders }
          )
        )

        // Панель показывает «кто решил» человеку: id учётки (`usr_01H…`) на
        // экране ничего не объясняет, поэтому наружу его не отдаём вовсе —
        // ни в карточке, ни в очереди (T5.1a).
        const card = await call(
          api.get(`/admin/drivers/${session.driver.id}`, {
            headers: adminHeaders,
          })
        )
        expect(card.data.driver.status_changed_by_name).toEqual("admin")
        expect(card.data.driver.status_changed_by).toBeUndefined()

        const list = await call(
          api.get(`/admin/drivers?q=${encodeURIComponent(session.driver.phone)}`, {
            headers: adminHeaders,
          })
        )
        expect(list.data.drivers[0].status_changed_by_name).toEqual("admin")
        expect(list.data.drivers[0].status_changed_by).toBeUndefined()

        // Водителю решение продавца не показываем: у него в приложении —
        // только статус и причина.
        const me = await call(
          api.get("/driver/me", { headers: driverHeaders(session.token) })
        )
        expect(me.data.driver.status_changed_by_name).toBeUndefined()
        expect(me.data.driver.status_changed_by).toBeUndefined()
      })

      it("блокирует с причиной — водитель входит и видит её", async () => {
        const phone = nextPhone()
        const session = await login(phone)
        await fillProfile(session.token)

        const blocked = await call(
          api.post(
            `/admin/drivers/${session.driver.id}/status`,
            {
              status: "blocked",
              note: "Заявка отклонена: нет прав категории C",
            },
            { headers: adminHeaders }
          )
        )
        expect(blocked.status).toEqual(200)
        expect(blocked.data.driver.status).toEqual("blocked")

        // Вход остаётся открытым: иначе водитель не узнает причину отказа.
        const again = await login(phone)
        expect(again.driver.status).toEqual("blocked")
        expect(again.driver.status_note).toEqual(
          "Заявка отклонена: нет прав категории C"
        )
      })

      it("не возвращает водителя в «ожидает проверки»", async () => {
        const session = await login(nextPhone())

        const res = await call(
          api.post(
            `/admin/drivers/${session.driver.id}/status`,
            { status: "pending" },
            { headers: adminHeaders }
          )
        )
        expect(res.status).toEqual(400)
      })
    })

    describe("один человек — одна учётная сущность", () => {
      it("тот же номер входит покупателем, сессии разные", async () => {
        const phone = nextPhone()
        const driverSession = await login(phone)

        // Учётная сущность одна, actor-типы разные: driver_id и customer_id
        // лежат рядом в app_metadata.
        await resetResendPause(phone)
        const { data: sent } = await call(
          api.post("/store/auth/phone/otp", { phone }, { headers: storeHeaders })
        )
        const customer = await call(
          api.post(
            "/store/auth/phone/verify",
            { phone, code: sent.dev_code },
            { headers: storeHeaders }
          )
        )
        expect(customer.status).toEqual(200)
        expect(decodeJwt(customer.data.token).actor_type).toEqual("customer")

        // Профиль водителя на месте и открывается своим токеном.
        const me = await call(
          api.get("/driver/me", { headers: driverHeaders(driverSession.token) })
        )
        expect(me.data.driver.id).toEqual(driverSession.driver.id)
      })
    })
  },
})
