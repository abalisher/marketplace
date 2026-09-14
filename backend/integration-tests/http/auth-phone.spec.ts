import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { createSalesChannelsWorkflow } from "@medusajs/medusa/core-flows"

jest.setTimeout(180000)

// Интеграционные тесты входа покупателя по номеру телефона (T10.7):
// запрос кода → подтверждение → сессия, регистрация тем же путём, паузы и
// лимиты попыток, связывание с учёткой, заведённой раньше по email.
// Нужен docker-postgres; временная БД — backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
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
      return `+7701${String(2000000 + seq).padStart(7, "0")}`
    }

    const requestCode = (phone: string) =>
      call(
        api.post("/store/auth/phone/otp", { phone }, { headers: storeHeaders })
      )

    const verifyCode = (phone: string, code: string) =>
      call(
        api.post(
          "/store/auth/phone/verify",
          { phone, code },
          { headers: storeHeaders }
        )
      )

    const decodeJwt = (token: string) =>
      JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString("utf-8")
      )

    // Сбрасывает паузу «выслать снова», чтобы тест не ждал минуту.
    const resetResendPause = async (phone: string) => {
      const authService = container.resolve(Modules.AUTH)
      const [identity] = await authService.listProviderIdentities({
        provider: "phone",
        entity_id: phone,
      })
      const metadata = (identity?.provider_metadata ?? {}) as Record<
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

    beforeAll(async () => {
      container = getContainer()
      const link = container.resolve(ContainerRegistrationKeys.LINK)

      const { result: channels } = await createSalesChannelsWorkflow(
        container
      ).run({ input: { salesChannelsData: [{ name: "Phone Auth Channel" }] } })

      const apiKeyService = container.resolve(Modules.API_KEY)
      const [pk] = await apiKeyService.createApiKeys([
        { title: "phone-auth", type: "publishable", created_by: "test" },
      ])
      await link.create({
        [Modules.API_KEY]: { publishable_key_id: pk.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: channels[0].id },
      })
      storeHeaders = { "x-publishable-api-key": pk.token }
    })

    describe("POST /store/auth/phone/otp", () => {
      it("выдаёт код на номер в любой записи и отвечает каноном", async () => {
        const phone = nextPhone()
        const national = phone.slice(2)
        const res = await requestCode(
          `8 ${national.slice(0, 3)} ${national.slice(3)}`
        )

        expect(res.status).toEqual(200)
        expect(res.data.phone).toEqual(phone)
        expect(res.data.expires_in).toBeGreaterThan(0)
        expect(res.data.resend_after).toBeGreaterThan(0)
        // Dev-канал стенда: SMS-провайдера нет, код приходит в ответе.
        expect(res.data.dev_code).toMatch(/^\d{6}$/)
      })

      it("отклоняет немобильный номер", async () => {
        for (const phone of ["+77172123456", "701234567", "не номер"]) {
          const res = await requestCode(phone)
          expect(res.status).toEqual(400)
          expect(res.data.reason).toEqual("invalid_phone")
        }
      })

      it("держит паузу перед повторной отправкой", async () => {
        const phone = nextPhone()
        expect((await requestCode(phone)).status).toEqual(200)

        const again = await requestCode(phone)
        expect(again.status).toEqual(429)
        expect(again.data.reason).toEqual("too_many_requests")
        expect(again.data.retry_after).toBeGreaterThan(0)

        await resetResendPause(phone)
        expect((await requestCode(phone)).status).toEqual(200)
      })
    })

    describe("POST /store/auth/phone/verify", () => {
      it("регистрирует покупателя по номеру и выдаёт рабочую сессию", async () => {
        const phone = nextPhone()
        const { data: sent } = await requestCode(phone)

        const res = await verifyCode(phone, sent.dev_code)
        expect(res.status).toEqual(200)
        expect(res.data.created).toBe(true)
        expect(res.data.customer.phone).toEqual(phone)
        expect(res.data.token).toBeTruthy()

        // Токен принимается штатной аутентификацией покупателя.
        const me = await call(
          api.get("/store/customers/me", {
            headers: {
              ...storeHeaders,
              authorization: `Bearer ${res.data.token}`,
            },
          })
        )
        expect(me.status).toEqual(200)
        expect(me.data.customer.id).toEqual(res.data.customer.id)
        expect(me.data.customer.phone).toEqual(phone)

        // Полезная нагрузка совпадает с auth-context ядра.
        const payload = decodeJwt(res.data.token)
        expect(payload).toMatchObject({
          actor_id: res.data.customer.id,
          actor_type: "customer",
          app_metadata: { customer_id: res.data.customer.id },
        })
        expect(payload.auth_identity_id).toBeTruthy()
      })

      it("второй вход по тому же номеру ведёт в ту же учётку", async () => {
        const phone = nextPhone()
        const { data: first } = await requestCode(phone)
        const created = await verifyCode(phone, first.dev_code)
        expect(created.data.created).toBe(true)

        await resetResendPause(phone)
        const { data: second } = await requestCode(phone)
        const login = await verifyCode(phone, second.dev_code)

        expect(login.status).toEqual(200)
        expect(login.data.created).toBe(false)
        expect(login.data.customer.id).toEqual(created.data.customer.id)
      })

      it("не пускает по неверному коду", async () => {
        const phone = nextPhone()
        const { data: sent } = await requestCode(phone)
        const wrong = sent.dev_code === "000000" ? "111111" : "000000"

        const res = await verifyCode(phone, wrong)
        expect(res.status).toEqual(401)
        expect(res.data.reason).toEqual("invalid_code")

        // Верный код после ошибки по-прежнему работает.
        const ok = await verifyCode(phone, sent.dev_code)
        expect(ok.status).toEqual(200)
      })

      it("аннулирует код после исчерпания попыток", async () => {
        const phone = nextPhone()
        const { data: sent } = await requestCode(phone)
        const wrong = sent.dev_code === "000000" ? "111111" : "000000"

        const statuses: number[] = []
        for (let attempt = 0; attempt < 5; attempt += 1) {
          statuses.push((await verifyCode(phone, wrong)).status)
        }
        expect(statuses.slice(0, 4)).toEqual([401, 401, 401, 401])
        expect(statuses[4]).toEqual(429)

        // Код сгорел — даже верный больше не подходит, нужен новый.
        const burned = await verifyCode(phone, sent.dev_code)
        expect(burned.status).toEqual(401)
      })

      it("не пускает без запрошенного кода", async () => {
        const res = await verifyCode(nextPhone(), "123456")
        expect(res.status).toEqual(401)
        expect(res.data.reason).toEqual("invalid_code")
      })

      it("проверяет формат номера и кода", async () => {
        const badPhone = await verifyCode("+77172123456", "123456")
        expect(badPhone.status).toEqual(400)

        const badCode = await call(
          api.post(
            "/store/auth/phone/verify",
            { phone: nextPhone(), code: "abc" },
            { headers: storeHeaders }
          )
        )
        expect(badCode.status).toEqual(400)
      })
    })

    describe("совместимость с учётками по email", () => {
      it("вход по номеру подхватывает учётку, заведённую по email", async () => {
        const phone = nextPhone()
        const email = `phone-link-${seq}@example.com`
        const password = "supersecret"

        const { data: reg } = await api.post(
          "/auth/customer/emailpass/register",
          { email, password }
        )
        const { data: created } = await api.post(
          "/store/customers",
          { email, phone },
          { headers: { authorization: `Bearer ${reg.token}`, ...storeHeaders } }
        )

        const { data: sent } = await requestCode(phone)
        const login = await verifyCode(phone, sent.dev_code)

        expect(login.status).toEqual(200)
        expect(login.data.created).toBe(false)
        // Дубля учётки не появилось — та же самая.
        expect(login.data.customer.id).toEqual(created.customer.id)
        expect(login.data.customer.email).toEqual(email)
      })

      it("вход по email продолжает работать", async () => {
        const email = `phone-emailpass-${Date.now()}@example.com`
        const password = "supersecret"
        await api.post("/auth/customer/emailpass/register", { email, password })
        const res = await call(
          api.post("/auth/customer/emailpass", { email, password })
        )
        expect(res.status).toEqual(200)
        expect(res.data.token).toBeTruthy()
      })

      it("ядровой роут регистрации по номеру ничего не выдаёт", async () => {
        const res = await call(
          api.post("/auth/customer/phone/register", { phone: nextPhone() })
        )
        expect(res.status).toBeGreaterThanOrEqual(400)
      })
    })
  },
})
