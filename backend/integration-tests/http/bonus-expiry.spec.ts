import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import expireBonusesJob from "../../src/jobs/expire-bonuses"
import {
  BONUS_EXPIRED_EVENT,
  BONUS_EXPIRING_SOON_EVENT,
} from "../../src/modules/bonus/events"
import { BONUS_MODULE } from "../../src/modules/bonus"
import BonusModuleService from "../../src/modules/bonus/service"

jest.setTimeout(180000)

const DAY_MS = 24 * 60 * 60 * 1000
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY_MS)

// Интеграционные тесты сгорания бонусов и admin API конфига (bonus,
// подзадача 4): джоба expire-bonuses (сжигание просроченных лотов + событие
// bonus.expired; предупреждение bonus.expiring_soon с маркером
// expiry_notified_at — одно на лот), GET/POST /admin/bonus-config и
// GET /admin/customers/:id/bonus (данные widget'а). Счета создаются напрямую
// сервисом — оформление заказов сгоранию не нужно. Нужен docker-postgres;
// временная БД — backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let adminHeaders: Record<string, string>
    let emitSpy: jest.SpyInstance
    let seq = 0

    const bonus = () => container.resolve<BonusModuleService>(BONUS_MODULE)

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

    // Конфиг-singleton: каждый тест выставляет нужные значения явно, чтобы
    // не зависеть от порядка выполнения.
    const setConfig = async (
      overrides: Partial<{
        accrual_percent: number
        segment_percents: Record<string, number> | null
        max_spend_percent: number
        expiry_days: number | null
        expiry_notice_days: number
        return_window_days: number
      }> = {}
    ) => {
      const config = await bonus().getOrCreateConfig()
      await bonus().updateBonusConfigs({
        id: config.id,
        accrual_percent: 1,
        segment_percents: null,
        max_spend_percent: 50,
        expiry_days: null,
        expiry_notice_days: 7,
        return_window_days: 14,
        ...overrides,
      })
    }

    // Покупатель (модулем customer) + бонусный счёт с link'ом — как шаг
    // get-or-create-bonus-account.
    const createCustomerWithAccount = async () => {
      seq += 1
      const customer = await container
        .resolve(Modules.CUSTOMER)
        .createCustomers({ email: `bonus-expiry-${seq}@example.com` })
      const account = await bonus().createBonusAccounts({
        currency_code: "kzt",
      })
      const link = container.resolve(ContainerRegistrationKeys.LINK)
      await link.create({
        [Modules.CUSTOMER]: { customer_id: customer.id },
        [BONUS_MODULE]: { bonus_account_id: account.id },
      })
      return { customerId: customer.id, accountId: account.id }
    }

    const accountBalance = async (accountId: string) => {
      const account = await bonus().retrieveBonusAccount(accountId)
      return Number(account.balance)
    }

    const accountTransactions = async (accountId: string, type?: string) =>
      await bonus().listBonusTransactions(
        { account_id: accountId, ...(type ? { type } : {}) },
        { take: null }
      )

    // События с момента offset (эмиты идут пачками — разворачиваем массивы).
    const eventsSince = (offset: number, name: string) =>
      emitSpy.mock.calls
        .slice(offset)
        .flatMap(([messages]) =>
          Array.isArray(messages) ? messages : [messages]
        )
        .filter((message) => message.name === name)

    beforeAll(async () => {
      container = getContainer()
      emitSpy = jest.spyOn(
        container.resolve(Modules.EVENT_BUS),
        "emit"
      )

      // Admin-пользователь: HTTP-флоу закрыт (первый user создаётся только
      // через CLI/invite), поэтому auth identity + user — через контейнер,
      // логин — по HTTP.
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

    describe("expire-bonuses job", () => {
      it("burns unspent remainders of expired lots, emits bonus.expired and stays idempotent", async () => {
        await setConfig({ expiry_notice_days: 0 })
        const expired = await createCustomerWithAccount()
        const alive = await createCustomerWithAccount()

        // Лот просрочен и частично потрачен — сгореть должен только остаток.
        await bonus().credit({
          account_id: expired.accountId,
          amount: 100,
          expires_at: daysFromNow(-1),
        })
        await bonus().spend({ account_id: expired.accountId, amount: 40 })
        // Живой лот другого счёта не трогается.
        await bonus().credit({
          account_id: alive.accountId,
          amount: 50,
          expires_at: daysFromNow(1),
        })

        const offset = emitSpy.mock.calls.length
        await expireBonusesJob(container)

        expect(await accountBalance(expired.accountId)).toEqual(0)
        expect(await accountBalance(alive.accountId)).toEqual(50)

        const expiries = await accountTransactions(expired.accountId, "expiry")
        expect(expiries).toHaveLength(1)
        expect(Number(expiries[0].amount)).toEqual(60)

        const events = eventsSince(offset, BONUS_EXPIRED_EVENT)
        expect(events).toHaveLength(1)
        expect(events[0].data).toEqual(
          expect.objectContaining({
            account_id: expired.accountId,
            amount: 60,
            transaction_id: expiries[0].id,
          })
        )

        // Повторный прогон — no-op: лотов с остатком больше нет.
        const secondOffset = emitSpy.mock.calls.length
        await expireBonusesJob(container)
        expect(
          await accountTransactions(expired.accountId, "expiry")
        ).toHaveLength(1)
        expect(eventsSince(secondOffset, BONUS_EXPIRED_EVENT)).toHaveLength(0)
      })

      it("emits bonus.expiring_soon once per lot within the notice window", async () => {
        await setConfig({ expiry_notice_days: 7 })
        const buyer = await createCustomerWithAccount()

        // Сгорает через 3 дня — в окне; через 30 — вне окна.
        const { transaction: soonLot } = await bonus().credit({
          account_id: buyer.accountId,
          amount: 80,
          expires_at: daysFromNow(3),
        })
        await bonus().credit({
          account_id: buyer.accountId,
          amount: 40,
          expires_at: daysFromNow(30),
        })

        const offset = emitSpy.mock.calls.length
        await expireBonusesJob(container)

        const events = eventsSince(offset, BONUS_EXPIRING_SOON_EVENT)
        expect(events).toHaveLength(1)
        expect(events[0].data).toEqual(
          expect.objectContaining({
            account_id: buyer.accountId,
            amount: 80,
          })
        )

        // Маркер стоит только на лоте в окне; баланс не тронут.
        const marked = await bonus().retrieveBonusTransaction(soonLot.id)
        expect(marked.expiry_notified_at).not.toBeNull()
        expect(await accountBalance(buyer.accountId)).toEqual(120)

        // Повторный прогон не дублирует предупреждение.
        const secondOffset = emitSpy.mock.calls.length
        await expireBonusesJob(container)
        expect(
          eventsSince(secondOffset, BONUS_EXPIRING_SOON_EVENT)
        ).toHaveLength(0)
      })

      it("skips the notice entirely when expiry_notice_days is 0", async () => {
        await setConfig({ expiry_notice_days: 0 })
        const buyer = await createCustomerWithAccount()
        const { transaction } = await bonus().credit({
          account_id: buyer.accountId,
          amount: 30,
          expires_at: daysFromNow(2),
        })

        const offset = emitSpy.mock.calls.length
        await expireBonusesJob(container)

        expect(eventsSince(offset, BONUS_EXPIRING_SOON_EVENT)).toHaveLength(0)
        const lot = await bonus().retrieveBonusTransaction(transaction.id)
        expect(lot.expiry_notified_at).toBeNull()
      })
    })

    describe("GET/POST /admin/bonus-config", () => {
      it("requires an authenticated admin", async () => {
        const res = await call(api.get("/admin/bonus-config"))
        expect(res.status).toEqual(401)
      })

      it("returns the lazily created config", async () => {
        await setConfig()
        const res = await call(
          api.get("/admin/bonus-config", { headers: adminHeaders })
        )

        expect(res.status).toEqual(200)
        expect(res.data.bonus_config).toEqual(
          expect.objectContaining({
            accrual_percent: 1,
            segment_percents: null,
            max_spend_percent: 50,
            expiry_days: null,
            expiry_notice_days: 7,
            return_window_days: 14,
          })
        )
      })

      it("applies a partial update and keeps other fields", async () => {
        await setConfig()
        const res = await call(
          api.post(
            "/admin/bonus-config",
            {
              accrual_percent: 2.5,
              segment_percents: { business: 5 },
              expiry_days: 180,
            },
            { headers: adminHeaders }
          )
        )

        expect(res.status).toEqual(200)
        expect(res.data.bonus_config).toEqual(
          expect.objectContaining({
            accrual_percent: 2.5,
            segment_percents: { business: 5 },
            expiry_days: 180,
            // Не переданные поля не меняются.
            max_spend_percent: 50,
            expiry_notice_days: 7,
            return_window_days: 14,
          })
        )

        const config = await bonus().getOrCreateConfig()
        expect(config.accrual_percent).toEqual(2.5)
        expect(config.expiry_days).toEqual(180)
      })

      it("allows disabling expiry back with null", async () => {
        await setConfig({ expiry_days: 90 })
        const res = await call(
          api.post(
            "/admin/bonus-config",
            { expiry_days: null, segment_percents: null },
            { headers: adminHeaders }
          )
        )

        expect(res.status).toEqual(200)
        expect(res.data.bonus_config.expiry_days).toBeNull()
        expect(res.data.bonus_config.segment_percents).toBeNull()
      })

      it("rejects out-of-range values", async () => {
        const tooBig = await call(
          api.post(
            "/admin/bonus-config",
            { max_spend_percent: 150 },
            { headers: adminHeaders }
          )
        )
        expect(tooBig.status).toEqual(400)

        const zeroExpiry = await call(
          api.post(
            "/admin/bonus-config",
            { expiry_days: 0 },
            { headers: adminHeaders }
          )
        )
        expect(zeroExpiry.status).toEqual(400)

        const badSegment = await call(
          api.post(
            "/admin/bonus-config",
            { segment_percents: { business: -1 } },
            { headers: adminHeaders }
          )
        )
        expect(badSegment.status).toEqual(400)
      })
    })

    describe("GET /admin/customers/:id/bonus", () => {
      it("returns balance and recent transactions without lot internals", async () => {
        const buyer = await createCustomerWithAccount()
        await bonus().credit({ account_id: buyer.accountId, amount: 100 })
        await bonus().spend({ account_id: buyer.accountId, amount: 30 })

        const res = await call(
          api.get(`/admin/customers/${buyer.customerId}/bonus`, {
            headers: adminHeaders,
          })
        )

        expect(res.status).toEqual(200)
        expect(res.data.bonus.account_id).toEqual(buyer.accountId)
        expect(res.data.bonus.balance).toEqual(70)
        expect(res.data.bonus.count).toEqual(2)
        // Новые первыми; lot_breakdown наружу не отдаётся.
        expect(res.data.bonus.transactions.map((t: any) => t.type)).toEqual([
          "spend",
          "accrual",
        ])
        for (const tx of res.data.bonus.transactions) {
          expect(tx).not.toHaveProperty("lot_breakdown")
        }
      })

      it("returns a zero balance for a customer without an account", async () => {
        const customer = await container
          .resolve(Modules.CUSTOMER)
          .createCustomers({ email: "bonus-expiry-noacc@example.com" })

        const res = await call(
          api.get(`/admin/customers/${customer.id}/bonus`, {
            headers: adminHeaders,
          })
        )

        expect(res.status).toEqual(200)
        expect(res.data.bonus).toEqual(
          expect.objectContaining({
            account_id: null,
            balance: 0,
            transactions: [],
            count: 0,
          })
        )
      })

      it("responds 404 for an unknown customer", async () => {
        const res = await call(
          api.get("/admin/customers/cus_unknown/bonus", {
            headers: adminHeaders,
          })
        )
        expect(res.status).toEqual(404)
      })
    })
  },
})
