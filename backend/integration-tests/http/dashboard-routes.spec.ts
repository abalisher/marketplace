import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

// Сводка дня панели продавца (GET /admin/dashboard). Арифметика денег и стадий
// покрыта юнитами (api/admin/dashboard/__tests__) — здесь живой путь: сводка
// собирается на РЕАЛЬНОЙ выборке, а не на заглушках.
//
// ЗАЧЕМ именно http-тест: деньги и отчёт по стадиям читают заказы фильтром по
// дате (`created_at: { $gte }`) и лог переходов через сервис модуля. Юнит с
// заглушкой query.graph такой фильтр не проверяет вовсе — он проверяет только
// то, что мы его передали. Один живой запрос закрывает вопрос «а понимает ли
// его query.graph».
//
// Флаг юрлиц проверяется в ОБА состояния (правило backend/CLAUDE.md): без него
// дебиторки в ответе нет вовсе, с ним — блок появляется.
delete process.env.FEATURE_COMPANIES

jest.setTimeout(120000)

medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let adminHeaders: Record<string, string>

    const dashboard = () =>
      api.get("/admin/dashboard", { headers: adminHeaders })

    beforeAll(async () => {
      container = getContainer()

      const email = "admin@example.com"
      const password = "supersecret"
      const authService = container.resolve(Modules.AUTH)
      const { authIdentity } = await authService.register("emailpass", {
        body: { email, password },
      })
      const user = await container.resolve(Modules.USER).createUsers({
        email,
        first_name: "Тимур",
        last_name: "Управляющий",
      })
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

    afterEach(() => {
      delete process.env.FEATURE_COMPANIES
    })

    it("отдаёт деньги дня: выручку за день и неделю, деньги в работе", async () => {
      const response = await dashboard()

      expect(response.status).toEqual(200)
      expect(response.data.money).toMatchObject({
        currency_code: "kzt",
        revenue_today: expect.any(Number),
        revenue_today_orders: expect.any(Number),
        revenue_week: expect.any(Number),
        revenue_week_orders: expect.any(Number),
        week_days: 7,
        in_progress: expect.any(Number),
        in_progress_orders: expect.any(Number),
        awaiting_payment: expect.any(Number),
        other_currency_orders: expect.any(Number),
      })
      // Пустой стенд — не повод для отрицательных сумм.
      expect(response.data.money.revenue_week).toBeGreaterThanOrEqual(0)
      expect(response.data.money.in_progress).toBeGreaterThanOrEqual(0)
    })

    it("отдаёт отчёт по стадиям в порядке жизненного цикла", async () => {
      const { data } = await dashboard()

      expect(data.stages.window_days).toBeGreaterThan(0)
      expect(data.stages.orders_total).toBeGreaterThanOrEqual(0)
      expect(data.stages.stages.map((stage: { key: string }) => stage.key)).toEqual(
        ["accepted", "assembled", "shipped", "delivered"]
      )
      // Стадию, которую в окне никто не прошёл, отдаём как null, а не как ноль:
      // «0 мин» читалось бы как «мгновенно».
      for (const stage of data.stages.stages) {
        if (stage.orders === 0) {
          expect(stage.avg_minutes).toBeNull()
          expect(stage.max_minutes).toBeNull()
        }
      }
    })

    it("считает просрочку заказов по всей очереди", async () => {
      const { data } = await dashboard()

      expect(data.orders.overdue_count).toEqual(expect.any(Number))
      expect(data.orders.overdue_count).toBeGreaterThanOrEqual(0)
      expect(data.orders.overdue_count).toBeLessThanOrEqual(
        data.orders.open_count
      )
    })

    it("без флага юрлиц дебиторки в ответе нет вовсе", async () => {
      const { data } = await dashboard()

      expect(data.money.receivables).toBeNull()
    })

    it("с флагом юрлиц отдаёт дебиторку и срок отсрочки", async () => {
      process.env.FEATURE_COMPANIES = "true"

      const { data } = await dashboard()

      expect(data.money.receivables).toMatchObject({
        total: expect.any(Number),
        overdue: expect.any(Number),
        term_days: expect.any(Number),
        companies: expect.any(Number),
      })
    })
  },
})
